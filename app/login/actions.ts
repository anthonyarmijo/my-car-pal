"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthRateLimitAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { APIError } from "better-auth/api";
import {
  clearAuthRateLimit,
  createAuthRateLimitContext,
  incrementAuthRateLimit,
  isAuthRateLimited,
} from "@/lib/auth-rate-limit";
import type { SignupFormState } from "@/app/register/state";

const AUTH_RATE_LIMIT_MAX_ATTEMPTS = 5;
const LOGIN_RATE_LIMIT_MESSAGE = "Too many login attempts. Please wait a minute and try again.";
const SIGNUP_RATE_LIMIT_MESSAGE = "Too many signup attempts. Please wait a minute and try again.";

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  if (password.length > 128) {
    return "Password must be 128 characters or fewer.";
  }
  return null;
}

function getApiErrorCode(error: APIError): string {
  const body = (error as APIError & { body?: { code?: unknown } }).body;
  return typeof body?.code === "string" ? body.code : "";
}

function getApiErrorMessage(error: APIError): string {
  const body = (error as APIError & { body?: { message?: unknown } }).body;
  return typeof body?.message === "string" ? body.message : error.message;
}

function toSignupApiErrorState(error: APIError): SignupFormState {
  const code = getApiErrorCode(error);
  const message = getApiErrorMessage(error);

  if (
    code === "USER_ALREADY_EXISTS" ||
    code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL" ||
    message.toLowerCase().includes("user already exists")
  ) {
    return {
      status: "error",
      message: "An account with that email already exists.",
      fieldErrors: {
        email: "That email already has an account. Try logging in instead.",
      },
    };
  }

  if (code === "PASSWORD_TOO_SHORT") {
    return {
      status: "error",
      message: "Password must be at least 8 characters.",
      fieldErrors: {
        password: "Password must be at least 8 characters.",
      },
    };
  }

  if (code === "PASSWORD_TOO_LONG") {
    return {
      status: "error",
      message: "Password must be 128 characters or fewer.",
      fieldErrors: {
        password: "Password must be 128 characters or fewer.",
      },
    };
  }

  console.error("Signup failed", {
    statusCode: error.statusCode,
    code: code || "UNKNOWN",
    message: message || "Unknown Better Auth error",
  });

  return {
    status: "error",
    message: "Could not create account. Please try again.",
    fieldErrors: {},
  };
}

function toPageError(pathname: "/login" | "/register", message: string): never {
  const params = new URLSearchParams({ error: message });
  redirect(`${pathname}?${params.toString()}`);
}

async function hasLegacyPasswordOnlyAccount(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      passwordHash: true,
      accounts: {
        where: { providerId: "credential" },
        select: { id: true },
        take: 1,
      },
    },
  });

  return Boolean(user?.passwordHash && user.accounts.length === 0);
}

export async function loginAction(formData: FormData): Promise<void> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    toPageError("/login", "Email and password are required.");
  }

  if (await hasLegacyPasswordOnlyAccount(email)) {
    toPageError(
      "/login",
      "This email belongs to a retired legacy account and cannot use the current login flow.",
    );
  }

  const rateLimitContext = createAuthRateLimitContext(AuthRateLimitAction.LOGIN, await headers());
  if (await isAuthRateLimited(rateLimitContext, AUTH_RATE_LIMIT_MAX_ATTEMPTS)) {
    toPageError("/login", LOGIN_RATE_LIMIT_MESSAGE);
  }

  try {
    const result = await auth.api.signInEmail({
      body: { email, password },
    });

    if (!result?.user) {
      await incrementAuthRateLimit(rateLimitContext);
      toPageError("/login", "Invalid email or password.");
    }
  } catch (error) {
    if (error instanceof APIError) {
      await incrementAuthRateLimit(rateLimitContext);
    }
    const message =
      error instanceof APIError
        ? "Invalid email or password."
        : "An unexpected error occurred. Please try again.";
    toPageError("/login", message);
  }

  await clearAuthRateLimit(rateLimitContext);
  redirect("/home");
}

export async function signupAction(
  _prevState: SignupFormState,
  formData: FormData,
): Promise<SignupFormState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return {
      status: "error",
      message: "Email and password are required.",
      fieldErrors: {
        email: !email ? "Enter your email address." : undefined,
        password: !password ? "Enter a password." : undefined,
      },
    };
  }

  if (!validateEmail(email)) {
    return {
      status: "error",
      message: "Enter a valid email address.",
      fieldErrors: {
        email: "Enter a valid email address.",
      },
    };
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return {
      status: "error",
      message: passwordError,
      fieldErrors: {
        password: passwordError,
      },
    };
  }

  if (await hasLegacyPasswordOnlyAccount(email)) {
    return {
      status: "error",
      message: "That email is tied to a retired legacy account and cannot be reused in the current signup flow.",
      fieldErrors: {
        email: "Use a different email address for a new account.",
      },
    };
  }

  const rateLimitContext = createAuthRateLimitContext(AuthRateLimitAction.SIGNUP, await headers());
  if (await isAuthRateLimited(rateLimitContext, AUTH_RATE_LIMIT_MAX_ATTEMPTS)) {
    return {
      status: "error",
      message: SIGNUP_RATE_LIMIT_MESSAGE,
      fieldErrors: {},
    };
  }

  await incrementAuthRateLimit(rateLimitContext);

  try {
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        // Better Auth requires a name field; default to email prefix, user can
        // update it later in their profile.
        name: email.split("@")[0],
      },
    });
  } catch (error) {
    if (error instanceof APIError) {
      return toSignupApiErrorState(error);
    }

    return {
      status: "error",
      message: "An unexpected error occurred. Please try again.",
      fieldErrors: {},
    };
  }

  redirect("/register?welcome=1");
}

export async function logoutAction(): Promise<void> {
  await auth.api.signOut({ headers: await headers() }).catch(() => {});
  redirect("/login");
}
