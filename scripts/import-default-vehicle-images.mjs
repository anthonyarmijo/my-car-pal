import { readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const MANIFEST_PATH = path.join(process.cwd(), "data", "default-vehicle-images.json");
const VALID_KINDS = new Set(["CAR", "MOTORCYCLE"]);
const VALID_STATUSES = new Set(["ACTIVE", "NEEDS_REVIEW", "RETIRED"]);
const isValidationOnly = process.argv.includes("--check") || process.argv.includes("--dry-run");

function normalizeVehicleImageKey(value) {
  const normalized = String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  return normalized || null;
}

function optionalString(value, field) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error(`${field} must be a string or null.`);
  }

  const trimmed = value.trim();
  return trimmed || null;
}

function optionalInt(value, field) {
  if (value === null || value === undefined) {
    return null;
  }

  if (!Number.isInteger(value)) {
    throw new Error(`${field} must be an integer or null.`);
  }

  return value;
}

function requiredString(value, field) {
  const normalized = optionalString(value, field);
  if (!normalized) {
    throw new Error(`${field} is required.`);
  }
  return normalized;
}

function isCommercialCompatibleLicense(license) {
  const normalized = license.toLowerCase();
  if (normalized.includes("noncommercial") || /(^|\W)nc($|\W)/.test(normalized)) {
    return false;
  }
  if (normalized.includes("no derivatives") || /(^|\W)nd($|\W)/.test(normalized)) {
    return false;
  }
  return normalized.includes("cc0")
    || normalized.includes("public domain")
    || normalized.startsWith("cc by ")
    || normalized.startsWith("cc by-sa ")
    || normalized.startsWith("cc-by ")
    || normalized.startsWith("cc-by-sa ");
}

function validateManifestEntry(raw, index) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error(`Entry ${index + 1} must be an object.`);
  }

  const kind = requiredString(raw.kind, `Entry ${index + 1} kind`);
  if (!VALID_KINDS.has(kind)) {
    throw new Error(`Entry ${index + 1} kind must be CAR or MOTORCYCLE.`);
  }

  const status = optionalString(raw.status, `Entry ${index + 1} status`) ?? "ACTIVE";
  if (!VALID_STATUSES.has(status)) {
    throw new Error(`Entry ${index + 1} status must be ACTIVE, NEEDS_REVIEW, or RETIRED.`);
  }

  const assetUrl = optionalString(raw.assetUrl, `Entry ${index + 1} assetUrl`);
  const storageKey = optionalString(raw.storageKey, `Entry ${index + 1} storageKey`);
  if (status === "ACTIVE" && !assetUrl && !storageKey) {
    throw new Error(`Entry ${index + 1} ACTIVE records require assetUrl or storageKey.`);
  }

  if (typeof raw.commercialUseAllowed !== "boolean") {
    throw new Error(`Entry ${index + 1} commercialUseAllowed must be true or false.`);
  }

  if (status === "ACTIVE" && !raw.commercialUseAllowed) {
    throw new Error(`Entry ${index + 1} ACTIVE records must be allowed for commercial use.`);
  }

  const yearStart = optionalInt(raw.yearStart, `Entry ${index + 1} yearStart`);
  const yearEnd = optionalInt(raw.yearEnd, `Entry ${index + 1} yearEnd`);
  if (yearStart !== null && yearEnd !== null && yearStart > yearEnd) {
    throw new Error(`Entry ${index + 1} yearStart cannot be after yearEnd.`);
  }

  const make = optionalString(raw.make, `Entry ${index + 1} make`);
  const model = optionalString(raw.model, `Entry ${index + 1} model`);
  const trim = optionalString(raw.trim, `Entry ${index + 1} trim`);
  const sourceProvider = requiredString(raw.sourceProvider, `Entry ${index + 1} sourceProvider`);
  const sourceUrl = optionalString(raw.sourceUrl, `Entry ${index + 1} sourceUrl`);
  const license = requiredString(raw.license, `Entry ${index + 1} license`);
  const licenseUrl = optionalString(raw.licenseUrl, `Entry ${index + 1} licenseUrl`);
  const attribution = optionalString(raw.attribution, `Entry ${index + 1} attribution`);
  const generation = optionalString(raw.generation, `Entry ${index + 1} generation`);
  const bodyClass = optionalString(raw.bodyClass, `Entry ${index + 1} bodyClass`);

  const isExternalReviewedRecord = sourceProvider !== "MY_CAR_PAL";
  if (status === "ACTIVE" && isExternalReviewedRecord) {
    if (!make || !model) {
      throw new Error(`Entry ${index + 1} reviewed image records require make and model.`);
    }
    if (yearStart === null || yearEnd === null) {
      throw new Error(`Entry ${index + 1} reviewed image records require yearStart and yearEnd.`);
    }
    if (!bodyClass) {
      throw new Error(`Entry ${index + 1} reviewed image records require bodyClass.`);
    }
    if (!sourceUrl) {
      throw new Error(`Entry ${index + 1} reviewed image records require sourceUrl.`);
    }
    if (!licenseUrl) {
      throw new Error(`Entry ${index + 1} reviewed image records require licenseUrl.`);
    }
    if (!attribution) {
      throw new Error(`Entry ${index + 1} reviewed image records require attribution.`);
    }
    if (!isCommercialCompatibleLicense(license)) {
      throw new Error(`Entry ${index + 1} license is not approved for catalog import: ${license}`);
    }
    if (sourceProvider === "WIKIMEDIA_COMMONS" && !sourceUrl.startsWith("https://commons.wikimedia.org/wiki/File:")) {
      throw new Error(`Entry ${index + 1} Wikimedia Commons records require a Commons file sourceUrl.`);
    }
  }

  return {
    kind,
    make,
    model,
    trim,
    generation,
    bodyClass,
    normalizedMake: normalizeVehicleImageKey(make),
    normalizedModel: normalizeVehicleImageKey(model),
    normalizedTrim: normalizeVehicleImageKey(trim),
    yearStart,
    yearEnd,
    assetUrl,
    storageKey,
    sourceProvider,
    sourceUrl,
    license,
    licenseUrl,
    attribution,
    commercialUseAllowed: raw.commercialUseAllowed,
    confidence: Number.isInteger(raw.confidence) ? raw.confidence : 50,
    status,
  };
}

function importKey(entry) {
  return [
    entry.kind,
    entry.normalizedMake ?? "generic",
    entry.normalizedModel ?? "generic",
    entry.normalizedTrim ?? "any-trim",
    entry.yearStart ?? "any-start",
    entry.yearEnd ?? "any-end",
    entry.assetUrl ?? entry.storageKey,
  ].join("|");
}

async function main() {
  const manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
  if (!Array.isArray(manifest)) {
    throw new Error("Default vehicle image manifest must be an array.");
  }

  const entries = manifest.map(validateManifestEntry);
  if (isValidationOnly) {
    console.log(`Validated ${entries.length} default vehicle image records.`);
    return;
  }

  for (const entry of entries) {
    const existing = await prisma.defaultVehicleImage.findFirst({
      where: {
        kind: entry.kind,
        normalizedMake: entry.normalizedMake,
        normalizedModel: entry.normalizedModel,
        normalizedTrim: entry.normalizedTrim,
        yearStart: entry.yearStart,
        yearEnd: entry.yearEnd,
        assetUrl: entry.assetUrl,
        storageKey: entry.storageKey,
      },
      select: { id: true },
    });

    if (existing) {
      await prisma.defaultVehicleImage.update({
        where: { id: existing.id },
        data: entry,
      });
    } else {
      await prisma.defaultVehicleImage.create({ data: entry });
    }
  }

  console.log(`Imported ${entries.length} default vehicle image records.`);
  for (const entry of entries) {
    console.log(`- ${importKey(entry)}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
