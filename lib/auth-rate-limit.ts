import "server-only";

import crypto from "node:crypto";
import { AuthRateLimitAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const WINDOW_MS = 60 * 1000;
const RETENTION_MS = 24 * 60 * 60 * 1000;

type AuthRateLimitContext = {
  action: AuthRateLimitAction;
  subjectHash: string;
  windowStart: Date;
};

function normalizeForwardedIp(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value
    .split(",")[0]
    ?.trim()
    .replace(/^"(.*)"$/, "$1");

  return trimmed || null;
}

export function getClientIp(headers: Headers): string {
  const forwarded = normalizeForwardedIp(headers.get("x-forwarded-for"));
  if (forwarded) {
    return forwarded;
  }

  const realIp = normalizeForwardedIp(headers.get("x-real-ip"));
  if (realIp) {
    return realIp;
  }

  const cloudflareIp = normalizeForwardedIp(headers.get("cf-connecting-ip"));
  if (cloudflareIp) {
    return cloudflareIp;
  }

  return "unknown";
}

function hashSubject(rawValue: string): string {
  const secret = process.env.BETTER_AUTH_SECRET?.trim() || "missing-better-auth-secret";
  return crypto.createHmac("sha256", secret).update(rawValue).digest("hex");
}

function getWindowStart(now = new Date()): Date {
  const time = now.getTime();
  return new Date(Math.floor(time / WINDOW_MS) * WINDOW_MS);
}

async function cleanupExpiredBuckets(now: Date): Promise<void> {
  const cutoff = new Date(now.getTime() - RETENTION_MS);
  await prisma.authRateLimitBucket.deleteMany({
    where: {
      windowStart: {
        lt: cutoff,
      },
    },
  });
}

export function createAuthRateLimitContext(action: AuthRateLimitAction, headers: Headers): AuthRateLimitContext {
  return {
    action,
    subjectHash: hashSubject(getClientIp(headers)),
    windowStart: getWindowStart(),
  };
}

export async function isAuthRateLimited(context: AuthRateLimitContext, maxAttempts: number): Promise<boolean> {
  const bucket = await prisma.authRateLimitBucket.findUnique({
    where: {
      action_subjectHash_windowStart: {
        action: context.action,
        subjectHash: context.subjectHash,
        windowStart: context.windowStart,
      },
    },
    select: {
      attemptCount: true,
    },
  });

  return (bucket?.attemptCount ?? 0) >= maxAttempts;
}

export async function incrementAuthRateLimit(context: AuthRateLimitContext): Promise<void> {
  await prisma.authRateLimitBucket.upsert({
    where: {
      action_subjectHash_windowStart: {
        action: context.action,
        subjectHash: context.subjectHash,
        windowStart: context.windowStart,
      },
    },
    create: {
      action: context.action,
      subjectHash: context.subjectHash,
      windowStart: context.windowStart,
      attemptCount: 1,
    },
    update: {
      attemptCount: {
        increment: 1,
      },
    },
  });

  await cleanupExpiredBuckets(context.windowStart);
}

export async function clearAuthRateLimit(context: AuthRateLimitContext): Promise<void> {
  await prisma.authRateLimitBucket.deleteMany({
    where: {
      action: context.action,
      subjectHash: context.subjectHash,
    },
  });

  await cleanupExpiredBuckets(context.windowStart);
}

export async function consumeAuthRateLimit(
  context: AuthRateLimitContext,
  maxAttempts: number,
): Promise<{ limited: boolean }> {
  if (await isAuthRateLimited(context, maxAttempts)) {
    return { limited: true };
  }

  await incrementAuthRateLimit(context);
  return { limited: false };
}
