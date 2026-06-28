function decodeErrorValue(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function humanizeErrorCode(value: string): string {
  const normalized = value.replace(/[_-]+/g, " ").trim();
  if (!normalized) {
    return "We couldn't finish sign-in. Please try again.";
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function getAuthErrorMessage(value: string | undefined): string {
  const decoded = decodeErrorValue(value ?? "").trim();
  if (!decoded) {
    return "";
  }

  const normalized = decoded.toLowerCase();

  switch (normalized) {
    case "unknown":
      return "We couldn't finish sign-in. Please try again.";
    case "apple_sign_in_failed":
      return "Apple sign-in couldn't start. Please try again.";
    case "google_sign_in_failed":
      return "Google sign-in couldn't start. Please try again.";
    case "access_denied":
    case "authorization_denied":
      return "Sign-in was canceled before it could finish.";
    case "state_not_found":
    case "state_mismatch":
    case "state_security_mismatch":
    case "please_restart_the_process":
      return "Your sign-in session expired before it could finish. Please try again.";
    case "invalid_callback_request":
      return "We couldn't finish sign-in because the provider response was incomplete. Please try again.";
    case "invalid_code":
    case "oauth_code_verification_failed":
      return "We couldn't verify the sign-in response. Please try again.";
    case "email_not_found":
    case "user_email_not_found":
    case "unable_to_get_user_info":
      return "We couldn't get your email from the provider. Please try another sign-in method.";
    case "oauth_provider_not_found":
      return "That sign-in option is temporarily unavailable. Please try email and password.";
    default:
      break;
  }

  if (/\s/.test(decoded) && !decoded.includes("_")) {
    return decoded;
  }

  return humanizeErrorCode(decoded);
}
