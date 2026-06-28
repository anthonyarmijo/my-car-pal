import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { buildAuthBaseURLConfig, buildTrustedOrigins } from "@/lib/auth-origins";

// ---------------------------------------------------------------------------
// Scrypt password helpers for Better Auth credential accounts.
// Legacy User.passwordHash migration is intentionally not wired into sign-in.
// ---------------------------------------------------------------------------

async function scryptHash(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function scryptVerify(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  try {
    const computed = crypto.scryptSync(password, salt, 64).toString("hex");
    const expectedBuffer = Buffer.from(hash, "hex");
    const computedBuffer = Buffer.from(computed, "hex");
    if (expectedBuffer.length !== computedBuffer.length) return false;
    return crypto.timingSafeEqual(expectedBuffer, computedBuffer);
  } catch {
    return false;
  }
}

function isEnabled(value: string | undefined): boolean {
  return value?.trim() === "1";
}

const socialAuthEnabled = isEnabled(process.env.NEXT_PUBLIC_ENABLE_SOCIAL_AUTH);
const explicitAppleAuthFlag = process.env.NEXT_PUBLIC_ENABLE_APPLE_AUTH;
const appleAuthEnabled = socialAuthEnabled && (explicitAppleAuthFlag == null ? true : isEnabled(explicitAppleAuthFlag));
const isProduction = process.env.NODE_ENV === "production";

// ---------------------------------------------------------------------------
// Better Auth instance
// ---------------------------------------------------------------------------

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: buildAuthBaseURLConfig(),
  trustedOrigins: buildTrustedOrigins(),

  // Keep credential-account password hashing stable and explicit.
  emailAndPassword: {
    enabled: true,
    password: {
      hash: scryptHash,
      verify: ({ hash, password }: { hash: string; password: string }) =>
        Promise.resolve(scryptVerify(password, hash)),
    },
  },

  socialProviders: socialAuthEnabled
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID ?? "",
          clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        },
        ...(appleAuthEnabled
          ? {
              apple: {
                clientId: process.env.APPLE_CLIENT_ID ?? "",
                clientSecret: process.env.APPLE_CLIENT_SECRET ?? "",
              },
            }
          : {}),
      }
    : undefined,

  // nextCookies plugin enables auth.api.* calls from Next.js server actions
  // to automatically set cookies via next/headers.
  plugins: [nextCookies()],

  onAPIError: {
    errorURL: "/auth-error",
  },

  advanced: isProduction
    ? {
        cookies: {
          state: {
            attributes: {
              sameSite: "none",
              secure: true,
            },
          },
          oauth_state: {
            attributes: {
              sameSite: "none",
              secure: true,
            },
          },
        },
      }
    : undefined,

  // Legacy password migration is disabled until a constrained, explicit
  // migration flow is implemented against the current Better Auth hook API.
});

export type Session = typeof auth.$Infer.Session;
