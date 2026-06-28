function sanitizeConfiguredValue(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }

  if (trimmed.startsWith("<") && trimmed.endsWith(">")) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function parseConfiguredURL(value: string | undefined): URL | null {
  const sanitized = sanitizeConfiguredValue(value);
  if (!sanitized) {
    return null;
  }

  try {
    return new URL(sanitized);
  } catch {
    return null;
  }
}

function parseConfiguredHost(value: string | undefined): URL | null {
  const sanitized = sanitizeConfiguredValue(value);
  if (!sanitized) {
    return null;
  }

  const host = sanitized.replace(/^https?:\/\//, "");
  if (!host) {
    return null;
  }

  try {
    return new URL(`https://${host}`);
  } catch {
    return null;
  }
}

export function getConfiguredAuthOrigins() {
  return [
    parseConfiguredURL(process.env.BETTER_AUTH_URL),
    parseConfiguredURL(process.env.NEXT_PUBLIC_BETTER_AUTH_URL),
    parseConfiguredHost(process.env.VERCEL_URL),
    parseConfiguredHost(process.env.VERCEL_BRANCH_URL),
    parseConfiguredHost(process.env.VERCEL_PROJECT_PRODUCTION_URL),
  ].filter((value): value is URL => value !== null);
}

export function buildAuthBaseURLConfig() {
  const configuredURLs = getConfiguredAuthOrigins();
  const allowedHosts = new Set<string>();

  for (const url of configuredURLs) {
    allowedHosts.add(url.origin);
  }

  if (process.env.NODE_ENV !== "production") {
    allowedHosts.add("http://localhost:*");
    allowedHosts.add("http://127.0.0.1:*");
    allowedHosts.add("http://[::1]:*");
    allowedHosts.add("http://*.ts.net");
    allowedHosts.add("http://*.ts.net:*");
    allowedHosts.add("https://*.ts.net");
    allowedHosts.add("https://*.ts.net:*");
  }

  const fallback = configuredURLs[0]?.origin ?? configuredURLs[1]?.origin;

  if (allowedHosts.size === 0) {
    return fallback;
  }

  return {
    allowedHosts: [...allowedHosts],
    fallback,
    protocol: "auto" as const,
  };
}

export function buildTrustedOrigins() {
  const trustedOrigins = new Set<string>(["https://appleid.apple.com"]);

  for (const url of getConfiguredAuthOrigins()) {
    trustedOrigins.add(url.origin);
  }

  if (process.env.NODE_ENV !== "production") {
    trustedOrigins.add("http://localhost:*");
    trustedOrigins.add("http://127.0.0.1:*");
    trustedOrigins.add("http://[::1]:*");
    trustedOrigins.add("http://*.ts.net");
    trustedOrigins.add("http://*.ts.net:*");
    trustedOrigins.add("https://*.ts.net");
    trustedOrigins.add("https://*.ts.net:*");
  }

  return [...trustedOrigins];
}
