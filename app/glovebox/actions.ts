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
import type { GloveboxFormState } from "@/app/glovebox/state";

const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

function parseDate(raw: string): Date | null {
  try {
    return parseDateOnly(raw);
  } catch {
    throw new Error("Date is invalid.");
  }
}

function parseRequiredDate(raw: string): Date {
  const parsed = parseDate(raw);
  if (!parsed) {
    throw new Error("Date is required.");
  }
  return parsed;
}

async function ensureVehicle(userId: string, vehicleId: string): Promise<boolean> {
  if (!vehicleId) {
    return false;
  }
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId },
    select: { id: true },
  });
  return Boolean(vehicle);
}

async function persistDocument(file: UploadLike, outputFolder: string): Promise<string> {
  const { buffer, contentType } = await readValidatedUpload(file, {
    maxBytes: MAX_DOCUMENT_BYTES,
    allowedContentTypes: DOCUMENT_CONTENT_TYPES,
    fileLabel: "Document",
  });

  const key = `${outputFolder}/${Date.now()}-${crypto.randomUUID()}${fileExtensionForContentType(contentType)}`;
  return uploadFile(key, buffer, contentType);
}

function revalidateVehicleDocPaths(vehicleId: string) {
  revalidatePath("/glovebox");
  revalidatePath(`/vehicle/${vehicleId}`);
}

function revalidateGlovebox() {
  revalidatePath("/glovebox");
}

export async function updateVehicleRegistrationAction(
  _prevState: GloveboxFormState,
  formData: FormData,
): Promise<GloveboxFormState> {
  "use server";
  const user = await requireCurrentUser();

  const vehicleId = String(formData.get("vehicleId") ?? "").trim();
  const registrationExpiresAtRaw = String(formData.get("registrationExpiresAt") ?? "").trim();

  if (!vehicleId) {
    return { status: "error", message: "Vehicle id is missing." };
  }

  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId: user.id },
    select: { id: true, registrationDocUrl: true },
  });
  if (!vehicle) {
    return { status: "error", message: "Vehicle not found." };
  }

  let registrationExpiresAt: Date | null;
  try {
    registrationExpiresAt = parseDate(registrationExpiresAtRaw);
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Validation failed." };
  }

  let registrationDocUrl: string | undefined;
  const maybeRegistrationDoc = formData.get("registrationDoc");
  if (isUploadLike(maybeRegistrationDoc) && maybeRegistrationDoc.size > 0) {
    try {
      registrationDocUrl = await persistDocument(maybeRegistrationDoc, "registration");
    } catch (error) {
      return { status: "error", message: error instanceof Error ? error.message : "Upload failed." };
    }
  }

  await prisma.vehicle.update({
    where: { id: vehicleId },
    data: {
      registrationExpiresAt,
      ...(registrationDocUrl
        ? {
            registrationDocUrl,
            registrationDocUploadedAt: new Date(),
          }
        : {}),
      },
  });
  if (vehicle.registrationDocUrl && registrationDocUrl && vehicle.registrationDocUrl !== registrationDocUrl) {
    await deleteFileIfPresent(vehicle.registrationDocUrl);
  }

  revalidateVehicleDocPaths(vehicleId);
  return { status: "success", message: "Registration details updated." };
}

export async function updateVehicleInsuranceAction(
  _prevState: GloveboxFormState,
  formData: FormData,
): Promise<GloveboxFormState> {
  "use server";
  const user = await requireCurrentUser();

  const vehicleId = String(formData.get("vehicleId") ?? "").trim();
  const insuranceExpiresAtRaw = String(formData.get("insuranceExpiresAt") ?? "").trim();

  if (!vehicleId) {
    return { status: "error", message: "Vehicle id is missing." };
  }

  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId: user.id },
    select: { id: true, insuranceDocUrl: true },
  });
  if (!vehicle) {
    return { status: "error", message: "Vehicle not found." };
  }

  let insuranceExpiresAt: Date | null;
  try {
    insuranceExpiresAt = parseDate(insuranceExpiresAtRaw);
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Validation failed." };
  }

  let insuranceDocUrl: string | undefined;
  const maybeInsuranceDoc = formData.get("insuranceDoc");
  if (isUploadLike(maybeInsuranceDoc) && maybeInsuranceDoc.size > 0) {
    try {
      insuranceDocUrl = await persistDocument(maybeInsuranceDoc, "insurance");
    } catch (error) {
      return { status: "error", message: error instanceof Error ? error.message : "Upload failed." };
    }
  }

  await prisma.vehicle.update({
    where: { id: vehicleId },
    data: {
      insuranceExpiresAt,
      ...(insuranceDocUrl ? { insuranceDocUrl } : {}),
    },
  });
  if (vehicle.insuranceDocUrl && insuranceDocUrl && vehicle.insuranceDocUrl !== insuranceDocUrl) {
    await deleteFileIfPresent(vehicle.insuranceDocUrl);
  }

  revalidateVehicleDocPaths(vehicleId);
  return { status: "success", message: "Insurance details updated." };
}

export async function addInsurancePolicyAction(
  _prevState: GloveboxFormState,
  formData: FormData,
): Promise<GloveboxFormState> {
  "use server";
  const user = await requireCurrentUser();

  const providerName = String(formData.get("providerName") ?? "").trim();
  const policyId = String(formData.get("policyId") ?? "").trim();
  const expiresAtRaw = String(formData.get("expiresAt") ?? "").trim();
  const appliesMode = String(formData.get("appliesMode") ?? "").trim().toUpperCase();
  const vehicleId = String(formData.get("vehicleId") ?? "").trim();

  if (!providerName || !policyId) {
    return { status: "error", message: "Insurance provider and policy ID are required." };
  }

  let expiresAt: Date;
  try {
    expiresAt = parseRequiredDate(expiresAtRaw);
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Validation failed." };
  }

  const appliesToAll = appliesMode === "ALL";
  if (!appliesToAll && appliesMode !== "SINGLE") {
    return { status: "error", message: "Insurance applies mode is invalid." };
  }

  if (!appliesToAll && !(await ensureVehicle(user.id, vehicleId))) {
    return { status: "error", message: "Select a valid vehicle." };
  }

  let documentUrl: string | undefined;
  const maybePolicyDoc = formData.get("policyDoc");
  if (isUploadLike(maybePolicyDoc) && maybePolicyDoc.size > 0) {
    try {
      documentUrl = await persistDocument(maybePolicyDoc, "insurance");
    } catch (error) {
      return { status: "error", message: error instanceof Error ? error.message : "Upload failed." };
    }
  }

  await prisma.insurancePolicy.create({
    data: {
      userId: user.id,
      providerName,
      policyId,
      expiresAt,
      appliesToAll,
      documentUrl,
      ...(appliesToAll
        ? {}
        : {
            vehicles: {
              create: { vehicleId },
            },
          }),
    },
  });

  revalidateGlovebox();
  return { status: "success", message: "Insurance policy added." };
}

export async function updateVehicleDocumentSetAction(
  _prevState: GloveboxFormState,
  formData: FormData,
): Promise<GloveboxFormState> {
  "use server";
  const user = await requireCurrentUser();

  const vehicleId = String(formData.get("vehicleId") ?? "").trim();
  const registrationExpiresAtRaw = String(formData.get("registrationExpiresAt") ?? "").trim();
  const insuranceExpiresAtRaw = String(formData.get("insuranceExpiresAt") ?? "").trim();

  if (!vehicleId) {
    return { status: "error", message: "Vehicle id is missing." };
  }

  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId: user.id },
    select: { id: true, registrationDocUrl: true, insuranceDocUrl: true },
  });
  if (!vehicle) {
    return { status: "error", message: "Vehicle not found." };
  }

  let registrationExpiresAt: Date | null;
  let insuranceExpiresAt: Date | null;
  try {
    registrationExpiresAt = parseDate(registrationExpiresAtRaw);
    insuranceExpiresAt = parseDate(insuranceExpiresAtRaw);
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Validation failed." };
  }

  let registrationDocUrl: string | undefined;
  const maybeRegistrationDoc = formData.get("registrationDoc");
  if (isUploadLike(maybeRegistrationDoc) && maybeRegistrationDoc.size > 0) {
    try {
      registrationDocUrl = await persistDocument(maybeRegistrationDoc, "registration");
    } catch (error) {
      return { status: "error", message: error instanceof Error ? error.message : "Upload failed." };
    }
  }

  let insuranceDocUrl: string | undefined;
  const maybeInsuranceDoc = formData.get("insuranceDoc");
  if (isUploadLike(maybeInsuranceDoc) && maybeInsuranceDoc.size > 0) {
    try {
      insuranceDocUrl = await persistDocument(maybeInsuranceDoc, "insurance");
    } catch (error) {
      return { status: "error", message: error instanceof Error ? error.message : "Upload failed." };
    }
  }

  await prisma.vehicle.update({
    where: { id: vehicleId },
    data: {
      registrationExpiresAt,
      insuranceExpiresAt,
      ...(registrationDocUrl
        ? {
            registrationDocUrl,
            registrationDocUploadedAt: new Date(),
          }
        : {}),
      ...(insuranceDocUrl ? { insuranceDocUrl } : {}),
    },
  });
  if (vehicle.registrationDocUrl && registrationDocUrl && vehicle.registrationDocUrl !== registrationDocUrl) {
    await deleteFileIfPresent(vehicle.registrationDocUrl);
  }
  if (vehicle.insuranceDocUrl && insuranceDocUrl && vehicle.insuranceDocUrl !== insuranceDocUrl) {
    await deleteFileIfPresent(vehicle.insuranceDocUrl);
  }

  revalidateVehicleDocPaths(vehicleId);

  return { status: "success", message: "Glovebox vehicle docs updated." };
}

function parseDocumentCategory(value: string): DocumentCategory {
  if (value === "SERVICE_MANUAL") {
    return DocumentCategory.SERVICE_MANUAL;
  }

  if (value === "WARRANTY") {
    return DocumentCategory.WARRANTY;
  }

  if (value === "INSPECTION_REPORT") {
    return DocumentCategory.INSPECTION_REPORT;
  }

  if (value === "PURCHASE_FINANCE") {
    return DocumentCategory.PURCHASE_FINANCE;
  }

  if (value === "MISC") {
    return DocumentCategory.MISC;
  }

  throw new Error("Document category is invalid.");
}

export async function addGloveboxDocumentAction(
  _prevState: GloveboxFormState,
  formData: FormData,
): Promise<GloveboxFormState> {
  "use server";
  const user = await requireCurrentUser();

  const vehicleId = String(formData.get("vehicleId") ?? "").trim();
  const documentNotVehicleSpecific = String(formData.get("documentNotVehicleSpecific") ?? "").trim() === "1";
  const title = String(formData.get("title") ?? "").trim();
  const categoryRaw = String(formData.get("category") ?? "").trim();

  if (!title || !categoryRaw) {
    return { status: "error", message: "Title and category are required." };
  }

  if (!documentNotVehicleSpecific && !(await ensureVehicle(user.id, vehicleId))) {
    return { status: "error", message: "Vehicle not found." };
  }

  let category: DocumentCategory;
  try {
    category = parseDocumentCategory(categoryRaw);
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Validation failed." };
  }

  const maybeDoc = formData.get("document");
  if (!isUploadLike(maybeDoc) || maybeDoc.size === 0) {
    return { status: "error", message: "Document file is required." };
  }

  let fileUrl: string;
  try {
    let folder = "misc";
    if (category === DocumentCategory.SERVICE_MANUAL) {
      folder = "manuals";
    } else if (category === DocumentCategory.WARRANTY) {
      folder = "warranty";
    } else if (category === DocumentCategory.INSPECTION_REPORT) {
      folder = "inspections";
    } else if (category === DocumentCategory.PURCHASE_FINANCE) {
      folder = "ownership";
    }
    fileUrl = await persistDocument(maybeDoc, folder);
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Upload failed." };
  }

  await prisma.gloveboxDocument.create({
    data: {
      userId: user.id,
      vehicleId: documentNotVehicleSpecific ? null : vehicleId,
      category,
      title,
      fileUrl,
    },
  });

  revalidatePath("/glovebox");

  return { status: "success", message: "Document added to glovebox." };
}

export async function deleteGloveboxDocumentAction(formData: FormData): Promise<void> {
  "use server";
  const user = await requireCurrentUser();

  const documentId = String(formData.get("documentId") ?? "").trim();
  if (!documentId) {
    return;
  }

  const document = await prisma.gloveboxDocument.findFirst({
    where: { id: documentId, userId: user.id },
    select: { fileUrl: true },
  });
  await prisma.gloveboxDocument.deleteMany({
    where: { id: documentId, userId: user.id },
  });
  await deleteFileIfPresent(document?.fileUrl ?? null);

  revalidatePath("/glovebox");
}

export async function deleteVehicleRegistrationDocAction(formData: FormData): Promise<void> {
  "use server";
  const user = await requireCurrentUser();

  const vehicleId = String(formData.get("vehicleId") ?? "").trim();
  if (!vehicleId) {
    return;
  }

  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId: user.id },
    select: { registrationDocUrl: true },
  });
  await prisma.vehicle.updateMany({
    where: { id: vehicleId, userId: user.id },
    data: {
      registrationDocUrl: null,
      registrationDocUploadedAt: null,
    },
  });
  await deleteFileIfPresent(vehicle?.registrationDocUrl ?? null);

  revalidatePath("/glovebox");
  revalidatePath(`/vehicle/${vehicleId}`);
}

export async function deleteInsurancePolicyDocumentAction(formData: FormData): Promise<void> {
  "use server";
  const user = await requireCurrentUser();

  const policyId = String(formData.get("policyId") ?? "").trim();
  if (!policyId) {
    return;
  }

  const policy = await prisma.insurancePolicy.findFirst({
    where: { id: policyId, userId: user.id },
    select: { documentUrl: true },
  });
  await prisma.insurancePolicy.updateMany({
    where: { id: policyId, userId: user.id },
    data: { documentUrl: null },
  });
  await deleteFileIfPresent(policy?.documentUrl ?? null);

  revalidatePath("/glovebox");
}

export async function deleteReceiptDocumentAction(formData: FormData): Promise<void> {
  "use server";
  const user = await requireCurrentUser();

  const maintenanceId = String(formData.get("maintenanceId") ?? "").trim();
  if (!maintenanceId) {
    return;
  }

  const maintenance = await prisma.maintenance.findFirst({
    where: { id: maintenanceId, vehicle: { userId: user.id } },
    select: { receiptUrl: true },
  });
  await prisma.maintenance.updateMany({
    where: { id: maintenanceId, vehicle: { userId: user.id } },
    data: { receiptUrl: null },
  });
  await deleteFileIfPresent(maintenance?.receiptUrl ?? null);

  revalidatePath("/glovebox");
  revalidatePath("/maintenance");
}
