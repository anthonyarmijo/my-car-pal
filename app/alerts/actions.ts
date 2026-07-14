"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";

function revalidateAlertSurfaces() {
  revalidatePath("/alerts");
  revalidatePath("/home");
}

export async function toggleAlertReadAction(formData: FormData): Promise<void> {
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

  revalidateAlertSurfaces();
}

export async function remindAlertLaterAction(formData: FormData): Promise<void> {
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

  revalidateAlertSurfaces();
}
