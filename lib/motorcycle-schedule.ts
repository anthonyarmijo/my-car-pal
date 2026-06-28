import { VehicleKindValue } from "@/lib/vehicle-kind";

type ServiceHistoryEntry = {
  title: string;
  odometer: number;
  serviceDate: Date;
};

type MotorcycleScheduleVehicle = {
  id: string;
  kind: VehicleKindValue;
  year: number;
  make: string;
  model: string;
  currentOdometer: number | null;
};

type MotorcycleScheduleRow = {
  serviceKey: string;
  title: string;
  typicalDefault: string;
  milesInterval?: number;
  yearsInterval?: number;
  initialMiles?: number;
  initialMonths?: number;
  matchers: readonly RegExp[];
};

type MotorcycleScheduleProfile = {
  id: string;
  makePatterns: RegExp[];
  sourceLabel: string;
  sourceUrl: string;
  rows: MotorcycleScheduleRow[];
};

export type MotorcycleScheduleReferenceRow = {
  serviceKey: string;
  service: string;
  typicalDefault: string;
  sourceLabel: string;
  sourceUrl: string;
};

export type ComputedMotorcycleScheduleService = {
  id: string;
  title: string;
  serviceKey: string;
  dueDate: Date;
  detail: string;
  sourceLabel: string;
  sourceUrl: string;
};

const COMMON_ROWS = {
  airFilter: {
    serviceKey: "motorcycle-air-filter",
    title: "Inspect or replace air filter",
    matchers: [/air filter/i],
  },
  brakeFluid: {
    serviceKey: "motorcycle-brake-fluid",
    title: "Replace brake fluid",
    matchers: [/brake fluid/i],
  },
  coolant: {
    serviceKey: "motorcycle-coolant",
    title: "Change coolant",
    matchers: [/coolant/i],
  },
  drive: {
    serviceKey: "motorcycle-final-drive",
    title: "Inspect and service final drive",
    matchers: [/final drive/i, /drive chain/i, /chain/i, /belt/i],
  },
  oil: {
    serviceKey: "motorcycle-oil-change",
    title: "Change engine oil and filter",
    matchers: [/oil/i],
  },
  sparkPlugs: {
    serviceKey: "motorcycle-spark-plugs",
    title: "Replace spark plugs",
    matchers: [/spark plug/i],
  },
  valves: {
    serviceKey: "motorcycle-valve-clearance",
    title: "Inspect valve clearance",
    matchers: [/valve clearance/i, /valve adjust/i],
  },
} as const;

const MOTORCYCLE_SCHEDULE_PROFILES: MotorcycleScheduleProfile[] = [
  {
    id: "honda",
    makePatterns: [/^honda$/i],
    sourceLabel: "Honda Powersports owner-manual guidance",
    sourceUrl: "https://powersports.honda.com/faqs",
    rows: [
      { ...COMMON_ROWS.oil, typicalDefault: "Initial 600 mi, then every 8,000 mi or 12 months", initialMiles: 600, milesInterval: 8000, yearsInterval: 1, initialMonths: 1 },
      { ...COMMON_ROWS.airFilter, typicalDefault: "Every 16,000 mi or 24 months", milesInterval: 16000, yearsInterval: 2 },
      { ...COMMON_ROWS.brakeFluid, typicalDefault: "Every 24 months", yearsInterval: 2 },
      { ...COMMON_ROWS.coolant, typicalDefault: "Every 36 months", yearsInterval: 3 },
      { ...COMMON_ROWS.drive, typicalDefault: "Inspect every 8,000 mi or 12 months", milesInterval: 8000, yearsInterval: 1 },
      { ...COMMON_ROWS.sparkPlugs, typicalDefault: "Every 16,000 mi", milesInterval: 16000 },
      { ...COMMON_ROWS.valves, typicalDefault: "Every 16,000 mi", milesInterval: 16000 },
    ],
  },
  {
    id: "harley",
    makePatterns: [/^harley-davidson$/i, /^harley davidson$/i],
    sourceLabel: "Harley-Davidson owner-manual guidance",
    sourceUrl: "https://www.harley-davidson.com/us/en/tools/service-parts/manuals.html",
    rows: [
      { ...COMMON_ROWS.oil, typicalDefault: "Initial 1,000 mi, then every 5,000 mi or 12 months", initialMiles: 1000, milesInterval: 5000, yearsInterval: 1, initialMonths: 1 },
      { ...COMMON_ROWS.airFilter, typicalDefault: "Inspect every 10,000 mi or 24 months", milesInterval: 10000, yearsInterval: 2 },
      { ...COMMON_ROWS.brakeFluid, typicalDefault: "Every 24 months", yearsInterval: 2 },
      { ...COMMON_ROWS.drive, typicalDefault: "Inspect every 5,000 mi or 12 months", milesInterval: 5000, yearsInterval: 1 },
      { ...COMMON_ROWS.sparkPlugs, typicalDefault: "Every 10,000 mi", milesInterval: 10000 },
    ],
  },
  {
    id: "kawasaki",
    makePatterns: [/^kawasaki$/i],
    sourceLabel: "Kawasaki owner/service-manual guidance",
    sourceUrl: "https://www.kawasaki.com/en-US/owner-center/service-manuals",
    rows: [
      { ...COMMON_ROWS.oil, typicalDefault: "Initial 600 mi, then every 7,500 mi or 12 months", initialMiles: 600, milesInterval: 7500, yearsInterval: 1, initialMonths: 1 },
      { ...COMMON_ROWS.airFilter, typicalDefault: "Every 15,000 mi or 24 months", milesInterval: 15000, yearsInterval: 2 },
      { ...COMMON_ROWS.brakeFluid, typicalDefault: "Every 24 months", yearsInterval: 2 },
      { ...COMMON_ROWS.coolant, typicalDefault: "Every 36 months", yearsInterval: 3 },
      { ...COMMON_ROWS.drive, typicalDefault: "Inspect every 7,500 mi or 12 months", milesInterval: 7500, yearsInterval: 1 },
      { ...COMMON_ROWS.sparkPlugs, typicalDefault: "Every 15,000 mi", milesInterval: 15000 },
      { ...COMMON_ROWS.valves, typicalDefault: "Every 15,000 mi", milesInterval: 15000 },
    ],
  },
  {
    id: "yamaha",
    makePatterns: [/^yamaha$/i],
    sourceLabel: "Yamaha owner-manual guidance",
    sourceUrl: "https://www.yamahamotorsports.com/Customer-Care.php",
    rows: [
      { ...COMMON_ROWS.oil, typicalDefault: "Initial 600 mi, then every 6,000 mi or 12 months", initialMiles: 600, milesInterval: 6000, yearsInterval: 1, initialMonths: 1 },
      { ...COMMON_ROWS.airFilter, typicalDefault: "Every 12,000 mi or 24 months", milesInterval: 12000, yearsInterval: 2 },
      { ...COMMON_ROWS.brakeFluid, typicalDefault: "Every 24 months", yearsInterval: 2 },
      { ...COMMON_ROWS.coolant, typicalDefault: "Every 36 months", yearsInterval: 3 },
      { ...COMMON_ROWS.drive, typicalDefault: "Inspect every 6,000 mi or 12 months", milesInterval: 6000, yearsInterval: 1 },
      { ...COMMON_ROWS.sparkPlugs, typicalDefault: "Every 12,000 mi", milesInterval: 12000 },
      { ...COMMON_ROWS.valves, typicalDefault: "Every 12,000 mi", milesInterval: 12000 },
    ],
  },
  {
    id: "suzuki",
    makePatterns: [/^suzuki$/i],
    sourceLabel: "Suzuki owner-manual guidance",
    sourceUrl: "https://suzukicycles.com/resources/faq",
    rows: [
      { ...COMMON_ROWS.oil, typicalDefault: "Initial 600 mi, then every 7,500 mi or 12 months", initialMiles: 600, milesInterval: 7500, yearsInterval: 1, initialMonths: 1 },
      { ...COMMON_ROWS.airFilter, typicalDefault: "Every 15,000 mi or 24 months", milesInterval: 15000, yearsInterval: 2 },
      { ...COMMON_ROWS.brakeFluid, typicalDefault: "Every 24 months", yearsInterval: 2 },
      { ...COMMON_ROWS.coolant, typicalDefault: "Every 36 months", yearsInterval: 3 },
      { ...COMMON_ROWS.drive, typicalDefault: "Inspect every 7,500 mi or 12 months", milesInterval: 7500, yearsInterval: 1 },
      { ...COMMON_ROWS.sparkPlugs, typicalDefault: "Every 15,000 mi", milesInterval: 15000 },
      { ...COMMON_ROWS.valves, typicalDefault: "Every 15,000 mi", milesInterval: 15000 },
    ],
  },
  {
    id: "vespa-piaggio",
    makePatterns: [/^vespa$/i, /^piaggio$/i],
    sourceLabel: "Vespa / Piaggio owner-manual guidance",
    sourceUrl: "https://storeusa.vespa.com/faq-miscellanea.aspx",
    rows: [
      { ...COMMON_ROWS.oil, typicalDefault: "Initial 600 mi, then every 6,000 mi or 12 months", initialMiles: 600, milesInterval: 6000, yearsInterval: 1, initialMonths: 1 },
      { ...COMMON_ROWS.airFilter, typicalDefault: "Every 12,000 mi or 24 months", milesInterval: 12000, yearsInterval: 2 },
      { ...COMMON_ROWS.brakeFluid, typicalDefault: "Every 24 months", yearsInterval: 2 },
      { ...COMMON_ROWS.coolant, typicalDefault: "Every 24 months", yearsInterval: 2 },
      { ...COMMON_ROWS.drive, typicalDefault: "Inspect belt drive every 6,000 mi or 12 months", milesInterval: 6000, yearsInterval: 1 },
      { ...COMMON_ROWS.sparkPlugs, typicalDefault: "Every 6,000 mi", milesInterval: 6000 },
      { ...COMMON_ROWS.valves, typicalDefault: "Every 12,000 mi", milesInterval: 12000 },
    ],
  },
];

function monthsBetween(older: Date, newer: Date): number {
  return (newer.getTime() - older.getTime()) / (1000 * 60 * 60 * 24 * 30.4375);
}

function addMonths(base: Date, months: number): Date {
  const output = new Date(base);
  output.setMonth(output.getMonth() + months);
  return output;
}

function baselineDateForVehicleYear(year: number): Date {
  return new Date(Date.UTC(year, 0, 1));
}

function estimateMonthlyMileage(
  currentMileage: number,
  history: ServiceHistoryEntry[],
  vehicleYear: number,
  now: Date,
): number {
  const ordered = [...history].sort((a, b) => a.serviceDate.getTime() - b.serviceDate.getTime());

  if (ordered.length >= 2) {
    const first = ordered[0];
    const last = ordered[ordered.length - 1];
    const months = monthsBetween(first.serviceDate, last.serviceDate);
    const miles = last.odometer - first.odometer;

    if (months >= 1 && miles > 0) {
      return Math.min(Math.max(miles / months, 150), 2000);
    }
  }

  if (currentMileage > 0) {
    const monthsSinceYearStart = Math.max(monthsBetween(baselineDateForVehicleYear(vehicleYear), now), 1);
    return Math.min(Math.max(currentMileage / monthsSinceYearStart, 150), 2000);
  }

  return 500;
}

function findProfile(make: string): MotorcycleScheduleProfile | null {
  return MOTORCYCLE_SCHEDULE_PROFILES.find((profile) => profile.makePatterns.some((pattern) => pattern.test(make.trim()))) ?? null;
}

function chooseSoonestDate(a: Date | null, b: Date | null): Date | null {
  if (a && b) {
    return a.getTime() <= b.getTime() ? a : b;
  }

  return a ?? b;
}

function findRowByKey(vehicle: MotorcycleScheduleVehicle, serviceKey: string): { profile: MotorcycleScheduleProfile; row: MotorcycleScheduleRow } | null {
  const profile = findProfile(vehicle.make);
  if (!profile) {
    return null;
  }

  const row = profile.rows.find((item) => item.serviceKey === serviceKey);
  if (!row) {
    return null;
  }

  return { profile, row };
}

function serviceMatchesTitle(row: MotorcycleScheduleRow, title: string): boolean {
  return row.matchers.some((matcher) => matcher.test(title));
}

export function isMotorcycleScheduleSupported(vehicle: { kind: VehicleKindValue; make: string }): boolean {
  return vehicle.kind === "MOTORCYCLE" && findProfile(vehicle.make) !== null;
}

export function getMotorcycleScheduleRows(vehicle: MotorcycleScheduleVehicle): MotorcycleScheduleReferenceRow[] {
  const profile = findProfile(vehicle.make);
  if (!profile || vehicle.kind !== "MOTORCYCLE") {
    return [];
  }

  return profile.rows.map((row) => ({
    serviceKey: row.serviceKey,
    service: row.title,
    typicalDefault: row.typicalDefault,
    sourceLabel: profile.sourceLabel,
    sourceUrl: profile.sourceUrl,
  }));
}

export function inferMotorcycleScheduleServiceKey(vehicle: MotorcycleScheduleVehicle, title: string): string | null {
  const profile = findProfile(vehicle.make);
  if (!profile || vehicle.kind !== "MOTORCYCLE") {
    return null;
  }

  const normalized = title.trim();
  if (!normalized) {
    return null;
  }

  return profile.rows.find((row) => serviceMatchesTitle(row, normalized))?.serviceKey ?? null;
}

export function computeMotorcycleServiceDueDate(
  vehicle: MotorcycleScheduleVehicle,
  serviceKey: string,
  history: ServiceHistoryEntry[],
  now = new Date(),
): { dueDate: Date; detail: string; sourceLabel: string; sourceUrl: string } | null {
  const matched = findRowByKey(vehicle, serviceKey);
  if (!matched) {
    return null;
  }

  const { profile, row } = matched;
  const currentMileage = vehicle.currentOdometer ?? history.reduce((max, entry) => Math.max(max, entry.odometer), 0);
  const monthlyMileage = estimateMonthlyMileage(currentMileage, history, vehicle.year, now);
  const matchingHistory = history
    .filter((entry) => serviceMatchesTitle(row, entry.title))
    .sort((a, b) => b.serviceDate.getTime() - a.serviceDate.getTime());
  const latest = matchingHistory[0];
  const baselineDate = latest?.serviceDate ?? baselineDateForVehicleYear(vehicle.year);
  const baselineOdometer = latest?.odometer ?? 0;

  const mileageStep = latest ? row.milesInterval ?? null : row.initialMiles ?? row.milesInterval ?? null;
  const nextMileageDue = mileageStep !== null ? baselineOdometer + mileageStep : null;
  const milesRemaining = nextMileageDue !== null ? nextMileageDue - currentMileage : null;

  let dueByMileage: Date | null = null;
  if (nextMileageDue !== null) {
    if ((milesRemaining ?? 0) <= 0) {
      dueByMileage = now;
    } else {
      dueByMileage = addMonths(now, Math.max(Math.ceil((milesRemaining ?? 0) / monthlyMileage), 1));
    }
  }

  const monthStep = latest
    ? row.yearsInterval
      ? row.yearsInterval * 12
      : null
    : row.initialMonths ?? (row.yearsInterval ? row.yearsInterval * 12 : null);
  const dueByTime = monthStep !== null ? addMonths(baselineDate, monthStep) : null;
  const dueDate = chooseSoonestDate(dueByMileage, dueByTime) ?? addMonths(now, 6);

  const detailParts = [`Typical interval: ${row.typicalDefault}`];
  if (nextMileageDue !== null) {
    detailParts.push(`Next around ${nextMileageDue.toLocaleString()} mi`);
    detailParts.push((milesRemaining ?? 0) <= 0 ? "Due now by mileage" : `${Math.max(milesRemaining ?? 0, 0).toLocaleString()} mi remaining`);
  }
  detailParts.push(`Source: ${profile.sourceLabel}`);

  return {
    dueDate,
    detail: detailParts.join(" • "),
    sourceLabel: profile.sourceLabel,
    sourceUrl: profile.sourceUrl,
  };
}

export function computeMotorcycleServicesForVehicle(
  vehicle: MotorcycleScheduleVehicle,
  history: ServiceHistoryEntry[],
  now = new Date(),
): ComputedMotorcycleScheduleService[] {
  const profile = findProfile(vehicle.make);
  if (!profile || vehicle.kind !== "MOTORCYCLE") {
    return [];
  }

  return profile.rows.map((row) => {
    const calculated = computeMotorcycleServiceDueDate(vehicle, row.serviceKey, history, now);

    return {
      id: `${vehicle.id}-${row.serviceKey}`,
      title: row.title,
      serviceKey: row.serviceKey,
      dueDate: calculated?.dueDate ?? now,
      detail: calculated?.detail ?? `Source: ${profile.sourceLabel}`,
      sourceLabel: profile.sourceLabel,
      sourceUrl: profile.sourceUrl,
    };
  });
}
