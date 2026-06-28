import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth-session";
import { loginAction } from "@/app/login/actions";
import { SocialLoginButtons } from "@/components/social-login-buttons";
import { getAuthErrorMessage } from "@/lib/auth-error-copy";
import { Badge, Button, Card, Field, FormMessage, Input } from "@my-car-pal/ui";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();
  if (user) {
    redirect("/home");
  }

  const params = await searchParams;
  const error = getAuthErrorMessage(params.error);

  return (
    <div className="auth-shell">
      <Card as="section" className="auth-copy-panel">
        <Badge>My Car Pal</Badge>
        <h2 className="section-title" style={{ marginTop: "0.6rem" }}>
          Vehicle care, in your control.
        </h2>
        <p className="section-subtitle" style={{ marginTop: "0.65rem" }}>
          Track maintenance, organize documents, and keep upcoming tasks in one calm workspace.
        </p>
      </Card>

      <Card as="section" className="auth-form-card">
        <Badge>Welcome Back</Badge>
        <h2 className="section-title" style={{ marginTop: "0.6rem" }}>
          Login
        </h2>
        <p className="section-subtitle" style={{ marginTop: "0.55rem" }}>
          New to My Car Pal?{" "}
          <Link href="/register" className="auth-inline-link">
            Sign up today
          </Link>
        </p>

        <SocialLoginButtons callbackURL="/home" errorCallbackURL="/login" />

        <form action={loginAction} className="form-stack">
          <Field label="Email" htmlFor="login-email" required>
            <Input id="login-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
          </Field>
          <Field label="Password" htmlFor="login-password" required>
            <Input id="login-password" name="password" type="password" autoComplete="current-password" required />
          </Field>
          <Button type="submit">Login</Button>
        </form>

        {error ? (
          <FormMessage tone="error" style={{ marginTop: "1rem" }}>
            {error}
          </FormMessage>
        ) : null}
      </Card>
    </div>
  );
}
