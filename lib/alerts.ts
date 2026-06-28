import "server-only";

import { formatDateOnlyLabel, isDateOnlyOnOrBefore } from "@/lib/date-only";
import { computeImportedScheduleForVehicle } from "@/lib/maintenance-schedule";
import { prisma } from "@/lib/prisma";
import { formatVehicleLabel } from "@/lib/vehicle-display";

export type UserAlertItem = {
  key: string;
  category: "maintenance" | "registration" | "insurance";
  title: string;
  detail: string;
  dueAt: Date;
  read: boolean;
};

function buildWindowEnd(daysAhead: number): Date {
  const end = new Date();
  end.setDate(end.getDate() + daysAhead);
  return end;
}

export async function getUserAlerts(userId: string, daysAhead = 30): Promise<UserAlertItem[]> {
  const windowEnd = buildWindowEnd(daysAhead);

  const [reminders, expiringRegistrations, expiringPolicies, importedSchedules, scheduleOverrides, serviceHistory] = await Promise.all([
    prisma.reminder.findMany({
      where: {
        completedAt: null,
        dueDate: { lte: windowEnd },
        vehicle: { userId },
      },
      include: {
        vehicle: {
          select: { year: true, make: true, model: true, trim: true },
        },
      },
      orderBy: { dueDate: "asc" },
      take: 120,
    }),
    prisma.vehicle.findMany({
      where: {
        userId,
        registrationExpiresAt: { lte: windowEnd },
      },
      select: {
        id: true,
        year: true,
        make: true,
        model: true,
        trim: true,
        registrationExpiresAt: true,
      },
      orderBy: { registrationExpiresAt: "asc" },
      take: 120,
    }),
    prisma.insurancePolicy.findMany({
      where: {
        userId,
        expiresAt: { lte: windowEnd },
      },
      include: {
        vehicles: {
          include: {
            vehicle: {
              select: { year: true, make: true, model: true, trim: true },
            },
          },
        },
      },
      orderBy: { expiresAt: "asc" },
      take: 120,
    }),
    prisma.serviceScheduleImport.findMany({
      where: { vehicle: { userId } },
      include: {
        vehicle: {
          select: { id: true, kind: true, year: true, make: true, model: true, trim: true, drivetrain: true, currentOdometer: true },
        },
      },
      take: 120,
    }),
    prisma.serviceScheduleOverride.findMany({
      where: { vehicle: { userId } },
      select: { vehicleId: true, serviceKey: true, dueDate: true },
      take: 1000,
    }),
    prisma.maintenance.findMany({
      where: { vehicle: { userId } },
      select: { vehicleId: true, title: true, odometer: true, serviceDate: true },
      orderBy: { serviceDate: "desc" },
      take: 3000,
    }),
  ]);

  const alertItems: UserAlertItem[] = [];
  const today = new Date();

  for (const reminder of reminders) {
    const reminderDueNow = isDateOnlyOnOrBefore(reminder.dueDate, today);
    alertItems.push({
      key: `reminder:${reminder.id}`,
      category: "maintenance",
      title: reminder.title,
      detail: `${formatVehicleLabel(reminder.vehicle)} • ${reminderDueNow ? "Due now" : `due ${formatDateOnlyLabel(reminder.dueDate)}`}`,
      dueAt: reminder.dueDate,
      read: false,
    });
  }

  for (const vehicle of expiringRegistrations) {
    if (!vehicle.registrationExpiresAt) {
      continue;
    }
    const dueNow = isDateOnlyOnOrBefore(vehicle.registrationExpiresAt, today);
    alertItems.push({
      key: `registration:${vehicle.id}`,
      category: "registration",
      title: "Registration expiring",
      detail: `${formatVehicleLabel(vehicle)} • ${dueNow ? "Due now" : `due ${formatDateOnlyLabel(vehicle.registrationExpiresAt)}`}`,
      dueAt: vehicle.registrationExpiresAt,
      read: false,
    });
  }

  for (const policy of expiringPolicies) {
    if (!policy.expiresAt) {
      continue;
    }
    const coverageDetail = policy.appliesToAll
      ? "All vehicles"
      : policy.vehicles.length > 0
        ? policy.vehicles.map((item) => formatVehicleLabel(item.vehicle)).join(", ")
        : "No vehicles selected";
    const dueNow = isDateOnlyOnOrBefore(policy.expiresAt, today);
    alertItems.push({
      key: `insurance:${policy.id}`,
      category: "insurance",
      title: `Insurance policy ${policy.policyId} expiring`,
      detail: `${coverageDetail} • ${dueNow ? "Due now" : `due ${formatDateOnlyLabel(policy.expiresAt)}`}`,
      dueAt: policy.expiresAt,
      read: false,
    });
  }

  if (importedSchedules.length > 0) {
    const historyByVehicle = serviceHistory.reduce<Record<string, Array<{ title: string; odometer: number; serviceDate: Date }>>>(
      (acc, entry) => {
        if (!acc[entry.vehicleId]) {
          acc[entry.vehicleId] = [];
        }
        acc[entry.vehicleId].push({
          title: entry.title,
          odometer: entry.odometer,
          serviceDate: entry.serviceDate,
        });
        return acc;
      },
      {},
    );
    const overrideMap = new Map(scheduleOverrides.map((item) => [`${item.vehicleId}:${item.serviceKey}`, item.dueDate]));

    for (const imported of importedSchedules) {
      const vehicle = imported.vehicle;
      const vehicleLabel = formatVehicleLabel(vehicle);
      const upcoming = computeImportedScheduleForVehicle(
        {
          id: vehicle.id,
          kind: vehicle.kind,
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model,
          drivetrain: vehicle.drivetrain,
          currentOdometer: vehicle.currentOdometer,
        },
        historyByVehicle[vehicle.id] ?? [],
      );

      for (const service of upcoming) {
        const dueAt = overrideMap.get(`${vehicle.id}:${service.serviceKey}`) ?? service.dueDate;
        if (dueAt.getTime() > windowEnd.getTime()) {
          continue;
        }

        const isDueNow = isDateOnlyOnOrBefore(dueAt, today);
        alertItems.push({
          key: `recommended:${vehicle.id}:${service.serviceKey}`,
          category: "maintenance",
          title: service.title,
          detail: `${vehicleLabel} • ${isDueNow ? "Due now" : `due ${formatDateOnlyLabel(dueAt)}`}`,
          dueAt,
          read: false,
        });
      }
    }
  }

  if (alertItems.length === 0) {
    return [];
  }

  const readStates = await prisma.userAlertState.findMany({
    where: {
      userId,
      alertKey: { in: alertItems.map((item) => item.key) },
    },
    select: { alertKey: true, snoozeUntil: true },
  });
  const now = new Date();
  const readKeys = new Set(
    readStates
      .filter((item) => !item.snoozeUntil || item.snoozeUntil.getTime() > now.getTime())
      .map((item) => item.alertKey),
  );

  return alertItems
    .map((item) => ({
      ...item,
      read: readKeys.has(item.key),
    }))
    .sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime());
}

export async function getUserUnreadAlertCount(userId: string, daysAhead = 30): Promise<number> {
  const alerts = await getUserAlerts(userId, daysAhead);
  return alerts.reduce((count, alert) => (alert.read ? count : count + 1), 0);
}
