import { createAuthClient } from "better-auth/react";

function sanitizeBaseURL(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;

  if (trimmed.startsWith("<") && trimmed.endsWith(">")) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

const configuredBaseURL = sanitizeBaseURL(process.env.NEXT_PUBLIC_BETTER_AUTH_URL);
const runtimeBaseURL =
  typeof window !== "undefined" ? window.location.origin : configuredBaseURL;

export const authClient = createAuthClient({
  baseURL: runtimeBaseURL,
});

export const { signIn, signUp, signOut, useSession } = authClient;
