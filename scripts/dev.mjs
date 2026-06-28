#!/usr/bin/env node
import { spawn, spawnSync } from "node:child_process";

function getPort(args) {
  const envPort = process.env.PORT?.trim();

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if ((arg === "--port" || arg === "-p") && args[index + 1]) {
      return args[index + 1];
    }

    if (arg.startsWith("--port=")) {
      return arg.slice("--port=".length);
    }
  }

  return envPort || "3000";
}

function getTailscaleURL(port) {
  const status = spawnSync("tailscale", ["status", "--json"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });

  if (status.error || status.status !== 0 || !status.stdout) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(status.stdout);
    const self = parsed.Self;

    if (parsed.BackendState !== "Running" || self?.Online !== true) {
      return undefined;
    }

    const dnsName = typeof self.DNSName === "string" ? self.DNSName.replace(/\.$/, "") : "";
    const ip = Array.isArray(self.TailscaleIPs)
      ? self.TailscaleIPs.find((value) => typeof value === "string" && /^\d+\.\d+\.\d+\.\d+$/.test(value))
      : undefined;
    const host = dnsName || ip;

    return host ? `http://${host}:${port}` : undefined;
  } catch {
    return undefined;
  }
}

const args = process.argv.slice(2);
const tailscaleURL = getTailscaleURL(getPort(args));
let printedTailscaleURL = false;
let recentStdout = "";

const nextDev = spawn("next", ["dev", ...args], {
  stdio: ["inherit", "pipe", "inherit"],
  shell: process.platform === "win32",
});

nextDev.stdout.on("data", (chunk) => {
  if (printedTailscaleURL || !tailscaleURL) {
    process.stdout.write(chunk);
    return;
  }

  const text = chunk.toString();
  const searchText = recentStdout + text;

  if (!searchText.includes("- Local:")) {
    process.stdout.write(text);
    recentStdout = searchText.slice(-20);
    return;
  }

  const localIndex = text.indexOf("- Local:");
  const lineEndIndex = localIndex >= 0 ? text.indexOf("\n", localIndex) : -1;

  if (lineEndIndex >= 0) {
    process.stdout.write(text.slice(0, lineEndIndex + 1));
    process.stdout.write(`   - Tailscale:    ${tailscaleURL}\n`);
    process.stdout.write(text.slice(lineEndIndex + 1));
  } else {
    process.stdout.write(text);
    process.stdout.write(`   - Tailscale:    ${tailscaleURL}\n`);
  }

  printedTailscaleURL = true;
});

nextDev.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
