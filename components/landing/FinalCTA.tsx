"use client";

import Link from "next/link";
import { useFadeIn } from "@/components/landing/useFadeIn";

export function FinalCTA() {
  const ref = useFadeIn();

  return (
    <section ref={ref} className="lp-section lp-final lp-fade-up" id="final-cta" aria-labelledby="lp-final-title">
      <div className="lp-final-strip">
        <div className="lp-final-copy">
          <h2 id="lp-final-title">Take care of your car. We&rsquo;ll handle the rest.</h2>
          <p>Start free with one vehicle — reminders, records, and glovebox included.</p>
        </div>
        <div className="lp-final-action">
          <div className="lp-final-buttons">
            <Link href="/register" className="lp-btn lp-btn-primary lp-btn-lg">Start free</Link>
            <a
              href="https://github.com/anthonyarmijo/my-car-pal/"
              className="lp-btn lp-btn-final-secondary lp-btn-lg"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub <span aria-hidden="true">↗</span>
            </a>
          </div>
          <span>No credit card · Export anytime</span>
        </div>
      </div>
    </section>
  );
}
