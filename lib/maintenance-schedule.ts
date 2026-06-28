import {
  computeDueDateForService,
  computeRecommendedServicesForVehicle,
  getRecommendedServiceRowsForVehicle,
  inferRecommendedServiceKey,
  isRecommendedServiceKey,
} from "@/lib/recommended-schedule";
import {
  computeMotorcycleServiceDueDate,
  computeMotorcycleServicesForVehicle,
  getMotorcycleScheduleRows,
  inferMotorcycleScheduleServiceKey,
  isMotorcycleScheduleSupported,
} from "@/lib/motorcycle-schedule";
import { VehicleKindValue } from "@/lib/vehicle-kind";

export type ServiceHistoryEntry = {
  title: string;
  odometer: number;
  serviceDate: Date;
};

export type ScheduleVehicleInput = {
  id: string;
  kind: VehicleKindValue;
  year: number;
  make: string;
  model: string;
  currentOdometer: number | null;
  drivetrain?: string | null;
};

export type ScheduleReferenceRow = {
  serviceKey: string;
  service: string;
  typicalDefault: string;
  sourceLabel?: string;
  sourceUrl?: string;
};

export type ComputedScheduleService = {
  id: string;
  title: string;
  serviceKey: string;
  dueDate: Date;
  detail: string;
  sourceLabel?: string;
  sourceUrl?: string;
};

export function getScheduleRowsForVehicle(vehicle: ScheduleVehicleInput): ScheduleReferenceRow[] {
  if (vehicle.kind === "MOTORCYCLE") {
    return getMotorcycleScheduleRows(vehicle);
  }

  return getRecommendedServiceRowsForVehicle(vehicle);
}

export function isImportedScheduleSupported(vehicle: ScheduleVehicleInput): boolean {
  if (vehicle.kind === "MOTORCYCLE") {
    return isMotorcycleScheduleSupported(vehicle);
  }

  return true;
}

export function importedScheduleFallbackMessage(vehicle: ScheduleVehicleInput): string {
  if (vehicle.kind === "MOTORCYCLE") {
    return "Official motorcycle schedule guidance is not available for this bike yet. Add a manual reminder for now.";
  }

  return "Recommended schedule is not available for this vehicle.";
}

export function inferScheduleServiceKeyForVehicle(vehicle: ScheduleVehicleInput, title: string): string | null {
  if (vehicle.kind === "MOTORCYCLE") {
    return inferMotorcycleScheduleServiceKey(vehicle, title);
  }

  return inferRecommendedServiceKey(title);
}

export function isScheduleServiceKeyForVehicle(vehicle: ScheduleVehicleInput, serviceKey: string): boolean {
  if (vehicle.kind === "MOTORCYCLE") {
    return getMotorcycleScheduleRows(vehicle).some((row) => row.serviceKey === serviceKey);
  }

  return isRecommendedServiceKey(serviceKey);
}

export function computeScheduleServiceDueDate(
  vehicle: ScheduleVehicleInput,
  serviceKey: string,
  history: ServiceHistoryEntry[],
  now = new Date(),
): { dueDate: Date; detail: string; sourceLabel?: string; sourceUrl?: string } | null {
  if (vehicle.kind === "MOTORCYCLE") {
    return computeMotorcycleServiceDueDate(vehicle, serviceKey, history, now);
  }

  if (!isRecommendedServiceKey(serviceKey)) {
    return null;
  }

  return computeDueDateForService(serviceKey, vehicle, history, now);
}

export function computeImportedScheduleForVehicle(
  vehicle: ScheduleVehicleInput,
  history: ServiceHistoryEntry[],
  now = new Date(),
): ComputedScheduleService[] {
  if (vehicle.kind === "MOTORCYCLE") {
    return computeMotorcycleServicesForVehicle(vehicle, history, now);
  }

  return computeRecommendedServicesForVehicle(vehicle, history, now).map((service) => ({
    ...service,
    serviceKey: service.id.replace(`${vehicle.id}-`, ""),
  }));
}
