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
        <p className="lp-kicker">The dashboard</p>
        <h2 id="lp-reveal-title">Maintenance, health, and records at a glance.</h2>
      </div>

      <div className="lp-reveal-frame" aria-label="Dashboard preview">
        <div className="lp-reveal-chrome" aria-hidden="true">
          <span className="lp-reveal-dots">
            <i />
            <i />
            <i />
          </span>
          <span className="lp-reveal-navbtns">
            <svg viewBox="0 0 24 24"><path d="M14.5 5.5 8 12l6.5 6.5" /></svg>
            <svg viewBox="0 0 24 24"><path d="m9.5 5.5 6.5 6.5-6.5 6.5" /></svg>
            <svg viewBox="0 0 24 24"><path d="M5.5 12a6.5 6.5 0 1 1 1.9 4.6M5.5 12V7.8M5.5 12h4.2" /></svg>
          </span>
          <span className="lp-reveal-address">
            <svg viewBox="0 0 24 24"><rect x="6" y="10.4" width="12" height="9" rx="2" /><path d="M8.6 10.4V8a3.4 3.4 0 0 1 6.8 0v2.4" /></svg>
            mycarpal.app/home
          </span>
          <span className="lp-reveal-chrome-end">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="5.4" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="18.6" r="1.5" /></svg>
          </span>
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
