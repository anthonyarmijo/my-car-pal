"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/lib/auth-session";
import { canUseVehicleKind, getVehicleAllowance, vehicleKindUpgradeMessage } from "@/lib/billing";
import { parseDateOnly } from "@/lib/date-only";
import {
  computeScheduleServiceDueDate,
  importedScheduleFallbackMessage,
  inferScheduleServiceKeyForVehicle,
  isImportedScheduleSupported,
  isScheduleServiceKeyForVehicle,
} from "@/lib/maintenance-schedule";
import { prisma } from "@/lib/prisma";
import { deleteFileIfPresent, uploadFile } from "@/lib/storage";
import {
  DOCUMENT_CONTENT_TYPES,
  fileExtensionForContentType,
  isUploadLike,
  readValidatedUpload,
  type UploadLike,
} from "@/lib/upload-validation";
import type { MaintenanceFormState, RecalculateAllState } from "@/app/maintenance/state";

const MAX_RECEIPT_BYTES = 10 * 1024 * 1024;

type ParsedMaintenancePayload = {
  vehicleId: string;
  title: string;
  odometer: number;
  cost: number | null;
  provider: string;
  serviceDate: Date;
  notes: string | null;
};

function parseDate(raw: string, fieldName: string): Date {
  const value = raw.trim();
  if (!value) {
    throw new Error(`${fieldName} is invalid.`);
  }

  try {
    const parsed = parseDateOnly(value);
    if (!parsed) {
      throw new Error();
    }
    return parsed;
  } catch {
    throw new Error(`${fieldName} is invalid.`);
  }
}

function parseOptionalDate(raw: string): Date | null {
  try {
    return parseDateOnly(raw);
  } catch {
    throw new Error("Date is invalid.");
  }
}

function normalizeProvider(providerModeRaw: string, providerShopNameRaw: string): string {
  const providerMode = providerModeRaw.trim().toUpperCase();
  const shopName = providerShopNameRaw.trim();

  if (providerMode === "DIY") {
    return "DIY";
  }

  if (providerMode === "SHOP") {
    if (!shopName) {
      throw new Error("Repair shop name is required when provider is Repair shop.");
    }
    return shopName;
  }

  throw new Error("Provider is invalid.");
}

function parseOptionalCost(raw: string): number | null {
  const value = raw.trim();
  if (!value) {
    return null;
  }

  const cost = Number.parseFloat(value);
  if (!Number.isFinite(cost) || cost < 0) {
    throw new Error("Cost must be a valid non-negative number.");
  }

  return cost;
}

function parseOptionalPositiveInt(raw: string, fieldLabel: string): number | null {
  const value = raw.trim();
  if (!value) {
    return null;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${fieldLabel} must be a positive whole number.`);
  }
  return parsed;
}

function parseMaintenancePayload(formData: FormData): ParsedMaintenancePayload {
  const vehicleId = String(formData.get("vehicleId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const odometerRaw = String(formData.get("odometer") ?? "").trim();
  const costRaw = String(formData.get("cost") ?? "").trim();
  const providerModeRaw = String(formData.get("providerMode") ?? "").trim();
  const providerShopNameRaw = String(formData.get("providerShopName") ?? "").trim();
  const serviceDateRaw = String(formData.get("serviceDate") ?? "").trim();
  const notesRaw = String(formData.get("notes") ?? "").trim();

  if (!vehicleId || !title || !odometerRaw || !serviceDateRaw) {
    throw new Error("Vehicle, service title, odometer, and date are required.");
  }

  const odometer = Number.parseInt(odometerRaw, 10);
  if (!Number.isFinite(odometer) || odometer < 0) {
    throw new Error("Odometer must be a valid non-negative number.");
  }

  return {
    vehicleId,
    title,
    odometer,
    cost: parseOptionalCost(costRaw),
    provider: normalizeProvider(providerModeRaw, providerShopNameRaw),
    serviceDate: parseDate(serviceDateRaw, "Service date"),
    notes: notesRaw || null,
  };
}

async function persistReceipt(file: UploadLike): Promise<string> {
  const { buffer, contentType } = await readValidatedUpload(file, {
    maxBytes: MAX_RECEIPT_BYTES,
    allowedContentTypes: DOCUMENT_CONTENT_TYPES,
    fileLabel: "Receipt",
  });

  const key = `receipts/${Date.now()}-${crypto.randomUUID()}${fileExtensionForContentType(contentType)}`;
  return uploadFile(key, buffer, contentType);
}

async function vehicleExists(userId: string, vehicleId: string): Promise<boolean> {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId },
    select: { id: true },
  });
  return Boolean(vehicle);
}

export async function addMaintenanceAction(
  _prevState: MaintenanceFormState,
  formData: FormData,
): Promise<MaintenanceFormState> {
  "use server";
  const user = await requireCurrentUser();

  let payload: ParsedMaintenancePayload;
  try {
    payload = parseMaintenancePayload(formData);
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Validation failed." };
  }

  if (!(await vehicleExists(user.id, payload.vehicleId))) {
    return { status: "error", message: "Selected vehicle no longer exists." };
  }

  let receiptUrl: string | undefined;
  const maybeReceipt = formData.get("receipt");
  if (isUploadLike(maybeReceipt) && maybeReceipt.size > 0) {
    try {
      receiptUrl = await persistReceipt(maybeReceipt);
    } catch (error) {
      return {
        status: "error",
        message: error instanceof Error ? error.message : "Receipt upload failed.",
      };
    }
  }

  await prisma.maintenance.create({
    data: {
      vehicleId: payload.vehicleId,
      title: payload.title,
      odometer: payload.odometer,
      cost: payload.cost,
      provider: payload.provider,
      serviceDate: payload.serviceDate,
      notes: payload.notes,
      receiptUrl,
    },
  });

  revalidatePath("/maintenance");
  revalidatePath("/home");
  revalidatePath("/glovebox");
  revalidatePath(`/vehicle/${payload.vehicleId}`);

  return { status: "success", message: "Service record added." };
}

export async function updateMaintenanceAction(
  _prevState: MaintenanceFormState,
  formData: FormData,
): Promise<MaintenanceFormState> {
  "use server";
  const user = await requireCurrentUser();

  const maintenanceId = String(formData.get("maintenanceId") ?? "").trim();
  if (!maintenanceId) {
    return { status: "error", message: "Maintenance id is missing." };
  }

  const existing = await prisma.maintenance.findFirst({
    where: { id: maintenanceId, vehicle: { userId: user.id } },
    select: { id: true, vehicleId: true, receiptUrl: true },
  });

  if (!existing) {
    return { status: "error", message: "Service record not found." };
  }

  let payload: ParsedMaintenancePayload;
  try {
    payload = parseMaintenancePayload(formData);
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Validation failed." };
  }

  if (!(await vehicleExists(user.id, payload.vehicleId))) {
    return { status: "error", message: "Selected vehicle no longer exists." };
  }

  let receiptUrl: string | undefined;
  const maybeReceipt = formData.get("receipt");
  if (isUploadLike(maybeReceipt) && maybeReceipt.size > 0) {
    try {
      receiptUrl = await persistReceipt(maybeReceipt);
    } catch (error) {
      return {
        status: "error",
        message: error instanceof Error ? error.message : "Receipt upload failed.",
      };
    }
  }

  await prisma.maintenance.update({
    where: { id: maintenanceId },
    data: {
      vehicleId: payload.vehicleId,
      title: payload.title,
      odometer: payload.odometer,
      cost: payload.cost,
      provider: payload.provider,
      serviceDate: payload.serviceDate,
      notes: payload.notes,
      ...(receiptUrl ? { receiptUrl } : {}),
    },
  });
  if (existing.receiptUrl && receiptUrl && existing.receiptUrl !== receiptUrl) {
    await deleteFileIfPresent(existing.receiptUrl);
  }

  revalidatePath("/maintenance");
  revalidatePath(`/maintenance/${maintenanceId}`);
  revalidatePath("/home");
  revalidatePath("/glovebox");
  revalidatePath(`/vehicle/${existing.vehicleId}`);
  revalidatePath(`/vehicle/${payload.vehicleId}`);

  return { status: "success", message: "Service record updated." };
}

export async function deleteMaintenanceAction(formData: FormData): Promise<void> {
  "use server";
  const user = await requireCurrentUser();

  const maintenanceId = String(formData.get("maintenanceId") ?? "").trim();
  if (!maintenanceId) {
    return;
  }

  const entry = await prisma.maintenance.findFirst({
    where: { id: maintenanceId, vehicle: { userId: user.id } },
    select: { id: true, vehicleId: true, receiptUrl: true },
  });
  if (!entry) {
    return;
  }

  await prisma.maintenance.delete({
    where: { id: entry.id },
  });
  await deleteFileIfPresent(entry.receiptUrl);

  revalidatePath("/maintenance");
  revalidatePath("/home");
  revalidatePath("/glovebox");
  revalidatePath(`/vehicle/${entry.vehicleId}`);
}

export async function addReminderAction(
  _prevState: MaintenanceFormState,
  formData: FormData,
): Promise<MaintenanceFormState> {
  "use server";
  const user = await requireCurrentUser();

  const vehicleId = String(formData.get("vehicleId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const dueDateRaw = String(formData.get("dueDate") ?? "").trim();
  const notesRaw = String(formData.get("notes") ?? "").trim();
  const frequencyYearsRaw = String(formData.get("frequencyYears") ?? "").trim();
  const frequencyMilesRaw = String(formData.get("frequencyMiles") ?? "").trim();

  if (!vehicleId || !title || !dueDateRaw) {
    return { status: "error", message: "Vehicle, reminder title, and due date are required." };
  }

  if (!(await vehicleExists(user.id, vehicleId))) {
    return { status: "error", message: "Selected vehicle no longer exists." };
  }

  let dueDate: Date;
  let frequencyYears: number | null;
  let frequencyMiles: number | null;
  try {
    dueDate = parseDate(dueDateRaw, "Due date");
    frequencyYears = parseOptionalPositiveInt(frequencyYearsRaw, "Frequency years");
    frequencyMiles = parseOptionalPositiveInt(frequencyMilesRaw, "Frequency miles");
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Validation failed." };
  }

  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId: user.id },
    select: { currentOdometer: true },
  });
  if (!vehicle) {
    return { status: "error", message: "Selected vehicle no longer exists." };
  }

  await prisma.reminder.create({
    data: {
      vehicleId,
      title,
      dueDate,
      frequencyYears,
      frequencyMiles,
      frequencyBaseDate: frequencyYears || frequencyMiles ? dueDate : null,
      frequencyBaseOdometer: frequencyYears || frequencyMiles ? vehicle.currentOdometer ?? 0 : null,
      notes: notesRaw || null,
    },
  });

  revalidatePath("/maintenance");
  revalidatePath("/home");

  return { status: "success", message: "Manual reminder added." };
}

export async function importRecommendedScheduleAction(
  _prevState: MaintenanceFormState,
  formData: FormData,
): Promise<MaintenanceFormState> {
  "use server";
  const user = await requireCurrentUser();

  const vehicleId = String(formData.get("vehicleId") ?? "").trim();
  if (!vehicleId) {
    return { status: "error", message: "Vehicle is required." };
  }

  if (!(await vehicleExists(user.id, vehicleId))) {
    return { status: "error", message: "Selected vehicle no longer exists." };
  }

  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId: user.id },
    select: { id: true, kind: true, year: true, make: true, model: true, drivetrain: true, currentOdometer: true },
  });
  if (!vehicle) {
    return { status: "error", message: "Selected vehicle no longer exists." };
  }

  const allowance = await getVehicleAllowance(user.id);
  if (!canUseVehicleKind(allowance.planTier, vehicle.kind)) {
    return { status: "error", message: vehicleKindUpgradeMessage(vehicle.kind) };
  }

  if (!isImportedScheduleSupported(vehicle)) {
    return { status: "error", message: importedScheduleFallbackMessage(vehicle) };
  }

  await prisma.serviceScheduleImport.upsert({
    where: { vehicleId },
    update: {},
    create: { vehicleId },
  });

  revalidatePath("/maintenance");
  revalidatePath("/home");

  return {
    status: "success",
    message:
      vehicle.kind === "MOTORCYCLE"
        ? "Motorcycle schedule imported. Upcoming dates now follow curated owner-manual intervals plus your service history."
        : "Recommended service schedule imported. Upcoming dates are estimated from mileage + service history.",
  };
}

type VehicleSnapshot = {
  id: string;
  kind: "CAR" | "MOTORCYCLE";
  year: number;
  make: string;
  model: string;
  drivetrain: string | null;
  currentOdometer: number | null;
};

async function getVehicleWithHistory(userId: string, vehicleId: string): Promise<{
  vehicle: VehicleSnapshot;
  history: Array<{ title: string; odometer: number; serviceDate: Date }>;
} | null> {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId },
    select: { id: true, kind: true, year: true, make: true, model: true, drivetrain: true, currentOdometer: true },
  });
  if (!vehicle) {
    return null;
  }

  const history = await prisma.maintenance.findMany({
    where: { vehicleId, vehicle: { userId } },
    select: { title: true, odometer: true, serviceDate: true },
    orderBy: { serviceDate: "desc" },
    take: 400,
  });

  return { vehicle, history };
}

function estimateMonthlyMileageFromHistory(
  history: Array<{ odometer: number; serviceDate: Date }>,
  fallbackMileage: number,
  fallbackYear: number,
): number {
  const ordered = [...history].sort((a, b) => a.serviceDate.getTime() - b.serviceDate.getTime());
  if (ordered.length >= 2) {
    const first = ordered[0];
    const last = ordered[ordered.length - 1];
    const months = (last.serviceDate.getTime() - first.serviceDate.getTime()) / (1000 * 60 * 60 * 24 * 30.4375);
    const miles = last.odometer - first.odometer;
    if (months >= 1 && miles > 0) {
      return Math.min(Math.max(miles / months, 300), 3000);
    }
  }

  if (fallbackMileage > 0) {
    const now = new Date();
    const baseline = new Date(Date.UTC(fallbackYear, 0, 1));
    const months = Math.max((now.getTime() - baseline.getTime()) / (1000 * 60 * 60 * 24 * 30.4375), 1);
    return Math.min(Math.max(fallbackMileage / months, 350), 3000);
  }

  return 1000;
}

function computeReminderRecurringDueDate(
  reminder: {
    dueDate: Date;
    frequencyYears: number | null;
    frequencyMiles: number | null;
    frequencyBaseDate: Date | null;
    frequencyBaseOdometer: number | null;
  },
  vehicleData: { vehicle: VehicleSnapshot; history: Array<{ odometer: number; serviceDate: Date }> },
  now: Date,
): Date | null {
  if (!reminder.frequencyYears && !reminder.frequencyMiles) {
    return null;
  }

  const baseDate = reminder.frequencyBaseDate ?? reminder.dueDate;
  const baseOdometer = reminder.frequencyBaseOdometer ?? vehicleData.vehicle.currentOdometer ?? 0;

  let byYears: Date | null = null;
  if (reminder.frequencyYears) {
    byYears = new Date(baseDate);
    byYears.setFullYear(byYears.getFullYear() + reminder.frequencyYears);
  }

  let byMiles: Date | null = null;
  if (reminder.frequencyMiles) {
    const current = vehicleData.vehicle.currentOdometer ?? baseOdometer;
    const remaining = baseOdometer + reminder.frequencyMiles - current;
    if (remaining <= 0) {
      byMiles = now;
    } else {
      const monthlyMiles = estimateMonthlyMileageFromHistory(
        vehicleData.history,
        vehicleData.vehicle.currentOdometer ?? 0,
        vehicleData.vehicle.year,
      );
      const monthsToDue = Math.max(Math.ceil(remaining / monthlyMiles), 1);
      byMiles = new Date(now);
      byMiles.setMonth(byMiles.getMonth() + monthsToDue);
    }
  }

  return byYears && byMiles ? (byYears.getTime() <= byMiles.getTime() ? byYears : byMiles) : byYears ?? byMiles;
}

export async function updateReminderDueDateAction(formData: FormData): Promise<void> {
  "use server";
  const user = await requireCurrentUser();

  const reminderId = String(formData.get("reminderId") ?? "").trim();
  const dueDateRaw = String(formData.get("dueDate") ?? "").trim();
  const dueDate = parseOptionalDate(dueDateRaw);

  if (!reminderId || !dueDate) {
    return;
  }

  const reminder = await prisma.reminder.findFirst({
    where: { id: reminderId, vehicle: { userId: user.id } },
    select: { id: true },
  });
  if (!reminder) {
    return;
  }
  await prisma.reminder.update({
    where: { id: reminder.id },
    data: { dueDate },
  });

  revalidatePath("/maintenance");
}

export async function autoCalculateReminderDueDateAction(formData: FormData): Promise<void> {
  "use server";
  const user = await requireCurrentUser();

  const reminderId = String(formData.get("reminderId") ?? "").trim();
  if (!reminderId) {
    return;
  }

  const reminder = await prisma.reminder.findUnique({
    where: { id: reminderId },
    select: {
      id: true,
      title: true,
      vehicleId: true,
      dueDate: true,
      frequencyYears: true,
      frequencyMiles: true,
      frequencyBaseDate: true,
      frequencyBaseOdometer: true,
      vehicle: { select: { userId: true } },
    },
  });
  if (!reminder || reminder.vehicle.userId !== user.id) {
    return;
  }

  const vehicleData = await getVehicleWithHistory(user.id, reminder.vehicleId);
  if (!vehicleData) {
    return;
  }

  const now = new Date();
  let computedDueDate: Date | null = computeReminderRecurringDueDate(reminder, vehicleData, now);
  if (!computedDueDate) {
    const key = inferScheduleServiceKeyForVehicle(vehicleData.vehicle, reminder.title);
    if (key) {
      computedDueDate = computeScheduleServiceDueDate(vehicleData.vehicle, key, vehicleData.history)?.dueDate ?? null;
    }
  }

  if (!computedDueDate) {
    return;
  }

  await prisma.reminder.update({
    where: { id: reminderId },
    data: { dueDate: computedDueDate },
  });

  revalidatePath("/maintenance");
}

export async function updateScheduleOverrideDueDateAction(formData: FormData): Promise<void> {
  "use server";
  const user = await requireCurrentUser();

  const vehicleId = String(formData.get("vehicleId") ?? "").trim();
  const serviceKey = String(formData.get("serviceKey") ?? "").trim();
  const dueDateRaw = String(formData.get("dueDate") ?? "").trim();
  const dueDate = parseOptionalDate(dueDateRaw);

  if (!vehicleId || !serviceKey || !dueDate) {
    return;
  }
  if (!(await vehicleExists(user.id, vehicleId))) {
    return;
  }

  await prisma.serviceScheduleOverride.upsert({
    where: { vehicleId_serviceKey: { vehicleId, serviceKey } },
    update: { dueDate },
    create: {
      vehicleId,
      serviceKey,
      dueDate,
    },
  });

  revalidatePath("/maintenance");
}

export async function autoCalculateScheduleOverrideDueDateAction(formData: FormData): Promise<void> {
  "use server";
  const user = await requireCurrentUser();

  const vehicleId = String(formData.get("vehicleId") ?? "").trim();
  const serviceKey = String(formData.get("serviceKey") ?? "").trim();

  if (!vehicleId || !serviceKey) {
    return;
  }

  const vehicleData = await getVehicleWithHistory(user.id, vehicleId);
  if (!vehicleData) {
    return;
  }

  if (!isScheduleServiceKeyForVehicle(vehicleData.vehicle, serviceKey)) {
    return;
  }

  const next = computeScheduleServiceDueDate(vehicleData.vehicle, serviceKey, vehicleData.history);
  if (!next) {
    return;
  }

  await prisma.serviceScheduleOverride.upsert({
    where: { vehicleId_serviceKey: { vehicleId, serviceKey } },
    update: { dueDate: next.dueDate },
    create: {
      vehicleId,
      serviceKey,
      dueDate: next.dueDate,
    },
  });

  revalidatePath("/maintenance");
}

export async function recalculateAllUpcomingAction(
  _prevState: RecalculateAllState,
  _formData: FormData,
): Promise<RecalculateAllState> {
  "use server";
  const user = await requireCurrentUser();

  const reminders = await prisma.reminder.findMany({
    where: { completedAt: null, vehicle: { userId: user.id } },
    select: {
      id: true,
      vehicleId: true,
      title: true,
      dueDate: true,
      frequencyYears: true,
      frequencyMiles: true,
      frequencyBaseDate: true,
      frequencyBaseOdometer: true,
    },
  });

  const vehicleIds = Array.from(new Set(reminders.map((item) => item.vehicleId)));
  const vehicles = await prisma.vehicle.findMany({
    where: { id: { in: vehicleIds }, userId: user.id },
    select: { id: true, kind: true, year: true, make: true, model: true, drivetrain: true, currentOdometer: true },
  });
  const vehicleById = new Map(vehicles.map((vehicle) => [vehicle.id, vehicle]));

  const history = await prisma.maintenance.findMany({
    where: { vehicleId: { in: vehicleIds }, vehicle: { userId: user.id } },
    select: { vehicleId: true, title: true, odometer: true, serviceDate: true },
    orderBy: { serviceDate: "desc" },
    take: 1200,
  });
  const historyByVehicle = history.reduce<Record<string, Array<{ title: string; odometer: number; serviceDate: Date }>>>(
    (acc, item) => {
      if (!acc[item.vehicleId]) {
        acc[item.vehicleId] = [];
      }
      acc[item.vehicleId].push({
        title: item.title,
        odometer: item.odometer,
        serviceDate: item.serviceDate,
      });
      return acc;
    },
    {},
  );

  let updatedCount = 0;
  const now = new Date();

  for (const reminder of reminders) {
    const vehicle = vehicleById.get(reminder.vehicleId);
    if (!vehicle) {
      continue;
    }
    const recurringDueDate = computeReminderRecurringDueDate(
      reminder,
      { vehicle, history: historyByVehicle[vehicle.id] ?? [] },
      now,
    );
    const key = inferScheduleServiceKeyForVehicle(vehicle, reminder.title);
    const nextDate =
      recurringDueDate ?? (key ? computeScheduleServiceDueDate(vehicle, key, historyByVehicle[vehicle.id] ?? [])?.dueDate ?? null : null);
    if (!nextDate) {
      continue;
    }

    if (Math.abs(nextDate.getTime() - reminder.dueDate.getTime()) < 1000) {
      continue;
    }

    await prisma.reminder.update({
      where: { id: reminder.id },
      data: { dueDate: nextDate },
    });
    updatedCount += 1;
  }

  const deletedOverrides = await prisma.serviceScheduleOverride.deleteMany({
    where: {
      vehicle: { userId: user.id },
    },
  });
  revalidatePath("/maintenance");
  revalidatePath("/home");

  const totalChanged = updatedCount + deletedOverrides.count;
  if (totalChanged === 0) {
    return { status: "success", message: "No date updates were needed." };
  }
  return {
    status: "success",
    message: `Updated ${updatedCount} reminder date${updatedCount === 1 ? "" : "s"} and reset ${deletedOverrides.count} schedule override${
      deletedOverrides.count === 1 ? "" : "s"
    }.`,
  };
}
