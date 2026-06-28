import Link from "next/link";
import type { Route } from "next";
import { findActivationStep } from "@/lib/activation";
import type { ActivationState, ActivationStepId } from "@/lib/activation-types";

type ActivationChecklistCardProps = {
  state: ActivationState;
  welcome?: boolean;
};

type ActivationStepPromptProps = {
  state: ActivationState;
  stepIds: ActivationStepId[];
  badge?: string;
  title: string;
  body: string;
};

function ProgressBar({ completed, total }: { completed: number; total: number }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="activation-progress-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${completed} of ${total} steps complete`}>
      <div className="activation-progress-bar-track">
        <div className="activation-progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="activation-progress-bar-label">{completed} of {total}</span>
    </div>
  );
}

const STEP_ICONS: Record<ActivationStepId, string> = {
  vehicle: "🚙",
  mileage: "📏",
  reminder: "🔔",
  service: "🔧",
  documents: "📄",
};

export function ActivationChecklistCard({ state, welcome = false }: ActivationChecklistCardProps) {
  if (state.isComplete) {
    return (
      <section className="section-card activation-card activation-card-done" aria-label="Account setup complete">
        <div className="activation-done-mark" aria-hidden="true">
          <svg viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="176" strokeDashoffset="0">
              <animate attributeName="stroke-dashoffset" from="176" to="0" dur="0.6s" fill="freeze" />
            </circle>
            <polyline points="20,32 28,40 44,24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <animate attributeName="stroke-dashoffset" from="40" to="0" dur="0.4s" begin="0.3s" fill="freeze" />
            </polyline>
          </svg>
        </div>
        <h2 className="section-title">You&apos;re all set!</h2>
        <p className="section-subtitle">Your account is ready. Explore your garage, log services, and stay on top of maintenance.</p>
      </section>
    );
  }

  if (!state.nextStep) {
    return null;
  }

  return (
    <section className="section-card activation-card">
      <div className="activation-card-header">
        <div className="activation-card-title-row">
          <span className="activation-card-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="3.2" />
              <path d="M5.8 19.3c.8-3.7 3.2-5.6 6.2-5.6s5.4 1.9 6.2 5.6" />
            </svg>
          </span>
          <h2 className="section-title">Complete your account setup</h2>
        </div>
      </div>

      <ProgressBar completed={state.completedCount} total={state.totalCount} />

      <ol className="list-reset activation-step-list">
        {state.steps.map((step) => (
          <li key={step.id} className={`activation-step-item${step.complete ? " activation-step-item-complete" : ""}`}>
            <div className="activation-step-status" aria-hidden="true">
              {step.complete ? (
                <svg viewBox="0 0 16 16" className="activation-step-check">
                  <circle cx="8" cy="8" r="7" fill="var(--accent)" />
                  <polyline points="5,8 7,10 11,6" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <span className="activation-step-icon">{STEP_ICONS[step.id]}</span>
              )}
            </div>
            <div className="activation-step-copy">
              <strong>{step.title}</strong>
              <small>{step.description}</small>
            </div>
          </li>
        ))}
      </ol>

      <Link href={state.nextStep.action.href as Route} className="button-primary activation-resume-button">
        {welcome ? "Start setup" : state.nextStep.action.label}
      </Link>

      {!welcome && state.completedCount > 0 && (
        <p className="activation-skip-hint">
          <Link href="/home" className="auth-inline-link">Skip for now</Link>
        </p>
      )}
    </section>
  );
}

export function ActivationStepPrompt({
  state,
  stepIds,
  badge = "Setup",
  title,
  body,
}: ActivationStepPromptProps) {
  if (state.isComplete) {
    return null;
  }

  const step = findActivationStep(state, stepIds);
  if (!step) {
    return null;
  }

  return (
    <section className="section-card activation-inline-card">
      <div>
        <p className="badge">{badge}</p>
        <h2 className="section-title">{title}</h2>
        <p className="section-subtitle">{body}</p>
        <div className="activation-inline-progress-bar" aria-hidden="true">
          <div className="activation-inline-progress-fill" style={{ width: `${Math.round((state.completedCount / state.totalCount) * 100)}%` }} />
        </div>
        <p className="activation-inline-progress">{state.progressLabel}</p>
      </div>
      <div className="activation-inline-actions">
        <div className="activation-inline-step">
          <strong>{step.title}</strong>
          <p>{step.description}</p>
        </div>
        <div className="inline-links">
          <Link href={step.action.href as Route} className="button-primary">
            {step.action.label}
          </Link>
          <Link href="/home" className="button-chip button-chip-strong">
            View full setup
          </Link>
        </div>
      </div>
    </section>
  );
}
