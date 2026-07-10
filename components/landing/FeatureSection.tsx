"use client";

import type { ReactNode } from "react";
import { useFadeIn } from "@/components/landing/useFadeIn";

type FeatureIconName = "clock" | "receipt" | "folder" | "search" | "moto" | "chart";

const iconPaths: Record<FeatureIconName, ReactNode> = {
  clock: (
    <>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M12 7.6v4.6l3.2 2" />
    </>
  ),
  receipt: (
    <>
      <path d="M6.4 3.8h11.2v16.4l-1.9-1.3-1.9 1.3-1.8-1.3-1.8 1.3-1.9-1.3-1.9 1.3z" />
      <path d="M9.2 8.4h5.6M9.2 11.8h5.6M9.2 15.2h3.4" />
    </>
  ),
  folder: (
    <>
      <path d="M3.8 6.2a1.6 1.6 0 0 1 1.6-1.6h4.4l2 2.4h6.8a1.6 1.6 0 0 1 1.6 1.6v9.6a1.6 1.6 0 0 1-1.6 1.6H5.4a1.6 1.6 0 0 1-1.6-1.6z" />
      <path d="M3.8 10h16.4" />
    </>
  ),
  search: (
    <>
      <circle cx="10.8" cy="10.8" r="6.2" />
      <path d="m15.4 15.4 4.8 4.8" />
    </>
  ),
  moto: (
    <>
      <circle cx="5.8" cy="16.4" r="3.2" />
      <circle cx="18.2" cy="16.4" r="3.2" />
      <path d="M5.8 16.4 9 10.6h4.2l2.6 5.8M9 10.6 7.6 7.8h-2.4M13.2 10.6l-1-2.8h3l2.2 3.4" />
    </>
  ),
  chart: (
    <>
      <path d="M4.4 4.4v15.2h15.2" />
      <path d="M8.4 15.6v-4.4M12.4 15.6V8.4M16.4 15.6v-2.8" />
    </>
  ),
};

const features: Array<{ icon: FeatureIconName; title: string; desc: string }> = [
  {
    icon: "clock",
    title: "Smart reminders",
    desc: "Mileage or date based — set them once and stay ahead of every service.",
  },
  {
    icon: "receipt",
    title: "Clean records",
    desc: "Every service logged with mileage, cost, and the receipt attached.",
  },
  {
    icon: "folder",
    title: "Digital glovebox",
    desc: "Registration, insurance, and documents where you can actually find them.",
  },
  {
    icon: "search",
    title: "VIN decode",
    desc: "Drop in a VIN and get specs and trim details filled in for you.",
  },
  {
    icon: "moto",
    title: "Every vehicle you own",
    desc: "Cars, trucks, SUVs, and motorcycles — all in one garage.",
  },
  {
    icon: "chart",
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
              <svg viewBox="0 0 24 24">{iconPaths[f.icon]}</svg>
            </span>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
      <p className="lp-owners-line">Built for owners, not dealerships.</p>
    </section>
  );
}
