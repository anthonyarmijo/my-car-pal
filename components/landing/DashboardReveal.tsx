"use client";

import { useFadeIn } from "@/components/landing/useFadeIn";

const stats = [
  { label: "Services logged", value: "12" },
  { label: "Upcoming", value: "3" },
  { label: "Total spent", value: "$840" },
  { label: "Vehicles", value: "2" },
];

export function DashboardReveal() {
  const ref = useFadeIn();

  return (
    <section ref={ref} className="lp-section lp-reveal lp-fade-up" id="product" aria-labelledby="lp-reveal-title">
      <div className="lp-section-head">
        <p className="lp-kicker">Your digital garage</p>
        <h2 id="lp-reveal-title">Everything about your car, in one calm place.</h2>
        <p className="lp-section-sub">
          Step out of the garage and into a dashboard that keeps maintenance, reminders, and records
          quietly organized.
        </p>
      </div>

      <div className="lp-reveal-frame" aria-label="Dashboard preview">
        <div className="lp-reveal-chrome" aria-hidden="true">
          <span className="lp-reveal-dots">
            <i />
            <i />
            <i />
          </span>
          <span className="lp-reveal-address">mycarpal.app/home</span>
        </div>

        <div className="lp-reveal-body">
          <div className="lp-reveal-vehicle">
            <div className="lp-reveal-vehicle-copy">
              <span className="lp-pill">Primary vehicle</span>
              <strong>2021 Toyota Tacoma</strong>
              <small>TRD Off-Road · 32,215 mi · Updated today</small>
              <div className="lp-reveal-next">
                <em>Next up</em>
                <b>Oil &amp; filter change</b>
                <small>Due in 480 mi</small>
              </div>
            </div>
            <div className="lp-vehicle-stage lp-reveal-stage" aria-hidden="true">
              <span className="lp-vehicle-shadow" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/landing/vehicle-cutout-tacoma.png" alt="" className="lp-vehicle-cutout" />
            </div>
          </div>

          <div className="lp-reveal-grid">
            <div className="lp-reveal-stats">
              {stats.map((item) => (
                <div key={item.label} className="lp-reveal-stat">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            <div className="lp-reveal-side">
              <div className="lp-reveal-panel">
                <h3>Vehicle health</h3>
                <p>
                  <span className="lp-dot lp-dot-ok" aria-hidden="true" /> All caught up — registration,
                  insurance, and service are current.
                </p>
              </div>
              <div className="lp-reveal-panel">
                <h3>Recent activity</h3>
                <p>Tire rotation logged · receipt attached · 2 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
