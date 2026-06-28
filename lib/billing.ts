import "server-only";

import { VehicleKindValue } from "@/lib/vehicle-kind";

export type CoreEntitlementTier = "CORE";

const UNLIMITED_VEHICLE_ALLOWANCE = Number.MAX_SAFE_INTEGER;

export function planLabel(_tier: CoreEntitlementTier): string {
  return "Core";
}

export function canUseVehicleKind(_planTier: CoreEntitlementTier, _kind: VehicleKindValue): boolean {
  return true;
}

export function vehicleKindUpgradeMessage(kind: VehicleKindValue): string {
  if (kind === "MOTORCYCLE") {
    return "Motorcycles and scooters are available in the self-hosted core.";
  }

  return "";
}

export async function getVehicleAllowance(userId: string) {
  void userId;
  const planTier: CoreEntitlementTier = "CORE";

  return {
    planTier,
    planLabel: planLabel(planTier),
    maxVehicles: UNLIMITED_VEHICLE_ALLOWANCE,
    isUnlimited: true,
    allowsMotorcycles: canUseVehicleKind(planTier, "MOTORCYCLE"),
  };
}
