"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { signupAction } from "@/app/login/actions";
import { initialSignupFormState, type SignupFormState } from "@/app/register/state";
import { SocialLoginButtons } from "@/components/social-login-buttons";
import { Button, Field, FormMessage, Input } from "@my-car-pal/ui";

type Step = "email" | "password" | "success";
type RegisterOnboardingProps = {
  initialError?: string;
  initialStep?: Step;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const stepOrder: Step[] = ["email", "password", "success"];
const registerWelcomePath = "/register?welcome=1";
const garageWelcomePath = "/garage?welcome=1#add-vehicle";
const setupSteps = ["Create account", "Add vehicle", "Preferences", "All set"];

function CreateAccountButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="onboarding-submit-button" type="submit" disabled={pending} fullWidth>
      {pending ? "Creating account..." : "Create account"}
    </Button>
  );
}

export function RegisterOnboarding({ initialError = "", initialStep = "email" }: RegisterOnboardingProps) {
  const [step, setStep] = useState<Step>(initialStep);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [socialError, setSocialError] = useState(initialError);
  const [state, formAction] = useActionState<SignupFormState, FormData>(signupAction, initialSignupFormState);

  useEffect(() => {
    setStep(initialStep);
  }, [initialStep]);

  useEffect(() => {
    setSocialError(initialError);
  }, [initialError]);

  useEffect(() => {
    if (state.status === "error" && state.fieldErrors.email) {
      setStep("email");
    }
  }, [state.fieldErrors.email, state.status]);

  const stepIndex = stepOrder.indexOf(step);
  const setupActiveIndex = step === "email" || step === "password" ? 0 : 1;
  const stateMessage = state.message.trim();
  const visibleEmailError = emailError || state.fieldErrors.email || socialError || "";
  const visiblePasswordError = state.fieldErrors.password || "";

  const stepMeta = useMemo(() => {
    if (step === "success") {
      return {
        title: "Welcome to My Car Pal.",
        body: "Let's add your first vehicle so your garage is ready.",
        stepLabel: "Next up",
      };
    }

    if (step === "password") {
      return {
        title: "Create your account",
        body: "Start free. No credit card required.",
        stepLabel: "Create account",
      };
    }

    return {
      title: "Create your account",
      body: "Start free. No credit card required.",
      stepLabel: "Create account",
    };
  }, [step]);

  const handleContinue = () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setEmailError("Enter your email address.");
      return;
    }

    if (!emailPattern.test(normalizedEmail)) {
      setEmailError("Enter a valid email address.");
      return;
    }

    setEmail(normalizedEmail);
    setEmailError("");
    setSocialError("");
    setStep("password");
  };

  return (
    <div className="auth-shell-onboarding">
      <section className="section-card onboarding-shell">
        <h1 className="sr-only">{stepMeta.title}</h1>
        <div className="onboarding-shell-head">
          <div className="onboarding-stepper" aria-label="Signup progress">
            {setupSteps.map((label, index) => (
              <span
                key={label}
                className={`onboarding-stepper-item${index < setupActiveIndex ? " is-complete" : ""}${
                  index === setupActiveIndex ? " is-active" : ""
                }`}
              >
                <span>{index < setupActiveIndex ? "✓" : index + 1}</span>
                <small>{label}</small>
              </span>
            ))}
          </div>
        </div>

        <div className="onboarding-stage">
          <div className="onboarding-stage-track" style={{ transform: `translateX(-${stepIndex * 100}%)` }}>
            <section className="onboarding-slide" aria-hidden={step !== "email"}>
              <div className="onboarding-slide-inner onboarding-slide-inner-email">
                <div className="onboarding-slide-copy">
                  <h2 className="onboarding-slide-title">{stepMeta.title}</h2>
                  <p className="onboarding-slide-note">{stepMeta.body}</p>
                </div>

                <div className="onboarding-auth-card">
                  <div className="onboarding-social-wrap">
                    <SocialLoginButtons callbackURL="/home" errorCallbackURL="/register" newUserCallbackURL={registerWelcomePath} />
                  </div>

                  <Field label="Email" htmlFor="register-email">
                    <Input
                      id="register-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        if (socialError) {
                          setSocialError("");
                        }
                        if (emailError) {
                          setEmailError("");
                        }
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          handleContinue();
                        }
                      }}
                    />
                  </Field>

                  <Button type="button" className="onboarding-submit-button" onClick={handleContinue} fullWidth>
                    Continue
                  </Button>

                  {visibleEmailError ? <FormMessage tone="error">{visibleEmailError}</FormMessage> : null}
                  {state.status === "error" && !visibleEmailError && stateMessage ? (
                    <FormMessage tone="error">{stateMessage}</FormMessage>
                  ) : null}
                </div>

                <p className="onboarding-footnote">
                  Already have an account?{" "}
                  <Link href="/login" className="auth-inline-link">
                    Log In
                  </Link>
                </p>
              </div>
            </section>

            <section className="onboarding-slide" aria-hidden={step !== "password"}>
              <div className="onboarding-slide-inner">
                <div className="onboarding-slide-copy">
                  <h2 className="onboarding-slide-title">{stepMeta.title}</h2>
                  <p className="onboarding-slide-note">{stepMeta.body}</p>
                </div>

                <form action={formAction} className="form-stack onboarding-auth-card onboarding-pane-password">
                  <input type="hidden" name="email" value={email} />

                  <div className="onboarding-email-summary">
                    <span className="onboarding-email-summary-label">Email</span>
                    <span className="onboarding-email-summary-value">{email}</span>
                  </div>

                  <Field label="Password" htmlFor="register-password" required>
                    <Input
                      id="register-password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                  </Field>

                  <ul className="onboarding-password-checks" aria-label="Password requirements">
                    <li>At least 8 characters</li>
                    <li>One number or symbol</li>
                    <li>Mix of upper and lower case</li>
                  </ul>

                  <div className="onboarding-action-row">
                    <Button
                      type="button"
                      variant="secondary"
                      className="onboarding-back-button"
                      onClick={() => setStep("email")}
                    >
                      Back
                    </Button>
                    <CreateAccountButton />
                  </div>

                  {visiblePasswordError ? <FormMessage tone="error">{visiblePasswordError}</FormMessage> : null}
                  {state.status === "error" && !visiblePasswordError && stateMessage ? (
                    <FormMessage tone="error">{stateMessage}</FormMessage>
                  ) : null}
                </form>
              </div>
            </section>

            <section className="onboarding-slide" aria-hidden={step !== "success"}>
              <div className="onboarding-slide-inner onboarding-slide-inner-success" aria-live="polite">
                <div className="onboarding-success-mark" aria-hidden="true">
                  <span />
                </div>
                <h2 className="onboarding-success-title">{stepMeta.title}</h2>
                <p className="onboarding-success-copy">{stateMessage || stepMeta.body}</p>
                <Link href={garageWelcomePath} className="button-primary onboarding-success-button">
                  Take me to my garage
                </Link>
                <div className="onboarding-vehicle-preview" aria-hidden="true">
                  <span>Make <strong>Toyota</strong></span>
                  <span>Model <strong>Camry</strong></span>
                  <span>Year <strong>2020</strong></span>
                  <span>Nickname <strong>Daily Driver</strong></span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
