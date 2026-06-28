"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { DocumentCategory } from "@prisma/client";
import { requireCurrentUser } from "@/lib/auth-session";
import { parseDateOnly } from "@/lib/date-only";
import { prisma } from "@/lib/prisma";
import { deleteFileIfPresent, uploadFile } from "@/lib/storage";
import {
  DOCUMENT_CONTENT_TYPES,
  fileExtensionForContentType,
  isUploadLike,
  readValidatedUpload,
  type UploadLike,
} from "@/lib/upload-validation";
import type { UpdateVehicleProfileState } from "@/app/vehicle/state";

const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/;

async function persistRegistrationDocument(document: UploadLike): Promise<string> {
  const { buffer, contentType } = await readValidatedUpload(document, {
    maxBytes: MAX_DOCUMENT_BYTES,
    allowedContentTypes: DOCUMENT_CONTENT_TYPES,
    fileLabel: "Registration document",
  });

  const key = `registration/${Date.now()}-${crypto.randomUUID()}${fileExtensionForContentType(contentType)}`;
  return uploadFile(key, buffer, contentType);
}

function parseRegistrationDate(raw: string): Date | null {
  try {
    return parseDateOnly(raw);
  } catch {
    throw new Error("Registration expiration date is invalid.");
  }
}

function normalizeVin(raw: string): string | null {
  const vin = raw.trim().toUpperCase();
  if (!vin) {
    return null;
  }

  if (!VIN_PATTERN.test(vin)) {
    throw new Error("VIN must be 17 characters and cannot include I, O, or Q.");
  }

  return vin;
}

function parseRegistrationDocAction(raw: string): "ARCHIVE" | "DELETE" {
  const value = raw.trim().toUpperCase();
  if (value === "ARCHIVE") {
    return "ARCHIVE";
  }

  if (value === "DELETE") {
    return "DELETE";
  }

  throw new Error("Registration document action is invalid.");
}

function getDocumentNameFromUrl(url: string): string {
  const filename = decodeURIComponent(url.split("/").at(-1) ?? "registration-document");
  return filename.trim() || "registration-document";
}

export async function updateVehicleProfileAction(
  _prevState: UpdateVehicleProfileState,
  formData: FormData,
): Promise<UpdateVehicleProfileState> {
  "use server";
  const user = await requireCurrentUser();

  const vehicleId = String(formData.get("vehicleId") ?? "").trim();
  const vinRaw = String(formData.get("vin") ?? "").trim();
  const licensePlateRaw = String(formData.get("licensePlate") ?? "").trim().toUpperCase();
  const registrationExpiresAtRaw = String(formData.get("registrationExpiresAt") ?? "");
  const replaceRegistrationRaw = String(formData.get("replaceRegistration") ?? "").trim();
  const registrationDocActionRaw = String(formData.get("registrationDocAction") ?? "").trim();

  if (!vehicleId) {
    return {
      status: "error",
      message: "Vehicle id is missing.",
    };
  }

  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId: user.id },
    select: { id: true, userId: true, registrationDocUrl: true },
  });

  if (!vehicle) {
    return {
      status: "error",
      message: "Vehicle not found.",
    };
  }

  let registrationExpiresAt: Date | null;
  let vin: string | null;
  let registrationDocAction: "ARCHIVE" | "DELETE" = "ARCHIVE";
  const replacingRegistration =
    replaceRegistrationRaw === "1" &&
    registrationDocActionRaw.length > 0;

  try {
    registrationExpiresAt = parseRegistrationDate(registrationExpiresAtRaw);
    vin = normalizeVin(vinRaw);
    if (replacingRegistration && vehicle.registrationDocUrl) {
      registrationDocAction = parseRegistrationDocAction(registrationDocActionRaw);
    }
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Validation failed.",
    };
  }

  let registrationDocUrl: string | null | undefined;
  const maybeDocument = formData.get("registrationDoc");

  if (isUploadLike(maybeDocument) && maybeDocument.size > 0) {
    try {
      registrationDocUrl = await persistRegistrationDocument(maybeDocument);
    } catch (error) {
      return {
        status: "error",
        message: error instanceof Error ? error.message : "Registration document upload failed.",
      };
    }
  }

  if (replacingRegistration && vehicle.registrationDocUrl) {
    if (registrationDocAction === "ARCHIVE") {
      await prisma.gloveboxDocument.create({
        data: {
          userId: user.id,
          vehicleId,
          category: DocumentCategory.REGISTRATION_ARCHIVE,
          title: getDocumentNameFromUrl(vehicle.registrationDocUrl),
          fileUrl: vehicle.registrationDocUrl,
        },
      });
    }

    if (registrationDocUrl === undefined) {
      registrationDocUrl = null;
    }
  }

  const vehicleData = {
    vin,
    licensePlate: licensePlateRaw || null,
    registrationExpiresAt,
    ...(registrationDocUrl !== undefined
      ? {
          registrationDocUploadedAt: registrationDocUrl ? new Date() : null,
        }
      : {}),
    ...(registrationDocUrl !== undefined ? { registrationDocUrl } : {}),
  };

  await prisma.vehicle.update({
    where: { id: vehicleId },
    data: vehicleData,
  });
  if (
    vehicle.registrationDocUrl &&
    vehicle.registrationDocUrl !== registrationDocUrl &&
    registrationDocAction === "DELETE"
  ) {
    await deleteFileIfPresent(vehicle.registrationDocUrl);
  }

  revalidatePath(`/vehicle/${vehicleId}`);
  revalidatePath("/garage");
  revalidatePath("/glovebox");

  return {
    status: "success",
    message: "Vehicle profile updated.",
  };
}
