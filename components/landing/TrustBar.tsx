"use client";

import { useFadeIn } from "@/components/landing/useFadeIn";

const trustItems = [
  { icon: "🚫", title: "No ads", desc: "No sponsored placements" },
  { icon: "🔒", title: "No data selling", desc: "Your records aren't a product" },
  { icon: "🛠️", title: "DIY learning center", desc: "Guides, tools, and safety tips" },
  { icon: "🏠", title: "Self-hostable", desc: "Run it on your own hardware" },
  { icon: "📤", title: "Export anytime", desc: "Your data, portable" },
];

export function TrustBar() {
  const ref = useFadeIn();

  return (
    <div ref={ref} className="landing-trust-bar landing-fade-up" id="privacy">
      <div className="landing-trust-container">
        <div className="landing-trust-items">
          {trustItems.map((t) => (
            <div key={t.title} className="landing-trust-item">
              <span className="landing-trust-icon">{t.icon}</span>
              <strong>{t.title}</strong>
              <span className="landing-trust-desc">{t.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
