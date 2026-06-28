"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import type { UpdateOdometerState } from "@/app/home/state";

export async function updateVehicleOdometerAction(
  _prevState: UpdateOdometerState,
  formData: FormData,
): Promise<UpdateOdometerState> {
  "use server";
  const user = await requireCurrentUser();

  const vehicleId = String(formData.get("vehicleId") ?? "").trim();
  const odometerRaw = String(formData.get("odometer") ?? "").trim();

  if (!vehicleId || !odometerRaw) {
    return { status: "error", message: "Vehicle and odometer are required." };
  }

  const odometer = Number.parseInt(odometerRaw, 10);
  if (!Number.isFinite(odometer) || odometer < 0) {
    return { status: "error", message: "Odometer must be a valid non-negative number." };
  }

  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId: user.id },
    select: { id: true },
  });
  if (!vehicle) {
    return { status: "error", message: "Vehicle not found." };
  }

  await prisma.vehicle.update({
    where: { id: vehicleId },
    data: { currentOdometer: odometer },
  });

  revalidatePath("/home");
  revalidatePath(`/vehicle/${vehicleId}`);

  return { status: "success", message: "Odometer updated." };
}

export async function toggleAlertReadAction(formData: FormData): Promise<void> {
  "use server";
  const user = await requireCurrentUser();

  const alertKey = String(formData.get("alertKey") ?? "").trim();
  const markRead = String(formData.get("markRead") ?? "").trim() === "1";

  if (!alertKey) {
    return;
  }

  if (markRead) {
    await prisma.userAlertState.upsert({
      where: {
        userId_alertKey: {
          userId: user.id,
          alertKey,
        },
      },
      update: { readAt: new Date(), snoozeUntil: null },
      create: {
        userId: user.id,
        alertKey,
        snoozeUntil: null,
      },
    });
  } else {
    await prisma.userAlertState.deleteMany({
      where: {
        userId: user.id,
        alertKey,
      },
    });
  }

  revalidatePath("/home");
}

export async function remindAlertLaterAction(formData: FormData): Promise<void> {
  "use server";
  const user = await requireCurrentUser();

  const alertKey = String(formData.get("alertKey") ?? "").trim();
  if (!alertKey) {
    return;
  }

  const snoozeUntil = new Date();
  snoozeUntil.setDate(snoozeUntil.getDate() + 3);

  await prisma.userAlertState.upsert({
    where: {
      userId_alertKey: {
        userId: user.id,
        alertKey,
      },
    },
    update: { readAt: new Date(), snoozeUntil },
    create: {
      userId: user.id,
      alertKey,
      snoozeUntil,
    },
  });

  revalidatePath("/home");
}
