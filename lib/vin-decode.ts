import { DecodeVinValues, isValidVin } from "@shaggytools/nhtsa-api-wrapper";
import { VehicleKindValue } from "@/lib/vehicle-kind";

const INVALID_RESULT_VALUES = new Set([
  "",
  "0",
  "N/A",
  "NA",
  "NONE",
  "NULL",
  "NOT APPLICABLE",
]);

export type DecodedVinVehicle = {
  vin: string;
  kind: VehicleKindValue;
  year: number;
  make: string;
  model: string;
  drivetrain: string | null;
  trimOptions: string[];
  preferredTrim: string | null;
};

function normalizeValue(raw: string | undefined): string {
  return String(raw ?? "").trim();
}

function sanitizeResultValue(raw: string | undefined): string {
  const value = normalizeValue(raw);
  if (INVALID_RESULT_VALUES.has(value.toUpperCase())) {
    return "";
  }
  return value;
}

function parseVehicleYear(raw: string): number | null {
  const parsed = Number.parseInt(raw, 10);
  const currentYear = new Date().getFullYear();
  if (!Number.isFinite(parsed) || parsed < 1900 || parsed > currentYear + 1) {
    return null;
  }
  return parsed;
}

function inferVehicleKind(vehicleTypeRaw: string | undefined, bodyClassRaw: string | undefined): VehicleKindValue {
  const vehicleType = sanitizeResultValue(vehicleTypeRaw);
  const bodyClass = sanitizeResultValue(bodyClassRaw);
  const combined = `${vehicleType} ${bodyClass}`.trim();

  if (/motorcycle|scooter|moped/i.test(combined)) {
    return "MOTORCYCLE";
  }

  return "CAR";
}

export async function decodeVinVehicle(rawVin: string): Promise<DecodedVinVehicle> {
  const vin = normalizeValue(rawVin).toUpperCase();

  if (!vin) {
    throw new Error("VIN is required.");
  }

  if (vin.length !== 17) {
    throw new Error("VIN must be 17 characters.");
  }

  if (!isValidVin(vin)) {
    throw new Error("VIN is invalid.");
  }

  const response = await DecodeVinValues(vin);
  const decoded = response.Results[0];

  if (!decoded) {
    throw new Error("Could not decode VIN.");
  }

  const make = sanitizeResultValue(decoded.Make);
  const model = sanitizeResultValue(decoded.Model);
  const year = parseVehicleYear(sanitizeResultValue(decoded.ModelYear));

  if (!make || !model || year === null) {
    throw new Error("VIN decode did not return a valid year, make, and model.");
  }

  const trimOptions = Array.from(
    new Set(
      [decoded.Trim, decoded.Trim2]
        .map(sanitizeResultValue)
        .filter(Boolean),
    ),
  );
  const drivetrain = sanitizeResultValue(decoded.DriveType) || null;
  const kind = inferVehicleKind(decoded.VehicleType, decoded.BodyClass);

  return {
    vin,
    kind,
    year,
    make,
    model,
    drivetrain,
    trimOptions,
    preferredTrim: trimOptions[0] ?? null,
  };
}
