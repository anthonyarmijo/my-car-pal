"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useFadeIn } from "@/components/landing/useFadeIn";

const commitments = [
  { title: "No ads", desc: "Your garage is not a billboard." },
  { title: "No data selling", desc: "Your records are yours, full stop." },
  { title: "Self-hostable", desc: "Run the open core on your own hardware." },
  { title: "Export anytime", desc: "Take your history with you, always." },
];

const privacyPixels = Array.from({ length: 72 }, (_, index) => ({
  delay: ((index * 29) % 72) * 9,
  drift: ((index * 11) % 9) - 4,
  tone: index % 4,
}));

export function PrivacySection() {
  const ref = useFadeIn();

  return (
    <section ref={ref} className="lp-section lp-privacy lp-fade-up" id="privacy" aria-labelledby="lp-privacy-title">
      <div className="lp-privacy-stack">
        <div className="lp-privacy-inner">
          <div className="lp-privacy-content">
            <div className="lp-privacy-intro">
              <div className="lp-section-head lp-privacy-head">
                <p className="lp-kicker">Ownership, the way it should feel</p>
                <h2 id="lp-privacy-title">Private by default. Yours by design.</h2>
                <p className="lp-section-sub">
                  Keep a clear home for your vehicle data without turning it into someone else&rsquo;s business model.
                  Choose managed convenience or run the open core yourself.
                </p>
                <Link href="/privacy" className="lp-text-link">Read the privacy policy <span aria-hidden="true">→</span></Link>
              </div>
              <ul className="lp-privacy-grid">
                {commitments.map((item) => (
                  <li key={item.title} className="lp-privacy-card">
                    <strong>{item.title}</strong>
                    <span>{item.desc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="lp-privacy-pixel-veil" aria-hidden="true">
            {privacyPixels.map((pixel, index) => (
              <i
                key={index}
                className={`is-tone-${pixel.tone}`}
                style={{ "--pixel-delay": `${pixel.delay}ms`, "--pixel-drift": `${pixel.drift}px` } as CSSProperties}
              />
            ))}
          </div>
        </div>

        <div className="lp-choice-block" aria-labelledby="lp-choice-title">
          <div className="lp-choice-heading">
            <p className="lp-kicker">One product, two ways to own it</p>
            <h3 id="lp-choice-title">Choose what fits your garage.</h3>
          </div>
          <div className="lp-choice-grid">
            <article className="lp-choice-card is-cloud">
              <span className="lp-choice-label">Simplest way to start</span>
              <h4>My Car Pal Cloud</h4>
              <p>Hosted and maintained for you, with sync and backups handled by the service.</p>
              <ul>
                <li>Free for one vehicle</li>
                <li>No credit card</li>
                <li>Ready when you are</li>
              </ul>
              <Link href="/register" className="lp-btn lp-btn-primary">Start free</Link>
            </article>
            <article className="lp-choice-card">
              <span className="lp-choice-label">Maximum deployment control</span>
              <h4>Self-host My Car Pal</h4>
              <p>Run the free open core on your own hardware with full deployment and data control.</p>
              <ul>
                <li>Free open core</li>
                <li>Your hardware, your deployment</li>
                <li>Source available to inspect</li>
              </ul>
              <a
                href="https://github.com/anthonyarmijo/my-car-pal/"
                className="lp-btn lp-btn-ghost"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on GitHub <span aria-hidden="true">↗</span>
              </a>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
