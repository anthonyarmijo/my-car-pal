import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const CANDIDATES_PATH = path.join(process.cwd(), "data", "default-vehicle-image-candidates.json");
const DEFAULT_OUTPUT_PATH = path.join(process.cwd(), "data", "default-vehicle-image-review.json");
const COMMONS_API_URL = "https://commons.wikimedia.org/w/api.php";
const COMMONS_PROVIDER = "WIKIMEDIA_COMMONS";
const VALID_KINDS = new Set(["CAR", "MOTORCYCLE"]);

const args = new Set(process.argv.slice(2));
const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
const outputArg = process.argv.find((arg) => arg.startsWith("--output="));
const shouldWrite = args.has("--write");
const shouldDownloadAssets = args.has("--download-assets");
const limit = limitArg ? Number.parseInt(limitArg.split("=")[1] ?? "", 10) : null;
const outputPath = outputArg ? path.resolve(outputArg.split("=")[1] ?? "") : DEFAULT_OUTPUT_PATH;

function normalizeCommonsFile(value) {
  const raw = requiredString(value, "preferredCommonsFile");
  return raw.startsWith("File:") ? raw : `File:${raw}`;
}

function optionalString(value) {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed || null;
}

function requiredString(value, field) {
  const normalized = optionalString(value);
  if (!normalized) {
    throw new Error(`${field} is required.`);
  }
  return normalized;
}

function requiredInt(value, field) {
  if (!Number.isInteger(value)) {
    throw new Error(`${field} must be an integer.`);
  }
  return value;
}

function cleanHtml(value) {
  return optionalString(value)
    ?.replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, "\"")
    .replace(/\s+/g, " ")
    .trim() ?? null;
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

function validateCuratedCandidate(candidate, index) {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new Error(`Candidate ${index + 1} must be an object.`);
  }

  const kind = requiredString(candidate.kind, `Candidate ${index + 1} kind`);
  if (!VALID_KINDS.has(kind)) {
    throw new Error(`Candidate ${index + 1} kind must be CAR or MOTORCYCLE.`);
  }

  const make = requiredString(candidate.make, `Candidate ${index + 1} make`);
  const model = requiredString(candidate.model, `Candidate ${index + 1} model`);
  const bodyClass = requiredString(candidate.bodyClass, `Candidate ${index + 1} bodyClass`);
  const generation = requiredString(candidate.generation, `Candidate ${index + 1} generation`);
  const assetPath = requiredString(candidate.assetPath, `Candidate ${index + 1} assetPath`);
  const yearStart = requiredInt(candidate.yearStart, `Candidate ${index + 1} yearStart`);
  const yearEnd = requiredInt(candidate.yearEnd, `Candidate ${index + 1} yearEnd`);
  if (yearStart > yearEnd) {
    throw new Error(`Candidate ${index + 1} yearStart cannot be after yearEnd.`);
  }
  if (!assetPath.startsWith("/images/vehicle-defaults/catalog/")) {
    throw new Error(`Candidate ${index + 1} assetPath must live under /images/vehicle-defaults/catalog/.`);
  }

  return {
    kind,
    make,
    model,
    trim: optionalString(candidate.trim),
    generation,
    bodyClass,
    yearStart,
    yearEnd,
    assetPath,
    confidence: Number.isInteger(candidate.confidence) ? candidate.confidence : 85,
    preferredCommonsFile: normalizeCommonsFile(candidate.preferredCommonsFile),
    reviewNotes: optionalString(candidate.reviewNotes),
  };
}

async function fetchCommonsImageInfo(title) {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    origin: "*",
    titles: title,
    prop: "imageinfo",
    iiprop: "url|extmetadata|mime",
    iiurlwidth: "960",
  });

  const response = await fetch(`${COMMONS_API_URL}?${params}`);
  if (!response.ok) {
    throw new Error(`Commons request failed for ${title}: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  const page = Object.values(payload.query?.pages ?? {})[0];
  if (!page || page.missing) {
    throw new Error(`Commons file was not found: ${title}`);
  }

  const imageInfo = page.imageinfo?.[0];
  if (!imageInfo) {
    throw new Error(`Commons file has no image metadata: ${title}`);
  }

  const metadata = imageInfo.extmetadata ?? {};
  const license = requiredString(metadata.LicenseShortName?.value, `${title} license`);
  const licenseUrl = requiredString(metadata.LicenseUrl?.value, `${title} licenseUrl`);
  const attribution = requiredString(cleanHtml(metadata.Artist?.value), `${title} attribution`);
  const sourceUrl = requiredString(imageInfo.descriptionurl, `${title} sourceUrl`);
  const sourceAssetUrl = requiredString(imageInfo.thumburl ?? imageInfo.url, `${title} assetUrl`);
  const mime = requiredString(imageInfo.mime, `${title} mime`);

  if (!mime.startsWith("image/")) {
    throw new Error(`${title} is not an image.`);
  }
  if (!isCommercialCompatibleLicense(license)) {
    throw new Error(`${title} license is not approved for catalog import: ${license}`);
  }

  return {
    commonsTitle: page.title,
    sourceUrl,
    sourceAssetUrl,
    license,
    licenseUrl,
    attribution: `${attribution} via Wikimedia Commons`,
  };
}

async function downloadAsset(sourceAssetUrl, assetPath) {
  const destination = path.join(process.cwd(), "public", assetPath.replace(/^\/+/, ""));
  const response = await fetch(sourceAssetUrl);
  if (!response.ok) {
    throw new Error(`Asset download failed for ${assetPath}: ${response.status} ${response.statusText}`);
  }

  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, Buffer.from(await response.arrayBuffer()));
}

async function main() {
  const rawCandidates = JSON.parse(await readFile(CANDIDATES_PATH, "utf8"));
  if (!Array.isArray(rawCandidates)) {
    throw new Error("Default vehicle image candidates must be an array.");
  }

  const curatedCandidates = rawCandidates
    .map((candidate, index) => ({ candidate, index }))
    .filter(({ candidate }) => Boolean(candidate?.preferredCommonsFile));
  const selectedCandidates = limit ? curatedCandidates.slice(0, limit) : curatedCandidates;

  const records = [];
  for (const { candidate, index } of selectedCandidates) {
    const reviewedCandidate = validateCuratedCandidate(candidate, index);
    const commons = await fetchCommonsImageInfo(reviewedCandidate.preferredCommonsFile);

    const record = {
      reviewStatus: "READY_FOR_IMPORT",
      kind: reviewedCandidate.kind,
      make: reviewedCandidate.make,
      model: reviewedCandidate.model,
      trim: reviewedCandidate.trim,
      generation: reviewedCandidate.generation,
      bodyClass: reviewedCandidate.bodyClass,
      yearStart: reviewedCandidate.yearStart,
      yearEnd: reviewedCandidate.yearEnd,
      assetUrl: reviewedCandidate.assetPath,
      sourceAssetUrl: commons.sourceAssetUrl,
      storageKey: null,
      sourceProvider: COMMONS_PROVIDER,
      sourceUrl: commons.sourceUrl,
      sourceFile: commons.commonsTitle,
      license: commons.license,
      licenseUrl: commons.licenseUrl,
      attribution: commons.attribution,
      commercialUseAllowed: true,
      confidence: reviewedCandidate.confidence,
      status: "ACTIVE",
      reviewNotes: reviewedCandidate.reviewNotes
        ?? "Confirm the photo depicts the stated generation/body style before copying this record into the import manifest.",
    };

    if (shouldDownloadAssets) {
      await downloadAsset(record.sourceAssetUrl, record.assetUrl);
    }

    records.push(record);
  }

  const output = `${JSON.stringify(records, null, 2)}\n`;
  if (shouldWrite) {
    await writeFile(outputPath, output);
    console.log(`Wrote ${records.length} review-ready records to ${path.relative(process.cwd(), outputPath)}.`);
  } else {
    process.stdout.write(output);
  }

  if (shouldDownloadAssets) {
    console.log(`Downloaded ${records.length} reviewed assets.`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
