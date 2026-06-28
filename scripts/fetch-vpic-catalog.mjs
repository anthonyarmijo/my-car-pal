#!/usr/bin/env node

import { writeFile } from "node:fs/promises";
import path from "node:path";

const API_ROOT = "https://vpic.nhtsa.dot.gov/api/vehicles";
const OUTPUT_PATH = path.join(process.cwd(), "lib", "vehicle-catalog.vpic.json");
const MAX_MAKES = readNumberFlag("--max-makes", 60);
const MAX_MODELS = readNumberFlag("--max-models", 20);

function readNumberFlag(flag, fallback) {
  const entry = process.argv.find((arg) => arg.startsWith(`${flag}=`));
  if (!entry) {
    return fallback;
  }

  const value = Number.parseInt(entry.slice(flag.length + 1), 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "my-car-pal-catalog-sync/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`);
  }

  return response.json();
}

function normalizeName(value) {
  return String(value ?? "").trim();
}

async function main() {
  const makeResponse = await fetchJson(`${API_ROOT}/GetAllMakes?format=json`);
  const makes = Array.isArray(makeResponse.Results) ? makeResponse.Results : [];

  const selectedMakes = makes
    .map((make) => ({
      id: Number.parseInt(String(make.Make_ID ?? ""), 10),
      name: normalizeName(make.Make_Name),
    }))
    .filter((make) => Number.isFinite(make.id) && make.id > 0 && make.name.length > 1)
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, MAX_MAKES);

  const catalog = {};

  for (const make of selectedMakes) {
    const modelsResponse = await fetchJson(`${API_ROOT}/GetModelsForMakeId/${make.id}?format=json`);
    const models = Array.isArray(modelsResponse.Results) ? modelsResponse.Results : [];
    const names = Array.from(
      new Set(
        models
          .map((model) => normalizeName(model.Model_Name))
          .filter(Boolean),
      ),
    )
      .sort((a, b) => a.localeCompare(b))
      .slice(0, MAX_MODELS);

    if (names.length > 0) {
      catalog[make.name] = names;
    }
  }

  await writeFile(OUTPUT_PATH, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");

  const makeCount = Object.keys(catalog).length;
  console.log(`Saved ${makeCount} make(s) to ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
