export const VEHICLE_KINDS = ["CAR", "MOTORCYCLE"] as const;

export type VehicleKindValue = (typeof VEHICLE_KINDS)[number];

export const VEHICLE_KIND_LABELS: Record<VehicleKindValue, string> = {
  CAR: "Car",
  MOTORCYCLE: "Motorcycle",
};

export function parseVehicleKind(value: string | null | undefined): VehicleKindValue {
  return String(value ?? "").trim().toUpperCase() === "MOTORCYCLE" ? "MOTORCYCLE" : "CAR";
}

export function isMotorcycleKind(value: string | null | undefined): boolean {
  return parseVehicleKind(value) === "MOTORCYCLE";
}
