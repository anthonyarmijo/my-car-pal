import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const sourceRoot = path.join(packageRoot, "src");

const forbiddenImports = [
  { pattern: /from\s+["']@\/.+["']/g, reason: "app path aliases couple the package to the Next.js app" },
  { pattern: /from\s+["'](?:\.\.\/)+app(?:\/|["'])/g, reason: "app routes must stay outside the design system" },
  { pattern: /from\s+["'](?:\.\.\/)+lib(?:\/|["'])/g, reason: "app lib modules may contain data, auth, or provider logic" },
  { pattern: /from\s+["']@prisma\/client["']/g, reason: "Prisma belongs in app/data layers" },
  { pattern: /from\s+["']better-auth(?:\/[^"']*)?["']/g, reason: "auth belongs in the app layer" },
  { pattern: /from\s+["']next\/(?:navigation|server|headers|cache)["']/g, reason: "Next runtime APIs would couple primitives to routes/server behavior" },
  { pattern: /from\s+["']@vercel\/blob["']/g, reason: "storage adapters belong outside presentational UI" },
  { pattern: /from\s+["']stripe["']/g, reason: "billing logic belongs outside presentational UI" },
  { pattern: /^\s*["']use server["'];?\s*$/gm, reason: "server actions are not allowed in the UI package" },
];

async function listSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return listSourceFiles(fullPath);
      }

      return /\.(ts|tsx)$/.test(entry.name) ? [fullPath] : [];
    }),
  );

  return files.flat();
}

const failures = [];

for (const file of await listSourceFiles(sourceRoot)) {
  const content = await readFile(file, "utf8");
  for (const { pattern, reason } of forbiddenImports) {
    pattern.lastIndex = 0;
    const matches = content.match(pattern);
    if (!matches) {
      continue;
    }

    failures.push({
      file: path.relative(packageRoot, file),
      reason,
      matches,
    });
  }
}

if (failures.length > 0) {
  console.error("Design-system boundary check failed:");
  for (const failure of failures) {
    console.error(`\n${failure.file}`);
    console.error(`  ${failure.reason}`);
    for (const match of failure.matches) {
      console.error(`  ${match.trim()}`);
    }
  }
  process.exit(1);
}

console.log("Design-system boundary check passed.");
