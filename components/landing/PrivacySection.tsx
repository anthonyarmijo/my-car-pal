"use client";

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
      <div className="lp-privacy-inner">
        <div className="lp-privacy-content">
          <div className="lp-section-head lp-privacy-head">
            <p className="lp-kicker">Ownership, the way it should feel</p>
            <h2 id="lp-privacy-title">Private by default. Yours by design.</h2>
            <p className="lp-section-sub">
              My Car Pal exists so you can take pride in maintaining your vehicles, not so anyone can
              mine your data. Self-host the core for free, or let our managed cloud handle sync and
              backups when you want the convenience.
            </p>
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
        <div className="lp-privacy-pixel-veil" aria-hidden="true">
          {privacyPixels.map((pixel, index) => (
            <i
              key={index}
              className={`is-tone-${pixel.tone}`}
              style={{
                "--pixel-delay": `${pixel.delay}ms`,
                "--pixel-drift": `${pixel.drift}px`,
              } as CSSProperties}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
