import { prisma } from "@/lib/prisma";
import { resolveStoredFileUrl } from "@/lib/storage";
import { parseVehicleKind, type VehicleKindValue } from "@/lib/vehicle-kind";

const ACTIVE_STATUS = "ACTIVE";

const GENERIC_DEFAULT_IMAGES: Record<VehicleKindValue, ResolvedVehicleImage> = {
  CAR: {
    url: "/images/vehicle-defaults/generic-car.svg",
    source: "generic",
    sourceProvider: "MY_CAR_PAL",
    license: "Original My Car Pal placeholder asset",
    attribution: "My Car Pal",
    isPlaceholder: true,
  },
  MOTORCYCLE: {
    url: "/images/vehicle-defaults/generic-motorcycle.svg",
    source: "generic",
    sourceProvider: "MY_CAR_PAL",
    license: "Original My Car Pal placeholder asset",
    attribution: "My Car Pal",
    isPlaceholder: true,
  },
};

type DefaultVehicleImageRecord = {
  id: string;
  kind: VehicleKindValue;
  normalizedMake: string | null;
  normalizedModel: string | null;
  normalizedTrim: string | null;
  yearStart: number | null;
  yearEnd: number | null;
  assetUrl: string | null;
  storageKey: string | null;
  sourceProvider: string;
  sourceUrl: string | null;
  license: string;
  licenseUrl: string | null;
  attribution: string | null;
  confidence: number;
  generation: string | null;
  bodyClass: string | null;
};

type VehicleImageMatchType = NonNullable<ResolvedVehicleImage["matchType"]>;

export type VehicleImageInput = {
  kind?: string | null;
  year: number;
  make: string;
  model: string;
  trim?: string | null;
};

export type ResolvedVehicleImage = {
  url: string;
  source: "upload" | "catalog" | "generic";
  sourceProvider?: string;
  sourceUrl?: string | null;
  license?: string;
  licenseUrl?: string | null;
  attribution?: string | null;
  catalogId?: string;
  matchType?: "trim" | "model-year" | "model" | "make" | "generic";
  isPlaceholder: boolean;
};

export function normalizeVehicleImageKey(value: string | null | undefined): string | null {
  const normalized = String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  if (!normalized) {
    return null;
  }

  return (
    {
      "chevy": "chevrolet",
      "vw": "volkswagen",
      "mercedes": "mercedes benz",
      "mercedes benz": "mercedes benz",
      "harley davidson": "harley davidson",
      "harley": "harley davidson",
    }[normalized] ?? normalized
  );
}

function yearMatches(record: DefaultVehicleImageRecord, year: number): boolean {
  return (record.yearStart === null || record.yearStart <= year) && (record.yearEnd === null || record.yearEnd >= year);
}

function recordUrl(record: DefaultVehicleImageRecord): string | null {
  return record.assetUrl ?? record.storageKey;
}

function matchType(record: DefaultVehicleImageRecord): VehicleImageMatchType {
  if (record.normalizedMake && record.normalizedModel && record.normalizedTrim) {
    return "trim";
  }

  if (record.normalizedMake && record.normalizedModel && (record.yearStart !== null || record.yearEnd !== null || record.generation)) {
    return "model-year";
  }

  if (record.normalizedMake && record.normalizedModel) {
    return "model";
  }

  if (record.normalizedMake) {
    return "make";
  }

  return "generic";
}

function matchScore(record: DefaultVehicleImageRecord): number {
  const type = matchType(record);
  const baseScore = {
    trim: 5000,
    "model-year": 4000,
    model: 3000,
    make: 2000,
    generic: 1000,
  }[type];

  const yearSpecificity = record.yearStart !== null || record.yearEnd !== null ? 100 : 0;
  const bodySpecificity = record.bodyClass ? 50 : 0;
  return baseScore + yearSpecificity + bodySpecificity + record.confidence;
}

async function urlForRecord(record: DefaultVehicleImageRecord): Promise<string | null> {
  if (record.assetUrl) {
    return record.assetUrl;
  }

  if (record.storageKey) {
    return resolveStoredFileUrl(record.storageKey);
  }

  return null;
}

async function findCatalogImage(vehicle: VehicleImageInput): Promise<ResolvedVehicleImage | null> {
  const kind = parseVehicleKind(vehicle.kind);
  const normalizedMake = normalizeVehicleImageKey(vehicle.make);
  const normalizedModel = normalizeVehicleImageKey(vehicle.model);
  const normalizedTrim = normalizeVehicleImageKey(vehicle.trim);

  const records = await prisma.defaultVehicleImage.findMany({
    where: {
      kind,
      status: ACTIVE_STATUS,
      commercialUseAllowed: true,
      AND: [
        { OR: [{ normalizedMake: null }, { normalizedMake }] },
        { OR: [{ normalizedModel: null }, { normalizedModel }] },
        { OR: [{ normalizedTrim: null }, { normalizedTrim }] },
        { OR: [{ yearStart: null }, { yearStart: { lte: vehicle.year } }] },
        { OR: [{ yearEnd: null }, { yearEnd: { gte: vehicle.year } }] },
      ],
    },
    select: {
      id: true,
      kind: true,
      normalizedMake: true,
      normalizedModel: true,
      normalizedTrim: true,
      yearStart: true,
      yearEnd: true,
      assetUrl: true,
      storageKey: true,
      sourceProvider: true,
      sourceUrl: true,
      license: true,
      licenseUrl: true,
      attribution: true,
      confidence: true,
      generation: true,
      bodyClass: true,
    },
  });

  const ranked = records
    .filter((record): record is DefaultVehicleImageRecord => Boolean(recordUrl(record)) && yearMatches(record, vehicle.year))
    .sort((a, b) => matchScore(b) - matchScore(a));

  const match = ranked[0];
  if (!match) {
    return null;
  }

  const url = await urlForRecord(match);
  if (!url) {
    return null;
  }

  return {
    url,
    source: "catalog",
    sourceProvider: match.sourceProvider,
    sourceUrl: match.sourceUrl,
    license: match.license,
    licenseUrl: match.licenseUrl,
    attribution: match.attribution,
    catalogId: match.id,
    matchType: matchType(match),
    isPlaceholder: matchType(match) === "generic",
  };
}

export async function resolveDefaultVehicleImage(vehicle: VehicleImageInput): Promise<ResolvedVehicleImage> {
  const catalogImage = await findCatalogImage(vehicle);
  if (catalogImage) {
    return catalogImage;
  }

  return GENERIC_DEFAULT_IMAGES[parseVehicleKind(vehicle.kind)];
}

export async function resolveVehicleImage(
  vehicle: VehicleImageInput,
  uploadedImageUrl: string | null | undefined,
): Promise<ResolvedVehicleImage> {
  if (uploadedImageUrl) {
    return {
      url: uploadedImageUrl,
      source: "upload",
      isPlaceholder: false,
    };
  }

  return resolveDefaultVehicleImage(vehicle);
}
