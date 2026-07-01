import { rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const checkTimeoutMs = Number(process.env.VERIFY_DESIGN_SYSTEM_CHECK_TIMEOUT_MS || 8 * 60 * 1000);

const fastChecks = [
  "check:ui-tokens",
  "check:ui-boundary",
  "check:ui-pack",
  "build:ui",
  "typecheck",
  "lint",
];

const renderedChecks = [
  "build",
  "test:design-system:routes",
  "test:design-system:rendered",
  "verify:storybook:visual",
];

const checks = process.env.VERIFY_DESIGN_SYSTEM_SKIP_FAST === "1"
  ? renderedChecks
  : [...fastChecks, ...renderedChecks];

function runNpmScript(script) {
  return new Promise((resolve, reject) => {
    let didTimeout = false;
    const child = spawn(npmCommand, ["run", script], {
      cwd: repoRoot,
      env: process.env,
      stdio: "inherit",
    });

    const timeout = setTimeout(() => {
      didTimeout = true;
      child.kill("SIGTERM");
      setTimeout(() => child.kill("SIGKILL"), 5000).unref();
    }, checkTimeoutMs);

    child.on("error", reject);
    child.on("close", (code) => {
      clearTimeout(timeout);
      if (didTimeout) {
        reject(new Error(`npm run ${script} exceeded ${Math.round(checkTimeoutMs / 1000)}s timeout`));
        return;
      }

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
