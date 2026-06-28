import { rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

const checks = [
  "check:ui-tokens",
  "check:ui-boundary",
  "check:ui-pack",
  "build:ui",
  "typecheck",
  "lint",
  "build",
  "test:design-system:routes",
  "test:design-system:rendered",
  "verify:storybook:visual",
];

function runNpmScript(script) {
  return new Promise((resolve, reject) => {
    const child = spawn(npmCommand, ["run", script], {
      cwd: repoRoot,
      env: process.env,
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`npm run ${script} exited with code ${code}`));
    });
  });
}

try {
  for (const check of checks) {
    console.log(`\n==> npm run ${check}`);
    await runNpmScript(check);
  }

  console.log("\nDesign-system verification passed.");
} finally {
  await rm(path.join(repoRoot, "storybook-static"), { recursive: true, force: true });
}
