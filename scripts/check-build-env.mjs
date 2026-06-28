import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readEnvFiles() {
  const envFiles = [".env.production.local", ".env.local", ".env.production", ".env"];

  for (const file of envFiles) {
    const fullPath = path.join(repoRoot, file);
    if (!fs.existsSync(fullPath)) {
      continue;
    }

    const contents = fs.readFileSync(fullPath, "utf8");
    for (const line of contents.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex <= 0) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      if (!key || process.env[key] !== undefined) {
        continue;
      }

      let value = trimmed.slice(separatorIndex + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      process.env[key] = value;
    }
  }
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

readEnvFiles();

if (process.env.DATABASE_URL?.trim()) {
  process.exit(0);
}

fail(`\n[build-env] DATABASE_URL is required for npm run build.\n\nnext build runs with NODE_ENV=production, so the local-development fallback in lib/prisma.ts does not apply.\n\nTo fix it:\n  1. cp .env.example .env\n  2. npm run db:up\n  3. npm run build\n\nIf you already have a local env file, make sure DATABASE_URL is set there.\n`);
