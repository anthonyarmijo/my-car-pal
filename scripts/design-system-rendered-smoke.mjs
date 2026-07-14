import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const useProcessGroup = process.platform !== "win32";
const outputDir = process.env.DESIGN_SYSTEM_RENDERED_OUTPUT_DIR || path.join("/tmp", "my-car-pal-rendered-smoke");
const smokeEmail = process.env.DESIGN_SYSTEM_SMOKE_EMAIL || "";
const smokePassword = process.env.DESIGN_SYSTEM_SMOKE_PASSWORD || "";

const viewports = [
  { label: "desktop", width: 1280, height: 900 },
  { label: "tablet", width: 1024, height: 1024 },
  { label: "mobile", width: 390, height: 844 },
];

const publicChecks = [
  { label: "landing", path: "/", expectedPath: "/", markers: [], layout: "full-bleed-landing" },
  {
    label: "landing-reduced-motion",
    path: "/",
    expectedPath: "/",
    markers: [],
    layout: "full-bleed-landing",
    mediaMode: "reduced-motion",
  },
  {
    label: "landing-save-data",
    path: "/",
    expectedPath: "/",
    markers: [],
    layout: "full-bleed-landing",
    mediaMode: "save-data",
  },
  { label: "login", path: "/login", expectedPath: "/login", markers: ["mcp-card", "mcp-field", "mcp-input", "mcp-button"], fill: "login" },
  { label: "register", path: "/register", expectedPath: "/register", markers: ["mcp-field", "mcp-input", "mcp-button"], fill: "register" },
  { label: "about", path: "/about", expectedPath: "/about", markers: ["mcp-card", "mcp-badge"], layout: "framed-public" },
  { label: "privacy", path: "/privacy", expectedPath: "/privacy", markers: ["mcp-card", "mcp-badge"] },
  { label: "terms", path: "/terms", expectedPath: "/terms", markers: ["mcp-card", "mcp-badge"] },
];

const protectedRedirectChecks = [
  { label: "contact-redirect", path: "/contact" },
  { label: "profile-redirect", path: "/profile" },
  { label: "alerts-redirect", path: "/alerts" },
  { label: "garage-redirect", path: "/garage" },
  { label: "maintenance-redirect", path: "/maintenance" },
  { label: "glovebox-redirect", path: "/glovebox" },
  { label: "diy-redirect", path: "/diy" },
];

const authenticatedChecks = [
  { label: "home", path: "/home", markers: ["mcp-card", "mcp-button"] },
  { label: "alerts", path: "/alerts", markers: ["mcp-page-header", "mcp-card", "mcp-button"] },
  { label: "profile", path: "/profile", markers: ["mcp-card", "mcp-field", "mcp-input", "mcp-button"], fill: "profile" },
  { label: "garage", path: "/garage", markers: ["mcp-card", "mcp-button"] },
  { label: "maintenance", path: "/maintenance", markers: ["mcp-card", "mcp-button"] },
  { label: "glovebox", path: "/glovebox", markers: ["mcp-card", "mcp-button"] },
  { label: "diy", path: "/diy", markers: ["mcp-page-header"] },
  { label: "contact", path: "/contact", markers: ["mcp-card", "mcp-field", "mcp-textarea", "mcp-button"], fill: "contact" },
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

    const killServer = (signal) => {
      try {
        if (useProcessGroup) {
          process.kill(-child.pid, signal);
        } else {
          child.kill(signal);
        }
      } catch (error) {
        if (error?.code !== "ESRCH") {
          throw error;
        }
      }
    };

    const timeout = setTimeout(() => {
      killServer("SIGKILL");
      resolve();
    }, 5000);

    child.once("exit", () => {
      clearTimeout(timeout);
      resolve();
    });
    killServer("SIGTERM");
  });
}

function normalizeError(message) {
  return message.replace(/\s+/g, " ").trim();
}

function createPageFailureCollectors(page, label, viewportLabel, failures) {
  const consoleErrors = [];
  const pageErrors = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(normalizeError(message.text()));
    }
  });

  page.on("pageerror", (error) => {
    pageErrors.push(normalizeError(error.message));
  });

  return () => {
    if (consoleErrors.length > 0) {
      failures.push(`${label} (${viewportLabel}) console errors: ${consoleErrors.join(" | ")}`);
    }

    if (pageErrors.length > 0) {
      failures.push(`${label} (${viewportLabel}) page errors: ${pageErrors.join(" | ")}`);
    }
  };
}

async function getBodyHealth(page) {
  return page.locator("body").evaluate((body) => {
    const text = body.textContent?.replace(/\s+/g, " ").trim() || "";
    const box = body.getBoundingClientRect();
    return {
      textLength: text.length,
      width: Math.round(box.width),
      height: Math.round(box.height),
      hasFrameworkOverlay:
        text.includes("Unhandled Runtime Error") ||
        text.includes("Build Error") ||
        text.includes("Failed to compile") ||
        text.includes("Runtime Error"),
    };
  });
}

async function assertHealthyPage({ page, check, viewport, failures, screenshots }) {
  const health = await getBodyHealth(page);
  if (health.textLength < 20 || health.width < 100 || health.height < 100) {
    failures.push(`${check.label} (${viewport.label}) rendered blank or too small: ${JSON.stringify(health)}`);
  }

  if (health.hasFrameworkOverlay) {
    failures.push(`${check.label} (${viewport.label}) showed a framework overlay.`);
  }

  for (const marker of check.markers ?? []) {
    const count = await page.locator(`.${marker}`).count();
    if (count < 1) {
      failures.push(`${check.label} (${viewport.label}) missing package marker .${marker}`);
    }
  }

  const screenshotPath = path.join(outputDir, `${check.label}-${viewport.label}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: false, animations: "disabled" });
  screenshots.push(screenshotPath);
}

async function gotoReady(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.locator("body").waitFor({ state: "visible", timeout: 10000 });
  await page.evaluate(async () => {
    await document.fonts?.ready;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
}

async function assertPublicLayout(page, check, viewport, failures) {
  if (check.layout === "full-bleed-landing") {
    const layout = await page.evaluate(() => {
      const shell = document.querySelector(".app-shell");
      const hero = document.querySelector(".lp-road");
      const poster = document.querySelector(".lp-road-poster");
      if (!shell || !hero || !poster) return null;

      const shellBox = shell.getBoundingClientRect();
      const heroBox = hero.getBoundingClientRect();
      const posterStyle = getComputedStyle(poster);
      return {
        shellLeft: shellBox.left,
        shellRight: shellBox.right,
        heroLeft: heroBox.left,
        heroRight: heroBox.right,
        heroHeight: heroBox.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        scrollWidth: document.documentElement.scrollWidth,
        videoCount: document.querySelectorAll(".lp-road-video").length,
        posterVisible: posterStyle.display !== "none" && posterStyle.visibility !== "hidden",
      };
    });

    if (!layout) {
      failures.push(`${check.label} (${viewport.label}) missing full-bleed landing elements.`);
      return;
    }

    const edgeTolerance = 1;
    if (
      Math.abs(layout.shellLeft) > edgeTolerance ||
      Math.abs(layout.shellRight - layout.viewportWidth) > edgeTolerance ||
      Math.abs(layout.heroLeft) > edgeTolerance ||
      Math.abs(layout.heroRight - layout.viewportWidth) > edgeTolerance
    ) {
      failures.push(`${check.label} (${viewport.label}) hero did not reach the viewport edges: ${JSON.stringify(layout)}`);
    }

    if (layout.heroHeight + edgeTolerance < layout.viewportHeight) {
      failures.push(`${check.label} (${viewport.label}) hero did not fill the first viewport: ${JSON.stringify(layout)}`);
    }

    if (layout.scrollWidth > layout.viewportWidth + edgeTolerance) {
      failures.push(`${check.label} (${viewport.label}) introduced horizontal overflow: ${JSON.stringify(layout)}`);
    }

    if (check.mediaMode === "reduced-motion" || check.mediaMode === "save-data") {
      if (layout.videoCount !== 0 || !layout.posterVisible) {
        failures.push(`${check.label} (${viewport.label}) did not use the poster fallback: ${JSON.stringify(layout)}`);
      }
    }
  }

  if (check.layout === "framed-public" && viewport.label !== "mobile") {
    const frame = await page.locator(".app-shell").evaluate((shell) => {
      const box = shell.getBoundingClientRect();
      return { left: box.left, right: box.right, viewportWidth: window.innerWidth };
    });
    if (frame.left <= 1 || frame.right >= frame.viewportWidth - 1) {
      failures.push(`${check.label} (${viewport.label}) should retain its framed public-page gutters: ${JSON.stringify(frame)}`);
    }
  }
}

async function fillSafeFields(page, fillKind) {
  if (fillKind === "login") {
    await page.locator("#login-email").fill("smoke@example.com");
    await page.locator("#login-password").fill("not-submitted");
    return;
  }

  if (fillKind === "register") {
    await page.locator("#register-email").fill("smoke@example.com");
    return;
  }

  if (fillKind === "profile") {
    const displayName = page.locator("#displayName");
    if (await displayName.count()) {
      await displayName.fill("Rendered Smoke");
    }
    return;
  }

  if (fillKind === "contact") {
    const subject = page.locator("input[name='subject']").first();
    const message = page.locator("textarea[name='message']").first();
    if (await subject.count()) {
      await subject.fill("Rendered smoke check");
    }
    if (await message.count()) {
      await message.fill("This is a non-submitted rendered smoke check.");
    }
  }
}

async function checkPublicPage(browser, baseUrl, check, viewport, failures, screenshots) {
  const page = await browser.newPage({ viewport });
  const flushFailures = createPageFailureCollectors(page, check.label, viewport.label, failures);

  try {
    if (check.mediaMode === "reduced-motion") {
      await page.emulateMedia({ reducedMotion: "reduce" });
    }
    if (check.mediaMode === "save-data") {
      await page.addInitScript(() => {
        Object.defineProperty(navigator, "connection", {
          configurable: true,
          value: { saveData: true },
        });
      });
    }

    await gotoReady(page, `${baseUrl}${check.path}`);
    const currentPath = new URL(page.url()).pathname;
    if (currentPath !== check.expectedPath) {
      failures.push(`${check.label} (${viewport.label}) expected ${check.expectedPath}, reached ${currentPath}`);
    }

    if (check.fill) {
      await fillSafeFields(page, check.fill);
    }

    await assertPublicLayout(page, check, viewport, failures);
    await assertHealthyPage({ page, check, viewport, failures, screenshots });
  } catch (error) {
    failures.push(`${check.label} (${viewport.label}) failed: ${normalizeError(error.message)}`);
  } finally {
    flushFailures();
    await page.close();
  }
}

async function checkProtectedRedirect(browser, baseUrl, check, viewport, failures, screenshots) {
  const page = await browser.newPage({ viewport });
  const flushFailures = createPageFailureCollectors(page, check.label, viewport.label, failures);

  try {
    await gotoReady(page, `${baseUrl}${check.path}`);
    const currentPath = new URL(page.url()).pathname;
    if (currentPath !== "/login") {
      failures.push(`${check.label} (${viewport.label}) expected redirect to /login, reached ${currentPath}`);
    }

    await assertHealthyPage({
      page,
      check: { ...check, markers: ["mcp-card", "mcp-field", "mcp-input", "mcp-button"] },
      viewport,
      failures,
      screenshots,
    });
  } catch (error) {
    failures.push(`${check.label} (${viewport.label}) failed: ${normalizeError(error.message)}`);
  } finally {
    flushFailures();
    await page.close();
  }
}

async function login(browser, baseUrl, viewport, failures) {
  const page = await browser.newPage({ viewport });
  try {
    await gotoReady(page, `${baseUrl}/login`);
    await page.locator("#login-email").fill(smokeEmail);
    await page.locator("#login-password").fill(smokePassword);
    await page.locator("form button[type='submit']").click();
    await page.waitForURL((url) => url.pathname === "/home", { timeout: 30000 }).catch(() => {});

    if (new URL(page.url()).pathname !== "/home") {
      const bodyText = (await page.locator("body").textContent().catch(() => ""))?.replace(/\s+/g, " ").trim() || "";
      failures.push(
        `authenticated setup (${viewport.label}) did not reach /home after login; reached ${new URL(page.url()).pathname}; body: ${bodyText.slice(0, 160)}`,
      );
      return null;
    }

    return await page.context().storageState();
  } catch (error) {
    failures.push(`authenticated setup (${viewport.label}) failed: ${normalizeError(error.message)}`);
    return null;
  } finally {
    await page.close();
  }
}

async function checkAuthenticatedPage(browser, baseUrl, storageState, check, viewport, failures, screenshots) {
  const context = await browser.newContext({ viewport, storageState });
  const page = await context.newPage();
  const flushFailures = createPageFailureCollectors(page, check.label, viewport.label, failures);
  const redirects = [];
  page.on("response", (response) => {
    if (response.status() >= 300 && response.status() < 400) {
      redirects.push(`${response.status()} ${response.url()} -> ${response.headers().location ?? "(no location)"}`);
    }
  });

  try {
    if (check.label === "home") {
      await page.route("https://ipapi.co/json/", (route) => route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ city: "San Diego", region_code: "CA", latitude: 32.7157, longitude: -117.1611 }),
      }));
    }

    await gotoReady(page, `${baseUrl}${check.path}`);
    const currentPath = new URL(page.url()).pathname;
    if (currentPath !== check.path) {
      failures.push(`${check.label} (${viewport.label}) expected ${check.path}, reached ${currentPath}`);
    }

    if (check.fill) {
      await fillSafeFields(page, check.fill);
    }

    if (check.label === "home" && viewport.label === "mobile") {
      const menuButton = page.getByRole("button", { name: "Open application menu" });
      await menuButton.click();
      const drawer = page.locator("#authenticated-navigation-drawer");
      if ((await drawer.getAttribute("aria-hidden")) !== "false") {
        failures.push("home (mobile) application drawer did not open");
      }
      await page.keyboard.press("Escape");
      if ((await drawer.getAttribute("aria-hidden")) !== "true") {
        failures.push("home (mobile) application drawer did not close with Escape");
      }
    }

    if (check.label === "alerts") {
      const alertBadges = page.locator("a[href='/alerts'] .nav-alert-count");
      await alertBadges.first().waitFor({ state: "attached" });
      const badgeLabels = await alertBadges.evaluateAll((badges) => (
        badges.map((badge) => badge.getAttribute("aria-label"))
      ));

      if (badgeLabels.length !== 2 || badgeLabels.some((label) => !/^\d+ active alerts?$/.test(label ?? ""))) {
        failures.push(`${check.label} (${viewport.label}) navigation did not show matching active-alert badges`);
      }

      if (viewport.label === "mobile") {
        await page.getByRole("button", { name: "Open application menu" }).click();
        const drawerBadge = page.locator("#authenticated-navigation-drawer a[href='/alerts'] .nav-alert-count");
        if (!(await drawerBadge.isVisible())) {
          failures.push(`${check.label} (mobile) active-alert badge was not visible in the open drawer`);
        }
        await page.keyboard.press("Escape");
      } else {
        const sidebarBadge = page.locator("aside[aria-label='Application sidebar'] a[href='/alerts'] .nav-alert-count");
        if (!(await sidebarBadge.isVisible())) {
          failures.push(`${check.label} (${viewport.label}) active-alert badge was not visible in the sidebar`);
        }
      }
    }

    if (check.label === "glovebox") {
      const registrationDetails = page.locator("#setup-docs > details");
      await registrationDetails.locator(":scope > summary").click();

      const registrationCarousel = page.locator(".glovebox-registration-carousel");
      await registrationCarousel.waitFor({ state: "visible" });
      await registrationCarousel.scrollIntoViewIfNeeded();
      const registrationLayout = await registrationCarousel.evaluate((carousel) => ({
        dateFields: carousel.querySelectorAll("input[type='date']").length,
        fileFields: carousel.querySelectorAll("input[type='file']").length,
        navigationButtons: carousel.querySelectorAll(".glovebox-registration-carousel-button").length,
        scrollWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
      }));

      if (
        registrationLayout.dateFields !== 1 ||
        registrationLayout.fileFields !== 1 ||
        registrationLayout.navigationButtons !== 2
      ) {
        failures.push(
          `glovebox (${viewport.label}) registration carousel was incomplete: ${JSON.stringify(registrationLayout)}`,
        );
      }

      if (registrationLayout.scrollWidth > registrationLayout.viewportWidth + 1) {
        failures.push(
          `glovebox (${viewport.label}) registration carousel introduced horizontal overflow: ${JSON.stringify(registrationLayout)}`,
        );
      }
    }

    await assertHealthyPage({ page, check, viewport, failures, screenshots });
  } catch (error) {
    const redirectSummary = redirects.length > 0 ? `; redirects: ${redirects.join(" | ")}` : "";
    failures.push(`${check.label} (${viewport.label}) failed: ${normalizeError(error.message)}${redirectSummary}`);
  } finally {
    flushFailures();
    await context.close();
  }
}

await mkdir(outputDir, { recursive: true });

const port = await getFreePort();
const baseUrl = `http://localhost:${port}`;
const server = spawn(npmCommand, ["run", "start", "--", "-p", String(port), "-H", "127.0.0.1"], {
  cwd: repoRoot,
  detached: useProcessGroup,
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
const screenshots = [];
const notes = [];
const browser = await chromium.launch({ headless: true });

try {
  await waitForServer(baseUrl);

  for (const viewport of viewports) {
    for (const check of publicChecks) {
      await checkPublicPage(browser, baseUrl, check, viewport, failures, screenshots);
    }

    for (const check of protectedRedirectChecks) {
      await checkProtectedRedirect(browser, baseUrl, check, viewport, failures, screenshots);
    }
  }

  if (smokeEmail && smokePassword) {
    for (const [viewportIndex, viewport] of viewports.entries()) {
      // Better Auth's production limiter uses a 10-second window. Reset that
      // window between full authenticated viewport sweeps so this synthetic
      // burst does not turn a healthy session into a login redirect loop.
      if (viewportIndex > 0) {
        await wait(10_500);
      }

      const storageState = await login(browser, baseUrl, viewport, failures);
      if (!storageState) {
        continue;
      }

      for (const check of authenticatedChecks) {
        await checkAuthenticatedPage(browser, baseUrl, storageState, check, viewport, failures, screenshots);
      }
    }
  } else {
    notes.push("Authenticated render checks skipped; set DESIGN_SYSTEM_SMOKE_EMAIL and DESIGN_SYSTEM_SMOKE_PASSWORD to enable them.");
  }
} finally {
  await browser.close();
  await stopServer(server);
}

if (failures.length > 0) {
  console.error("Rendered app design-system smoke failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  for (const note of notes) {
    console.error(`Note: ${note}`);
  }
  console.error(`Screenshots saved to ${outputDir}`);
  console.error("\nNext server output:");
  console.error(serverOutput.trim());
  process.exit(1);
}

console.log("Rendered app design-system smoke passed.");
console.log(`Checked ${publicChecks.length} public routes and ${protectedRedirectChecks.length} protected redirects across ${viewports.length} viewports.`);
if (smokeEmail && smokePassword) {
  console.log(`Checked ${authenticatedChecks.length} authenticated routes across ${viewports.length} viewports.`);
}
for (const note of notes) {
  console.log(`Note: ${note}`);
}
console.log(`Screenshots saved to ${outputDir}`);
for (const screenshot of screenshots) {
  console.log(`- ${screenshot}`);
}
