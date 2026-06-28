"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/auth-session";
import { deleteFileIfPresent, uploadFile } from "@/lib/storage";
import { toVehicleTitleCase } from "@/lib/vehicle-display";
import { decodeVinVehicle } from "@/lib/vin-decode";
import { getActivationState } from "@/lib/activation";
import { canUseVehicleKind, getVehicleAllowance, vehicleKindUpgradeMessage } from "@/lib/billing";
import { parseVehicleKind } from "@/lib/vehicle-kind";
import {
  fileExtensionForContentType,
  IMAGE_CONTENT_TYPES,
  isUploadLike,
  readValidatedUpload,
  type UploadLike,
} from "@/lib/upload-validation";
import type { AddVehicleFormState } from "@/app/garage/state";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function parseVehicleYear(raw: string): number | null {
  const parsed = Number.parseInt(raw, 10);
  const currentYear = new Date().getFullYear();

  if (!Number.isFinite(parsed) || parsed < 1900 || parsed > currentYear + 1) {
    return null;
  }

  return parsed;
}

async function persistVehicleImage(image: UploadLike): Promise<string> {
  const { buffer, contentType } = await readValidatedUpload(image, {
    maxBytes: MAX_IMAGE_BYTES,
    allowedContentTypes: IMAGE_CONTENT_TYPES,
    fileLabel: "Vehicle image",
  });

  const key = `vehicles/${Date.now()}-${crypto.randomUUID()}${fileExtensionForContentType(contentType)}`;
  return uploadFile(key, buffer, contentType);
}

export async function addVehicleAction(
  _prevState: AddVehicleFormState,
  formData: FormData,
): Promise<AddVehicleFormState> {
  "use server";
  const user = await requireCurrentUser();

  const kind = parseVehicleKind(String(formData.get("kind") ?? ""));
  const vinRaw = String(formData.get("vin") ?? "").trim();
  const yearRaw = String(formData.get("year") ?? "").trim();
  const make = String(formData.get("make") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const trimRaw = String(formData.get("trim") ?? "").trim();
  const vinProvided = Boolean(vinRaw);

  let year: number;
  let resolvedKind = kind;
  let resolvedMake: string;
  let resolvedModel: string;
  let resolvedVin: string | null = null;
  let resolvedDrivetrain: string | null = null;
  let resolvedTrim: string | null = trimRaw || null;

  if (vinProvided) {
    try {
      const decoded = await decodeVinVehicle(vinRaw);
      resolvedKind = decoded.kind;
      year = decoded.year;
      resolvedMake = toVehicleTitleCase(decoded.make);
      resolvedModel = toVehicleTitleCase(decoded.model);
      resolvedVin = decoded.vin;
      resolvedDrivetrain = decoded.drivetrain;

      if (!resolvedTrim) {
        resolvedTrim = decoded.preferredTrim ?? null;
      }
    } catch (error) {
      return {
        status: "error",
        message: error instanceof Error ? error.message : "VIN lookup failed.",
        nextAction: null,
      };
    }
  } else {
    if (!yearRaw || !make || !model) {
      return {
        status: "error",
        message: "Enter a VIN, or provide year, make, and model manually.",
        nextAction: null,
      };
    }

    const parsedYear = parseVehicleYear(yearRaw);
    if (parsedYear === null) {
      return {
        status: "error",
        message: "Enter a valid model year.",
        nextAction: null,
      };
    }

    year = parsedYear;
    resolvedMake = toVehicleTitleCase(make);
    resolvedModel = toVehicleTitleCase(model);
  }

  const [existingVehicleCount, allowance] = await Promise.all([
    prisma.vehicle.count({
      where: { userId: user.id },
    }),
    getVehicleAllowance(user.id),
  ]);

  if (!canUseVehicleKind(allowance.planTier, resolvedKind)) {
    return {
      status: "error",
      message: vehicleKindUpgradeMessage(resolvedKind),
      nextAction: null,
    };
  }

  if (existingVehicleCount >= allowance.maxVehicles) {
    return {
      status: "error",
      message: `Your ${allowance.planLabel} plan allows up to ${allowance.maxVehicles} vehicle${allowance.maxVehicles === 1 ? "" : "s"}.`,
      nextAction: null,
    };
  }

  let imageUrl: string | undefined;
  const maybeImage = formData.get("image");

  if (isUploadLike(maybeImage) && maybeImage.size > 0) {
    try {
      imageUrl = await persistVehicleImage(maybeImage);
    } catch (error) {
      return {
        status: "error",
        message: error instanceof Error ? error.message : "Image upload failed.",
        nextAction: null,
      };
    }
  }

  let createdVehicleId: string | null = null;
  try {
    const vehicle = await prisma.vehicle.create({
      data: {
        userId: user.id,
        kind: resolvedKind,
        year,
        make: resolvedMake,
        model: resolvedModel,
        trim: resolvedTrim,
        drivetrain: resolvedDrivetrain,
        vin: resolvedVin,
        imageUrl,
      },
    });
    createdVehicleId = vehicle.id;
  } catch {
    await deleteFileIfPresent(imageUrl);
    return {
      status: "error",
      message: "Vehicle could not be added. Please try again.",
      nextAction: null,
    };
  }

  const activation = await getActivationState(user.id);
  const nextAction = activation.nextStep?.action ?? null;

  revalidatePath("/garage");
  revalidatePath("/home");
  revalidatePath("/glovebox");
  if (createdVehicleId) {
    revalidatePath(`/vehicle/${createdVehicleId}`);
  }

  return {
    status: "success",
    message: nextAction ? `Vehicle added to Garage. Next up: ${nextAction.label.toLowerCase()}.` : "Vehicle added to Garage.",
    nextAction,
  };
}

export async function updateVehicleImageAction(
  _prevState: AddVehicleFormState,
  formData: FormData,
): Promise<AddVehicleFormState> {
  "use server";
  const user = await requireCurrentUser();

  const vehicleId = String(formData.get("vehicleId") ?? "").trim();
  if (!vehicleId) {
    return { status: "error", message: "Vehicle is required.", nextAction: null };
  }

  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId: user.id },
    select: { id: true, imageUrl: true },
  });
  if (!vehicle) {
    return { status: "error", message: "Vehicle not found.", nextAction: null };
  }

  const maybeImage = formData.get("image");
  if (!isUploadLike(maybeImage) || maybeImage.size === 0) {
    return { status: "error", message: "Choose an image to upload.", nextAction: null };
  }

  let imageUrl: string;
  try {
    imageUrl = await persistVehicleImage(maybeImage);
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Image upload failed.", nextAction: null };
  }

  await prisma.vehicle.update({
    where: { id: vehicleId },
    data: { imageUrl },
  });
  if (vehicle.imageUrl && vehicle.imageUrl !== imageUrl) {
    await deleteFileIfPresent(vehicle.imageUrl);
  }

  revalidatePath("/garage");
  revalidatePath(`/vehicle/${vehicleId}`);

  return { status: "success", message: "Vehicle photo updated.", nextAction: null };
}
