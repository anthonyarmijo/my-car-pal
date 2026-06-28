import { execFile } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const packageRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));

const requiredFiles = [
  "README.md",
  "package.json",
  "src/index.ts",
  "src/utils.ts",
  "src/styles/index.css",
  "src/styles/tokens.css",
  "src/styles/components.css",
  "src/tokens/index.ts",
  "src/tokens/tokens.ts",
  "src/tokens/tokens.json",
];

const allowedPaths = [
  /^README\.md$/,
  /^package\.json$/,
  /^src\/components\/.+\.(ts|tsx)$/,
  /^src\/styles\/.+\.css$/,
  /^src\/tokens\/.+\.(ts|json)$/,
  /^src\/index\.ts$/,
  /^src\/utils\.ts$/,
];

const forbiddenPaths = [
  /^scripts\//,
  /^src\/stories\//,
  /^storybook-static\//,
  /^tsconfig\.json$/,
  /^\.storybook\//,
  /^\.env/,
];

const npmBin = process.env.npm_execpath || "npm";
const { stdout } = await execFileAsync(npmBin, ["pack", "--dry-run", "--json"], {
  cwd: packageRoot,
  maxBuffer: 1024 * 1024,
});

let packOutput;
try {
  packOutput = JSON.parse(stdout);
} catch (error) {
  console.error("Could not parse npm pack dry-run JSON output.");
  console.error(error.message);
  process.exit(1);
}

const pack = Array.isArray(packOutput) ? packOutput[0] : packOutput;
const files = pack?.files?.map((file) => file.path).sort() ?? [];
const failures = [];

for (const requiredFile of requiredFiles) {
  if (!files.includes(requiredFile)) {
    failures.push(`Missing required package file: ${requiredFile}`);
  }
}

for (const file of files) {
  if (!allowedPaths.some((pattern) => pattern.test(file))) {
    failures.push(`Unexpected package file: ${file}`);
  }

  if (forbiddenPaths.some((pattern) => pattern.test(file))) {
    failures.push(`Forbidden package file: ${file}`);
  }
}

if (failures.length > 0) {
  console.error("UI package dry-run audit failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`UI package dry-run audit passed (${files.length} files).`);
