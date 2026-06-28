import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-session";
import { RegisterOnboarding } from "@/components/register-onboarding";
import { getAuthErrorMessage } from "@/lib/auth-error-copy";

type RegisterPageProps = {
  searchParams: Promise<{ error?: string; welcome?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const showSuccessState = Boolean(user) && params.welcome === "1";
  const initialError = getAuthErrorMessage(params.error);

  if (user && !showSuccessState) {
    redirect("/home");
  }

  return <RegisterOnboarding initialError={initialError} initialStep={showSuccessState ? "success" : "email"} />;
}
