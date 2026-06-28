#!/usr/bin/env node

import { writeFile } from "node:fs/promises";
import path from "node:path";

const API_ROOT = "https://vpic.nhtsa.dot.gov/api/vehicles";
const OUTPUT_PATH = path.join(process.cwd(), "lib", "motorcycle-catalog.vpic.json");
const YEARS = [2022, 2023, 2024, 2025, 2026];
const TARGET_MAKES = ["Honda", "Harley-Davidson", "Kawasaki", "Yamaha", "Suzuki", "Vespa", "Piaggio"];

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "my-car-pal-motorcycle-catalog-sync/1.0",
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
  const catalog = {};

  for (const make of TARGET_MAKES) {
    const models = new Set();

    for (const year of YEARS) {
      const response = await fetchJson(
        `${API_ROOT}/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${year}/vehicletype/moto?format=json`,
      );

      for (const item of Array.isArray(response.Results) ? response.Results : []) {
        const model = normalizeName(item.Model_Name);
        if (model) {
          models.add(model);
        }
      }
    }

    catalog[make] = [...models].sort((a, b) => a.localeCompare(b));
  }

  await writeFile(OUTPUT_PATH, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
  console.log(`Saved motorcycle catalog snapshot to ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
