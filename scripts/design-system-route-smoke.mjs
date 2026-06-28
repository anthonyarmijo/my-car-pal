import { createServer } from "node:net";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

const checks = [
  {
    label: "login renders package primitives",
    path: "/login",
    status: 200,
    includes: ["mcp-card", "mcp-field", "mcp-input", "mcp-button", "Welcome Back"],
  },
  {
    label: "register renders package primitives",
    path: "/register",
    status: 200,
    includes: ["mcp-field", "mcp-input", "mcp-button", "Create your account"],
  },
  {
    label: "auth-error renders package primitives and decoded copy",
    path: "/auth-error?error=google_sign_in_failed&error_description=Provider%20declined",
    status: 200,
    includes: ["mcp-card", "mcp-badge", "mcp-form-message", "mcp-button", "Provider declined", "Back to login"],
  },
  {
    label: "about renders package card and badge",
    path: "/about",
    status: 200,
    includes: ["mcp-card", "mcp-badge", "Why My Car Pal exists"],
  },
  {
    label: "privacy renders package cards and badge",
    path: "/privacy",
    status: 200,
    includes: ["mcp-card", "mcp-badge", "Privacy Policy"],
  },
  {
    label: "terms renders package cards and badge",
    path: "/terms",
    status: 200,
    includes: ["mcp-card", "mcp-badge", "Terms of Service"],
  },
  {
    label: "contact keeps unauthenticated redirect behavior",
    path: "/contact",
    status: 307,
    location: "/login",
  },
  {
    label: "garage keeps unauthenticated redirect behavior",
    path: "/garage",
    status: 307,
    location: "/login",
  },
  {
    label: "maintenance keeps unauthenticated redirect behavior",
    path: "/maintenance",
    status: 307,
    location: "/login",
  },
  {
    label: "glovebox keeps unauthenticated redirect behavior",
    path: "/glovebox",
    status: 307,
    location: "/login",
  },
  {
    label: "home keeps unauthenticated redirect behavior",
    path: "/home",
    status: 307,
    location: "/login",
  },
  {
    label: "vehicle detail keeps unauthenticated redirect behavior",
    path: "/vehicle/design-system-smoke",
    status: 307,
    location: "/login",
  },
  {
    label: "profile keeps unauthenticated redirect behavior",
    path: "/profile",
    status: 307,
    location: "/login",
  },
];

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      server.close(() => resolve(port));
    });
  });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(baseUrl) {
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/login`, { redirect: "manual" });
      if (response.status === 200) {
        return;
      }
    } catch {
      // Server is still starting.
    }

    await wait(250);
  }

  throw new Error("Timed out waiting for Next production server.");
}

function stopServer(child) {
  return new Promise((resolve) => {
    if (child.exitCode != null || child.signalCode != null) {
      resolve();
      return;
    }

    const timeout = setTimeout(() => {
      child.kill("SIGKILL");
      resolve();
    }, 5000);

    child.once("exit", () => {
      clearTimeout(timeout);
      resolve();
    });
    child.kill("SIGTERM");
  });
}

const port = await getFreePort();
const baseUrl = `http://127.0.0.1:${port}`;
const server = spawn(npmCommand, ["run", "start", "--", "-p", String(port), "-H", "127.0.0.1"], {
  cwd: repoRoot,
  env: process.env,
  stdio: ["ignore", "pipe", "pipe"],
});

let serverOutput = "";
server.stdout.on("data", (chunk) => {
  serverOutput += chunk.toString();
});
server.stderr.on("data", (chunk) => {
  serverOutput += chunk.toString();
});

const failures = [];

try {
  await waitForServer(baseUrl);

  for (const check of checks) {
    const response = await fetch(`${baseUrl}${check.path}`, { redirect: "manual" });
    const body = await response.text();

    if (response.status !== check.status) {
      failures.push(`${check.label}: expected status ${check.status}, received ${response.status}`);
      continue;
    }

    if (check.location) {
      const location = response.headers.get("location");
      const locationPath = location ? new URL(location, baseUrl).pathname : "";
      if (locationPath !== check.location) {
        failures.push(`${check.label}: expected location ${check.location}, received ${location || "<none>"}`);
      }
    }

    for (const expectedText of check.includes ?? []) {
      if (!body.includes(expectedText)) {
        failures.push(`${check.label}: missing "${expectedText}"`);
      }
    }
  }
} finally {
  await stopServer(server);
}

if (failures.length > 0) {
  console.error("Design-system route smoke failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  console.error("\nNext server output:");
  console.error(serverOutput.trim());
  process.exit(1);
}

console.log(`Design-system route smoke passed (${checks.length} checks).`);
