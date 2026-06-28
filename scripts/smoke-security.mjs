const args = new Map(
  process.argv.slice(2).map((value) => {
    const [key, rawValue] = value.split("=", 2);
    return [key, rawValue ?? "true"];
  }),
);

const baseUrl = args.get("--base-url") ?? process.argv[2];

if (!baseUrl) {
  console.error(
    "Usage: node scripts/smoke-security.mjs --base-url=http://localhost:3000",
  );
  process.exit(1);
}

function resolveUrl(pathname) {
  return new URL(pathname, baseUrl).toString();
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function fetchManual(pathname, options = {}) {
  const headers = {
    "user-agent": "my-car-pal-security-smoke/1.0",
    ...(options.headers ?? {}),
  };

  return fetch(resolveUrl(pathname), {
    method: options.method ?? "GET",
    redirect: "manual",
    headers,
    body: options.body,
  });
}

async function main() {
  const protectedHome = await fetchManual("/home");
  assert(
    [302, 307, 308].includes(protectedHome.status),
    `/home returned ${protectedHome.status}; expected redirect to /login.`,
  );
  assert(
    (protectedHome.headers.get("location") ?? "").includes("/login"),
    `/home redirected to ${protectedHome.headers.get("location") ?? "<empty>"} instead of /login.`,
  );

  const files = await fetchManual("/api/files?locator=blob:security/test.pdf");
  assert(files.status === 401, `/api/files returned ${files.status} instead of 401.`);

  const health = await fetchManual("/api/health");
  assert(health.status === 200, `/api/health returned ${health.status} instead of 200.`);

  const vinDecode = await fetchManual("/api/vin/decode", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ vin: "1HGCM82633A004352" }),
  });
  assert(vinDecode.status === 401, `/api/vin/decode returned ${vinDecode.status} instead of 401.`);

  console.log("PASS Unauthenticated /home redirects to /login.");
  console.log("PASS Unauthenticated /api/files returns 401.");
  console.log("PASS Public /api/health returns 200.");
  console.log("PASS Unauthenticated /api/vin/decode returns 401.");
}

main().catch((error) => {
  console.error(`FAIL ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
