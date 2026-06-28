import type { NextConfig } from "next";

const CONTENT_SECURITY_POLICY_REPORT_ONLY = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "object-src 'none'",
  "script-src 'self' 'sha256-l45yZAs3Mzu9Ji/F4KpAZZabNiliSRhyFHaed+mUmvg='",
  "img-src 'self' data: blob:",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "connect-src 'self' https://api.open-meteo.com https://geocoding-api.open-meteo.com https://ipapi.co",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  typedRoutes: true,
  transpilePackages: ["@my-car-pal/ui"],
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Content-Security-Policy-Report-Only", value: CONTENT_SECURITY_POLICY_REPORT_ONLY },
        ],
      },
    ];
  },
};

export default nextConfig;
