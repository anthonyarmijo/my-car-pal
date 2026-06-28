"use client";

import { useFadeIn } from "@/components/landing/useFadeIn";

const features = [
  {
    icon: "📅",
    title: "Maintenance timeline",
    desc: "Log every service with mileage, cost, and receipts.",
  },
  {
    icon: "📁",
    title: "Digital glovebox",
    desc: "Registration, insurance, and docs in one place.",
  },
  {
    icon: "⏰",
    title: "Smart reminders",
    desc: "Mileage or date-based alerts — set them once and stay ahead.",
  },
  {
    icon: "🔍",
    title: "VIN decode",
    desc: "Drop in a VIN and get specs, recalls, and trim details instantly.",
  },
  {
    icon: "🏍️",
    title: "Track your toys",
    desc: "Supports motorcycles, scooters, and other custom vehicle types.",
  },
  {
    icon: "📊",
    title: "Cost tracking",
    desc: "See spending by service, vehicle, and month.",
  },
];

export function FeatureGrid() {
  const ref = useFadeIn();

  return (
    <section ref={ref} className="landing-feature-section landing-fade-up" id="features">
      <div className="landing-feature-container">
        <div className="landing-feature-header">
          <div className="landing-feature-kicker">Features</div>
          <h2>Built for real ownership.</h2>
          <p>Tools designed around your records and your privacy.</p>
        </div>
        <div className="landing-feature-grid">
          {features.map((f) => (
            <div key={f.title} className="landing-feature-card">
              <div className="landing-feature-card-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
