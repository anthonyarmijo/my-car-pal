"use client";

import { useFadeIn } from "@/components/landing/useFadeIn";

const features = [
  {
    icon: "⏰",
    title: "Smart reminders",
    desc: "Mileage or date based — set them once and stay ahead of every service.",
  },
  {
    icon: "🧾",
    title: "Clean records",
    desc: "Every service logged with mileage, cost, and the receipt attached.",
  },
  {
    icon: "📁",
    title: "Digital glovebox",
    desc: "Registration, insurance, and documents where you can actually find them.",
  },
  {
    icon: "🔍",
    title: "VIN decode",
    desc: "Drop in a VIN and get specs and trim details filled in for you.",
  },
  {
    icon: "🏍️",
    title: "Every vehicle you own",
    desc: "Cars, trucks, SUVs, and motorcycles — all in one garage.",
  },
  {
    icon: "📊",
    title: "Cost summary",
    desc: "See what each vehicle really costs, by service and by month.",
  },
];

export function FeatureSection() {
  const ref = useFadeIn();

  return (
    <section ref={ref} className="lp-section lp-features lp-fade-up" id="features" aria-labelledby="lp-features-title">
      <div className="lp-section-head">
        <p className="lp-kicker">Features</p>
        <h2 id="lp-features-title">Practical tools for real ownership.</h2>
      </div>
      <div className="lp-feature-grid">
        {features.map((f) => (
          <div key={f.title} className="lp-feature-card">
            <span className="lp-feature-icon" aria-hidden="true">
              {f.icon}
            </span>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
