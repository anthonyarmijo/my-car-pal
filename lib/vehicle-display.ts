type VehicleDisplayInput = {
  year: number;
  make: string;
  model: string;
  trim?: string | null;
};

function formatSegment(segment: string): string {
  if (!segment) {
    return "";
  }

  const lettersOnly = segment.replace(/[^A-Za-z]/g, "");
  if (!lettersOnly) {
    return segment;
  }

  if (lettersOnly === lettersOnly.toUpperCase() && lettersOnly.length <= 3) {
    return segment.toUpperCase();
  }

  const lower = segment.toLowerCase();
  return `${lower.slice(0, 1).toUpperCase()}${lower.slice(1)}`;
}

function formatToken(token: string): string {
  return token
    .split(/([-/])/)
    .map((part) => {
      if (part === "-" || part === "/") {
        return part;
      }
      return formatSegment(part);
    })
    .join("");
}

export function toVehicleTitleCase(value: string | null | undefined): string {
  const normalized = String(value ?? "").trim();
  if (!normalized) {
    return "";
  }

  return normalized
    .split(/\s+/)
    .map(formatToken)
    .join(" ");
}

export function formatVehicleLabel(vehicle: VehicleDisplayInput): string {
  const make = toVehicleTitleCase(vehicle.make);
  const model = toVehicleTitleCase(vehicle.model);
  const trim = toVehicleTitleCase(vehicle.trim ?? "");

  return `${vehicle.year} ${make} ${model}${trim ? ` ${trim}` : ""}`;
}
