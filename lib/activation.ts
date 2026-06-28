import "server-only";

import { prisma } from "@/lib/prisma";
import type { ActivationState, ActivationStep, ActivationStepId } from "@/lib/activation-types";

const ACTIVATION_ACTIONS: Record<ActivationStepId, ActivationStep["action"]> = {
  vehicle: {
    href: "/garage#add-vehicle",
    label: "Add your first vehicle",
    description: "Start with the vehicle you drive most often.",
  },
  mileage: {
    href: "/home#quick-odometer-update",
    label: "Set current mileage",
    description: "Mileage keeps reminders and service timing useful.",
  },
  reminder: {
    href: "/maintenance#setup-reminders",
    label: "Add a service reminder",
    description: "Import recommended intervals or add one manual reminder.",
  },
  service: {
    href: "/maintenance#add-service-log",
    label: "Log your first service",
    description: "A single service entry makes the record feel real right away.",
  },
  documents: {
    href: "/glovebox#setup-docs",
    label: "Add registration or insurance info",
    description: "Keep one renewal date or document handy so the Glovebox starts working for you.",
  },
};

type ActivationFlags = Pick<
  ActivationState,
  "hasVehicle" | "hasMileage" | "hasReminderSetup" | "hasServiceLog" | "hasRegistrationOrInsuranceInfo"
>;

function buildSteps(flags: ActivationFlags): ActivationStep[] {
  return [
    {
      id: "vehicle",
      title: "Add your first vehicle",
      description: "Start your garage with one vehicle profile.",
      complete: flags.hasVehicle,
      action: ACTIVATION_ACTIONS.vehicle,
    },
    {
      id: "mileage",
      title: "Set current mileage",
      description: "Add mileage so upcoming maintenance stays practical.",
      complete: flags.hasMileage,
      action: ACTIVATION_ACTIONS.mileage,
    },
    {
      id: "reminder",
      title: "Add a service reminder",
      description: "Import recommended intervals or create one reminder you care about.",
      complete: flags.hasReminderSetup,
      action: ACTIVATION_ACTIONS.reminder,
    },
    {
      id: "service",
      title: "Log your first service",
      description: "Capture one completed job, whether it was DIY or shop work.",
      complete: flags.hasServiceLog,
      action: ACTIVATION_ACTIONS.service,
    },
    {
      id: "documents",
      title: "Add registration or insurance info",
      description: "Save one date or document so renewal tracking can help later.",
      complete: flags.hasRegistrationOrInsuranceInfo,
      action: ACTIVATION_ACTIONS.documents,
    },
  ];
}

export function findActivationStep(state: ActivationState, stepIds: ActivationStepId[]): ActivationStep | null {
  for (const stepId of stepIds) {
    const step = state.steps.find((item) => item.id === stepId && !item.complete);
    if (step) {
      return step;
    }
  }

  return state.nextStep;
}

export async function getActivationState(userId: string): Promise<ActivationState> {
  const [
    vehicleCount,
    vehicleMileageCount,
    reminderCount,
    importedScheduleCount,
    maintenanceCount,
    vehicleDocumentCount,
    insurancePolicyCount,
  ] = await Promise.all([
    prisma.vehicle.count({
      where: { userId },
    }),
    prisma.vehicle.count({
      where: { userId, currentOdometer: { not: null } },
    }),
    prisma.reminder.count({
      where: { vehicle: { userId } },
    }),
    prisma.serviceScheduleImport.count({
      where: { vehicle: { userId } },
    }),
    prisma.maintenance.count({
      where: { vehicle: { userId } },
    }),
    prisma.vehicle.count({
      where: {
        userId,
        OR: [
          { registrationExpiresAt: { not: null } },
          { registrationDocUrl: { not: null } },
          { insuranceExpiresAt: { not: null } },
          { insuranceDocUrl: { not: null } },
        ],
      },
    }),
    prisma.insurancePolicy.count({
      where: { userId },
    }),
  ]);

  // These checkpoints are intentionally derived from the existing data model
  // so future activation reporting can be computed from DB records without
  // adding an onboarding table or third-party analytics dependency.
  const flags: ActivationFlags = {
    hasVehicle: vehicleCount > 0,
    hasMileage: vehicleMileageCount > 0,
    hasReminderSetup: reminderCount > 0 || importedScheduleCount > 0,
    hasServiceLog: maintenanceCount > 0,
    hasRegistrationOrInsuranceInfo: vehicleDocumentCount > 0 || insurancePolicyCount > 0,
  };

  const steps = buildSteps(flags);
  const completedCount = steps.filter((step) => step.complete).length;
  const totalCount = steps.length;
  const nextStep = steps.find((step) => !step.complete) ?? null;

  return {
    ...flags,
    steps,
    nextStep,
    completedCount,
    totalCount,
    progressLabel: `${completedCount} of ${totalCount} setup steps finished`,
    isComplete: completedCount === totalCount,
  };
}
