type ServiceHistoryEntry = {
  title: string;
  odometer: number;
  serviceDate: Date;
};

type VehicleScheduleInput = {
  id: string;
  year: number;
  currentOdometer: number | null;
  drivetrain?: string | null;
};

export type CarScheduleReferenceRow = {
  serviceKey: RecommendedServiceKey;
  service: string;
  typicalDefault: string;
};

type RecommendedService = {
  key: string;
  title: string;
  typicalDefault: string;
  milesMin?: number;
  years?: number;
  drivetrainRequired?: RegExp;
  matchers: RegExp[];
};

export type ComputedRecommendedService = {
  id: string;
  title: string;
  dueDate: Date;
  detail: string;
};

export const RECOMMENDED_SERVICE_ROWS = [
  { service: "Change engine oil", typicalDefault: "5,000-7,500 miles" },
  { service: "Rotate tires", typicalDefault: "5,000-7,500 miles" },
  { service: "Inspect brakes", typicalDefault: "10,000-15,000 miles" },
  { service: "Replace cabin air filter", typicalDefault: "15,000-25,000 miles" },
  { service: "Replace engine air filter", typicalDefault: "15,000-30,000 miles" },
  { service: "Replace brake fluid", typicalDefault: "2-3 years" },
  { service: "Replace spark plugs", typicalDefault: "60k-100k miles" },
  { service: "Inspect serpentine belt", typicalDefault: "60k-100k miles" },
  { service: "Change differential fluid (AWD/4WD)", typicalDefault: "30k-60k miles" },
  { service: "Change transfer case fluid (4WD)", typicalDefault: "30k-60k miles" },
  { service: "Change power steering fluid", typicalDefault: "50k-100k miles" },
  { service: "Replace battery", typicalDefault: "3-5 years" },
  { service: "Replace timing belt", typicalDefault: "60k-100k miles" },
  { service: "Change coolant", typicalDefault: "5 years / 100k miles" },
  { service: "Change transmission fluid", typicalDefault: "60k-100k miles" },
] as const;

const RECOMMENDED_SERVICES: RecommendedService[] = [
  {
    key: "oil-change",
    title: "Change engine oil",
    typicalDefault: "5,000-7,500 miles",
    milesMin: 5000,
    matchers: [/oil/i],
  },
  {
    key: "tire-rotation",
    title: "Rotate tires",
    typicalDefault: "5,000-7,500 miles",
    milesMin: 5000,
    matchers: [/(tire|tyre).*rotat/i, /rotat.*(tire|tyre)/i],
  },
  {
    key: "brake-inspection",
    title: "Inspect brakes",
    typicalDefault: "10,000-15,000 miles",
    milesMin: 10000,
    matchers: [/brake.*inspect/i, /inspect.*brake/i],
  },
  {
    key: "cabin-air-filter",
    title: "Replace cabin air filter",
    typicalDefault: "15,000-25,000 miles",
    milesMin: 15000,
    matchers: [/cabin.*air.*filter/i],
  },
  {
    key: "engine-air-filter",
    title: "Replace engine air filter",
    typicalDefault: "15,000-30,000 miles",
    milesMin: 15000,
    matchers: [/engine.*air.*filter/i],
  },
  {
    key: "brake-fluid",
    title: "Replace brake fluid",
    typicalDefault: "2-3 years",
    years: 2,
    matchers: [/brake.*fluid/i],
  },
  {
    key: "spark-plugs",
    title: "Replace spark plugs",
    typicalDefault: "60k-100k miles",
    milesMin: 60000,
    matchers: [/spark.*plug/i],
  },
  {
    key: "serpentine-belt",
    title: "Inspect serpentine belt",
    typicalDefault: "60k-100k miles",
    milesMin: 60000,
    matchers: [/serpentine.*belt/i, /drive belt/i],
  },
  {
    key: "differential-fluid",
    title: "Change differential fluid (AWD/4WD)",
    typicalDefault: "30k-60k miles",
    milesMin: 30000,
    drivetrainRequired: /(awd|4wd)/i,
    matchers: [/differential.*fluid/i, /diff fluid/i],
  },
  {
    key: "transfer-case-fluid",
    title: "Change transfer case fluid (4WD)",
    typicalDefault: "30k-60k miles",
    milesMin: 30000,
    drivetrainRequired: /4wd/i,
    matchers: [/transfer case.*fluid/i, /transfer case service/i],
  },
  {
    key: "power-steering-fluid",
    title: "Change power steering fluid",
    typicalDefault: "50k-100k miles",
    milesMin: 50000,
    matchers: [/power steering.*fluid/i],
  },
  {
    key: "battery",
    title: "Replace battery",
    typicalDefault: "3-5 years",
    years: 3,
    matchers: [/battery/i],
  },
  {
    key: "timing-belt",
    title: "Replace timing belt",
    typicalDefault: "60k-100k miles",
    milesMin: 60000,
    matchers: [/timing belt/i],
  },
  {
    key: "coolant",
    title: "Change coolant",
    typicalDefault: "5 years / 100k miles",
    milesMin: 100000,
    years: 5,
    matchers: [/coolant/i, /antifreeze/i, /radiator/i],
  },
  {
    key: "transmission-fluid",
    title: "Change transmission fluid",
    typicalDefault: "60k-100k miles",
    milesMin: 60000,
    matchers: [/transmission.*fluid/i, /trans fluid/i, /transmission service/i],
  },
];

export type RecommendedServiceKey = (typeof RECOMMENDED_SERVICES)[number]["key"];

function monthsBetween(older: Date, newer: Date): number {
  const diffMs = newer.getTime() - older.getTime();
  return diffMs / (1000 * 60 * 60 * 24 * 30.4375);
}

function addMonths(base: Date, months: number): Date {
  const output = new Date(base);
  output.setMonth(output.getMonth() + months);
  return output;
}

function addYears(base: Date, years: number): Date {
  const output = new Date(base);
  output.setFullYear(output.getFullYear() + years);
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
      return Math.min(Math.max(miles / months, 350), 3000);
    }
  }

  if (ordered.length >= 1) {
    const latest = ordered[ordered.length - 1];
    const months = monthsBetween(latest.serviceDate, new Date());
    const miles = currentMileage - latest.odometer;

    if (months >= 1 && miles > 0) {
      return Math.min(Math.max(miles / months, 350), 3000);
    }
  }

  if (currentMileage > 0) {
    const baseline = baselineDateForVehicleYear(vehicleYear);
    const monthsSinceYearStart = Math.max(monthsBetween(baseline, now), 1);
    return Math.min(Math.max(currentMileage / monthsSinceYearStart, 350), 3000);
  }

  return 1000;
}

function serviceMatchesTitle(service: RecommendedService, title: string): boolean {
  return service.matchers.some((matcher) => matcher.test(title));
}

function serviceAppliesToVehicle(service: RecommendedService, vehicle: { drivetrain?: string | null }): boolean {
  if (!service.drivetrainRequired) {
    return true;
  }
  const drive = String(vehicle.drivetrain ?? "").trim();
  if (!drive) {
    return false;
  }
  return service.drivetrainRequired.test(drive);
}

function chooseSoonestDate(a: Date | null, b: Date | null): Date | null {
  if (a && b) {
    return a.getTime() <= b.getTime() ? a : b;
  }
  return a ?? b;
}

function getServiceByKey(key: string): RecommendedService | null {
  return RECOMMENDED_SERVICES.find((service) => service.key === key) ?? null;
}

export function isRecommendedServiceKey(value: string): value is RecommendedServiceKey {
  return getServiceByKey(value) !== null;
}

export function inferRecommendedServiceKey(title: string): RecommendedServiceKey | null {
  const normalized = title.trim();
  if (!normalized) {
    return null;
  }

  const match = RECOMMENDED_SERVICES.find((service) => serviceMatchesTitle(service, normalized));
  return match?.key ?? null;
}

export function computeDueDateForService(
  serviceKey: RecommendedServiceKey,
  vehicle: { year: number; currentOdometer: number | null; drivetrain?: string | null },
  history: ServiceHistoryEntry[],
  now = new Date(),
): { dueDate: Date; detail: string } {
  const service = getServiceByKey(serviceKey);
  if (!service) {
    return {
      dueDate: now,
      detail: "Service key not recognized.",
    };
  }
  if (!serviceAppliesToVehicle(service, vehicle)) {
    return {
      dueDate: addYears(now, 99),
      detail: "Not applicable for this vehicle drivetrain.",
    };
  }

  const currentMileage = vehicle.currentOdometer ?? history.reduce((max, entry) => Math.max(max, entry.odometer), 0);
  const monthlyMileage = estimateMonthlyMileage(currentMileage, history, vehicle.year, now);

  const matchingHistory = history
    .filter((entry) => serviceMatchesTitle(service, entry.title))
    .sort((a, b) => b.serviceDate.getTime() - a.serviceDate.getTime());

  const latest = matchingHistory[0];
  const baselineDate = latest?.serviceDate ?? baselineDateForVehicleYear(vehicle.year);
  const baselineOdometer = latest?.odometer ?? 0;

  const nextMileageDue = service.milesMin !== undefined ? baselineOdometer + service.milesMin : null;
  const milesRemaining = nextMileageDue !== null ? nextMileageDue - currentMileage : null;

  let dueByMileage: Date | null = null;
  if (milesRemaining !== null) {
    if (milesRemaining <= 0) {
      dueByMileage = now;
    } else {
      const monthsToDue = Math.max(Math.ceil(milesRemaining / monthlyMileage), 1);
      dueByMileage = addMonths(now, monthsToDue);
    }
  }

  const dueByTime = service.years ? addYears(baselineDate, service.years) : null;
  const dueDate = chooseSoonestDate(dueByMileage, dueByTime) ?? addMonths(now, 6);

  const detailParts = [`Typical interval: ${service.typicalDefault}`];
  if (nextMileageDue !== null) {
    detailParts.push(`Next around ${nextMileageDue.toLocaleString()} mi`);
    detailParts.push(
      milesRemaining !== null && milesRemaining <= 0
        ? "Due now by mileage"
        : `${Math.max(milesRemaining ?? 0, 0).toLocaleString()} mi remaining`,
    );
  }
  if (service.years) {
    detailParts.push(`or every ${service.years} years`);
    if (!latest) {
      detailParts.push(`No service history found, baseline year ${vehicle.year}`);
    }
  }

  return {
    dueDate,
    detail: detailParts.join(" • "),
  };
}

export function computeRecommendedServicesForVehicle(
  vehicle: VehicleScheduleInput,
  history: ServiceHistoryEntry[],
  now = new Date(),
): ComputedRecommendedService[] {
  return RECOMMENDED_SERVICES.filter((service) => serviceAppliesToVehicle(service, vehicle)).map((service) => {
    const calculated = computeDueDateForService(service.key, vehicle, history, now);

    return {
      id: `${vehicle.id}-${service.key}`,
      title: service.title,
      dueDate: calculated.dueDate,
      detail: calculated.detail,
    };
  });
}

export function getRecommendedServiceRowsForVehicle(vehicle: { drivetrain?: string | null }): CarScheduleReferenceRow[] {
  return RECOMMENDED_SERVICES.filter((service) => serviceAppliesToVehicle(service, vehicle)).map((service) => ({
    serviceKey: service.key,
    service: service.title,
    typicalDefault: service.typicalDefault,
  }));
}
