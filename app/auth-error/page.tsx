import Link from "next/link";
import { getAuthErrorMessage } from "@/lib/auth-error-copy";
import { Badge, Card, FormMessage, getButtonClassName } from "@my-car-pal/ui";

type AuthErrorPageProps = {
  searchParams: Promise<{
    error?: string;
    error_description?: string;
    state?: string;
  }>;
};

function decodeValue(value: string | undefined) {
  if (!value) {
    return "";
  }

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const params = await searchParams;
  const errorCode = params.error ?? params.state ?? "";
  const message = getAuthErrorMessage(errorCode);
  const description = decodeValue(params.error_description);

  return (
    <div className="auth-shell">
      <Card className="auth-copy-panel">
        <Badge>My Car Pal</Badge>
        <h2 className="section-title" style={{ marginTop: "0.6rem" }}>
          Sign-in needs another try.
        </h2>
        <p className="section-subtitle" style={{ marginTop: "0.65rem" }}>
          Your account data is still safe. You can head back to login or start again from register.
        </p>
      </Card>

      <Card className="auth-form-card">
        <Badge>Authentication</Badge>
        <h2 className="section-title" style={{ marginTop: "0.6rem" }}>
          We couldn&apos;t finish that sign-in
        </h2>

        <FormMessage tone="error" style={{ marginTop: "1rem" }}>
          {message || "We couldn't finish sign-in. Please try again."}
        </FormMessage>

        {description ? (
          <p className="section-subtitle" style={{ marginTop: "0.8rem" }}>
            {description}
          </p>
        ) : null}

        {errorCode ? (
          <p className="section-subtitle" style={{ marginTop: "0.8rem", fontSize: "0.85rem" }}>
            Error code: <code>{errorCode}</code>
          </p>
        ) : null}

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem", flexWrap: "wrap" }}>
          <Link href="/login" className={getButtonClassName()} style={{ textDecoration: "none" }}>
            Back to login
          </Link>
          <Link href="/register" className="auth-inline-link" style={{ alignSelf: "center" }}>
            Try register again
          </Link>
        </div>
      </Card>
    </div>
  );
}
