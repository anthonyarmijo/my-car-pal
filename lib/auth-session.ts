import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// ---------------------------------------------------------------------------
// Compatibility shim — public API unchanged from the old custom auth system.
// Internally delegates to Better Auth so the rest of the codebase keeps working
// without per-file changes.
//
// Removed exports (now handled by Better Auth API routes + auth-client):
//   hashPassword, verifyPassword, createSession, clearSession
// ---------------------------------------------------------------------------

export async function getCurrentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}
