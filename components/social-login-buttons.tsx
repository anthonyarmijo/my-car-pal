"use client";

import { authClient } from "@/lib/auth-client";

type Props = {
  callbackURL?: string;
  errorCallbackURL?: string;
  newUserCallbackURL?: string;
};

function buildSocialErrorURL(pathname: string | undefined, provider: "apple" | "google") {
  const destination = pathname?.trim() || "/login";
  const url = new URL(destination, window.location.origin);
  url.searchParams.set("error", `${provider}_sign_in_failed`);
  return url.toString();
}

export function SocialLoginButtons({
  callbackURL = "/home",
  errorCallbackURL = "/login",
  newUserCallbackURL,
}: Props) {
  const socialEnabled = process.env.NEXT_PUBLIC_ENABLE_SOCIAL_AUTH === "1";
  const explicitAppleFlag = process.env.NEXT_PUBLIC_ENABLE_APPLE_AUTH;
  const appleEnabled = socialEnabled && (explicitAppleFlag == null ? true : explicitAppleFlag === "1");
  const googleEnabled = socialEnabled;

  const handleApple = async () => {
    try {
      await authClient.signIn.social({
        provider: "apple",
        callbackURL,
        errorCallbackURL,
        newUserCallbackURL,
      });
    } catch {
      window.location.assign(buildSocialErrorURL(errorCallbackURL, "apple"));
    }
  };

  const handleGoogle = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL,
        errorCallbackURL,
        newUserCallbackURL,
      });
    } catch {
      window.location.assign(buildSocialErrorURL(errorCallbackURL, "google"));
    }
  };

  if (!socialEnabled) {
    return <p className="social-login-unavailable">Social login is available on production only.</p>;
  }

  return (
    <div className="social-login-stack">
      {googleEnabled ? (
        <button type="button" onClick={() => void handleGoogle()} className="social-login-button social-login-button-google">
          {/* Google G logo SVG */}
          <svg width="17" height="17" viewBox="0 0 18 18" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
            />
            <path
              fill="#34A853"
              d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
            />
            <path
              fill="#FBBC05"
              d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
            />
            <path
              fill="#EA4335"
              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"
            />
          </svg>
          Continue with Google
        </button>
      ) : null}

      {appleEnabled ? (
        <button type="button" onClick={() => void handleApple()} className="social-login-button social-login-button-apple">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M16.37 12.18c-.02-2.18 1.78-3.23 1.86-3.28-1.02-1.49-2.6-1.7-3.16-1.72-1.34-.14-2.63.8-3.31.8-.69 0-1.74-.78-2.86-.76-1.47.02-2.83.86-3.59 2.19-1.54 2.67-.39 6.61 1.1 8.76.73 1.05 1.59 2.24 2.72 2.2 1.09-.05 1.5-.69 2.82-.69 1.31 0 1.68.69 2.84.67 1.17-.02 1.92-1.06 2.65-2.12.83-1.21 1.18-2.38 1.2-2.44-.03-.01-2.29-.88-2.31-3.61Zm-2.18-6.37c.61-.74 1.02-1.77.91-2.8-.88.04-1.95.59-2.58 1.33-.57.66-1.07 1.71-.94 2.72.98.08 1.98-.5 2.61-1.25Z" />
          </svg>
          Continue with Apple
        </button>
      ) : null}

      {googleEnabled || appleEnabled ? (
        <div className="social-login-divider">
          <span />
          <span>or</span>
          <span />
        </div>
      ) : null}
    </div>
  );
}
