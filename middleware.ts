import { NextRequest, NextResponse } from "next/server";
import { betterFetch } from "@better-fetch/fetch";

// Paths that are public once the app itself is live.
const PUBLIC_PATHS = [
  "/auth-error",
  "/login",
  "/register",
  "/about",
  "/api/auth",
  "/api/health",
  "/privacy",
  "/terms",
  "/.well-known",
];

// Paths that require authentication
const PROTECTED_PREFIXES = [
  "/home",
  "/garage",
  "/vehicle",
  "/maintenance",
  "/glovebox",
  "/profile",
  "/diy",
  "/contact",
  "/api/notifications",
  "/api/mechanics",
  "/api/profile",
];

type Session = {
  user: { id: string; email: string };
  session: { id: string };
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow Better Auth API routes through unconditionally
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Allow explicitly public paths through
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (isPublic) {
    return NextResponse.next();
  }

  // Only enforce auth on explicitly protected paths
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) {
    return NextResponse.next();
  }

  // Use betterFetch to check session — avoids importing the Node.js-only server
  // bundle (which uses node:crypto) in the Edge Runtime.
  // Call the local app process directly so this does not depend on external DNS.
  const configuredBaseURL = process.env.INTERNAL_AUTH_BASE_URL?.trim();
  const baseURL = configuredBaseURL || request.nextUrl.origin;

  let session: Session | null = null;

  try {
    const response = await betterFetch<Session>("/api/auth/get-session", {
      baseURL,
      headers: { cookie: request.headers.get("cookie") ?? "" },
    });
    session = response.data ?? null;
  } catch (error) {
    console.error("[middleware] failed to fetch auth session", {
      pathname,
      baseURL,
      error,
    });
  }

  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
