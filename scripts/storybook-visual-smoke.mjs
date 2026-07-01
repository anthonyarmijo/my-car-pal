import { createServer } from "node:http";
import { readFile, stat, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const storybookDir = path.join(repoRoot, "storybook-static");
const outputDir = process.env.STORYBOOK_VISUAL_OUTPUT_DIR || path.join("/tmp", "my-car-pal-storybook-visual-smoke");

const stories = [
  { id: "design-system-tokens--desert-graphite-palette", label: "tokens" },
  { id: "design-system-primitives--buttons-and-badges", label: "buttons-badges" },
  { id: "design-system-primitives--cards-and-header", label: "cards-header" },
  { id: "design-system-primitives--feedback-states", label: "feedback-states" },
  { id: "design-system-forms--vehicle-details", label: "forms-vehicle-details" },
  { id: "design-system-forms--validation", label: "forms-validation" },
  { id: "design-system-forms--auth-entry-composition", label: "forms-auth-entry" },
  { id: "design-system-app-compositions--authenticated-page-header-action-cluster", label: "app-auth-header" },
  { id: "design-system-app-compositions--garage-empty-first-run-state", label: "app-garage-empty" },
  { id: "design-system-app-compositions--maintenance-reminder-service-feedback-state", label: "app-maintenance-feedback" },
  { id: "design-system-app-compositions--glovebox-document-insurance-status-state", label: "app-glovebox-status" },
  { id: "design-system-app-compositions--alert-callout-variants", label: "app-alert-variants" },
];

const viewports = [
  { label: "desktop", width: 1280, height: 860 },
  { label: "mobile", width: 390, height: 844 },
];

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".map", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
]);

function isInside(parent, child) {
  const relative = path.relative(parent, child);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

async function resolveStaticPath(requestUrl) {
  const url = new URL(requestUrl, "http://127.0.0.1");
  const decodedPathname = decodeURIComponent(url.pathname);
  const pathname = decodedPathname === "/" ? "/index.html" : decodedPathname;
  let candidate = path.join(storybookDir, pathname);

  if (!isInside(storybookDir, candidate)) {
    return null;
  }

  try {
    const stats = await stat(candidate);
    if (stats.isDirectory()) {
      candidate = path.join(candidate, "index.html");
    }
    return candidate;
  } catch {
    return null;
  }
}

function createStaticServer() {
  const server = createServer(async (request, response) => {
    const filePath = await resolveStaticPath(request.url || "/");

    if (!filePath) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.setHeader("Content-Type", mimeTypes.get(path.extname(filePath)) || "application/octet-stream");
    const body = await readFile(filePath);
    response.end(body);
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

function normalizeError(message) {
  return message.replace(/\s+/g, " ").trim();
}

if (!existsSync(path.join(storybookDir, "index.html"))) {
  console.error("storybook-static was not found. Run `npm run build-storybook` before `npm run test:storybook:visual`.");
  process.exit(1);
}

await mkdir(outputDir, { recursive: true });

const server = await createStaticServer();
const address = server.address();
const port = typeof address === "object" && address ? address.port : 0;
const baseUrl = `http://127.0.0.1:${port}`;
const browser = await chromium.launch({ headless: true });
const failures = [];
const screenshots = [];

try {
  for (const story of stories) {
    for (const viewport of viewports) {
      const page = await browser.newPage({ viewport });
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

      const url = `${baseUrl}/iframe.html?id=${story.id}&viewMode=story`;
      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.locator("#storybook-root").waitFor({ state: "visible", timeout: 10000 });

        const rootHealth = await page.locator("#storybook-root").evaluate((root) => {
          const elementCount = root.querySelectorAll("*").length;
          const text = root.textContent?.replace(/\s+/g, " ").trim() || "";
          const box = root.getBoundingClientRect();
          return {
            elementCount,
            textLength: text.length,
            width: Math.round(box.width),
            height: Math.round(box.height),
            hasFrameworkOverlay:
              document.body.textContent?.includes("Unhandled Runtime Error") ||
              document.body.textContent?.includes("Build Error") ||
              document.body.textContent?.includes("Failed to compile"),
          };
        });

        const screenshotPath = path.join(outputDir, `${story.label}-${viewport.label}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: false });
        screenshots.push(screenshotPath);

        if (rootHealth.elementCount < 1 || rootHealth.textLength < 8 || rootHealth.width < 100 || rootHealth.height < 80) {
          failures.push(`${story.label} (${viewport.label}) rendered blank or too small: ${JSON.stringify(rootHealth)}`);
        }

        if (rootHealth.hasFrameworkOverlay) {
          failures.push(`${story.label} (${viewport.label}) showed a framework overlay.`);
        }

        if (consoleErrors.length > 0) {
          failures.push(`${story.label} (${viewport.label}) console errors: ${consoleErrors.join(" | ")}`);
        }

        if (pageErrors.length > 0) {
          failures.push(`${story.label} (${viewport.label}) page errors: ${pageErrors.join(" | ")}`);
        }
      } catch (error) {
        failures.push(`${story.label} (${viewport.label}) failed to load: ${normalizeError(error.message)}`);
      } finally {
        await page.close();
      }
    }
  }
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

if (failures.length > 0) {
  console.error("Storybook visual smoke failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  console.error(`Screenshots saved to ${outputDir}`);
  process.exit(1);
}

console.log("Storybook visual smoke passed.");
console.log(`Checked ${stories.length} stories across ${viewports.length} viewports.`);
console.log(`Screenshots saved to ${outputDir}`);
for (const screenshot of screenshots) {
  console.log(`- ${screenshot}`);
}
