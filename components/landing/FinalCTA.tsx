"use client";

import Link from "next/link";
import { useFadeIn } from "@/components/landing/useFadeIn";

export function FinalCTA() {
  const ref = useFadeIn();

  return (
    <div ref={ref} className="landing-final-cta-wrap landing-fade-up" id="final-cta">
      <div className="landing-final-cta-strip">
        <div className="landing-final-cta-copy">
          <span className="landing-final-cta-kicker">Ready for the next service?</span>
          <h2>Give your car a memory.</h2>
          <p>Start free with one vehicle, reminders, receipts, and glovebox records.</p>
        </div>
        <div className="landing-final-cta-action">
          <Link href="/register" className="landing-btn landing-btn-cta">
            Start free →
          </Link>
          <span>No credit card · Export anytime</span>
        </div>
      </div>
    </div>
  );
}
