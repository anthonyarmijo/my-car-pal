"use client";

import type { ReactNode } from "react";
import { useFadeIn } from "@/components/landing/useFadeIn";

type NavIconName = "home" | "garage" | "wrench" | "folder" | "bulb";

const navIconPaths: Record<NavIconName, ReactNode> = {
  home: <path d="M4.6 11 12 4.6 19.4 11v7.6a1.3 1.3 0 0 1-1.3 1.3H5.9a1.3 1.3 0 0 1-1.3-1.3z" />,
  garage: (
    <>
      <path d="M4.4 19.4V9.6L12 5l7.6 4.6v9.8" />
      <path d="M7.5 19.4v-5.6h9v5.6M9.4 16.6h5.2" />
    </>
  ),
  wrench: (
    <path d="M15.7 4.6a3.7 3.7 0 0 0-4.3 4.8l-6.5 6.5 3.2 3.2 6.5-6.5a3.7 3.7 0 0 0 4.8-4.3l-2.5 2.5-2.4-2.4 2.5-2.5Z" />
  ),
  folder: (
    <path d="M3.8 6.4a1.5 1.5 0 0 1 1.5-1.5h4.3l1.9 2.3h6.7a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5H5.3a1.5 1.5 0 0 1-1.5-1.5z" />
  ),
  bulb: (
    <>
      <path d="M8.6 14a5.1 5.1 0 1 1 6.8 0c-.7.7-1.1 1.4-1.2 2.3H9.8c-.1-.9-.5-1.6-1.2-2.3Z" />
      <path d="M10 19.2h4" />
    </>
  ),
};

const navItems: Array<{ icon: NavIconName; label: string; active?: boolean }> = [
  { icon: "home", label: "Home", active: true },
  { icon: "garage", label: "Garage" },
  { icon: "wrench", label: "Maintenance" },
  { icon: "folder", label: "Glovebox" },
  { icon: "bulb", label: "DIY" },
];

const stats = [
  { label: "Services logged", value: "12" },
  { label: "Upcoming", value: "3" },
  { label: "Total spent", value: "$840" },
  { label: "Vehicles", value: "2" },
];

function NavIcon({ name }: { name: NavIconName }) {
  return <svg viewBox="0 0 24 24">{navIconPaths[name]}</svg>;
}

export function DashboardReveal() {
  const ref = useFadeIn();

  return (
    <section ref={ref} className="lp-section lp-reveal lp-fade-up" id="product" aria-labelledby="lp-reveal-title">
      <div className="lp-section-head">
        <p className="lp-kicker">The dashboard</p>
        <h2 id="lp-reveal-title">Maintenance, health, and records at a glance.</h2>
      </div>

      <div className="lp-reveal-frame" aria-label="Dashboard preview">
        <div className="lp-reveal-tabbar" aria-hidden="true">
          <span className="lp-reveal-dots">
            <i />
            <i />
            <i />
          </span>
          <span className="lp-reveal-tab">
            <i className="lp-reveal-favicon" />
            My Car Pal — Home
            <svg viewBox="0 0 24 24"><path d="m7 7 10 10M17 7 7 17" /></svg>
          </span>
          <span className="lp-reveal-newtab">
            <svg viewBox="0 0 24 24"><path d="M12 5.5v13M5.5 12h13" /></svg>
          </span>
        </div>
        <div className="lp-reveal-chrome" aria-hidden="true">
          <span className="lp-reveal-navbtns">
            <svg viewBox="0 0 24 24"><path d="M14.5 5.5 8 12l6.5 6.5" /></svg>
            <svg viewBox="0 0 24 24"><path d="m9.5 5.5 6.5 6.5-6.5 6.5" /></svg>
            <svg viewBox="0 0 24 24"><path d="M5.5 12a6.5 6.5 0 1 1 1.9 4.6M5.5 12V7.8M5.5 12h4.2" /></svg>
          </span>
          <span className="lp-reveal-address">
            <svg viewBox="0 0 24 24"><rect x="6" y="10.4" width="12" height="9" rx="2" /><path d="M8.6 10.4V8a3.4 3.4 0 0 1 6.8 0v2.4" /></svg>
            mycarpal.app/home
            <svg className="lp-reveal-star" viewBox="0 0 24 24"><path d="m12 4.6 2.1 4.4 4.8.6-3.5 3.4.9 4.8L12 15.5l-4.3 2.3.9-4.8-3.5-3.4 4.8-.6z" /></svg>
          </span>
          <span className="lp-reveal-chrome-end">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="5.4" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="18.6" r="1.5" /></svg>
          </span>
        </div>

        <div className="lp-reveal-body">
          <aside className="lp-reveal-side" aria-hidden="true">
            <div className="lp-reveal-side-brand">
              <span className="lp-reveal-side-mark" />
              My Car Pal
            </div>
            <nav className="lp-reveal-nav">
              {navItems.map((item) => (
                <span key={item.label} className={`lp-reveal-nav-item${item.active ? " is-active" : ""}`}>
                  <NavIcon name={item.icon} />
                  {item.label}
                </span>
              ))}
            </nav>
            <div className="lp-reveal-side-user">
              <span className="lp-reveal-avatar">A</span>
              <span>
                <b>Anthony</b>
                <small>Owner</small>
              </span>
            </div>
          </aside>

          <div className="lp-reveal-main">
            <div className="lp-reveal-topbar">
              <span>
                <b>Good morning, Anthony</b>
                <small>Tuesday, July 8 · 68° and clear</small>
              </span>
              <span className="lp-reveal-alert-chip">1 reminder due soon</span>
            </div>

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

            <div className="lp-reveal-panel lp-reveal-upcoming">
              <h3>Upcoming</h3>
              <ul>
                <li>
                  <svg viewBox="0 0 24 24"><path d="M15.7 4.6a3.7 3.7 0 0 0-4.3 4.8l-6.5 6.5 3.2 3.2 6.5-6.5a3.7 3.7 0 0 0 4.8-4.3l-2.5 2.5-2.4-2.4 2.5-2.5Z" /></svg>
                  <span>
                    <b>Oil &amp; filter change</b>
                    <small>2021 Toyota Tacoma</small>
                  </span>
                  <em className="is-due">Due in 480 mi</em>
                </li>
                <li>
                  <svg viewBox="0 0 24 24"><path d="M7 4.5h6.2l3.8 3.8v11.2H7z" /><path d="M13 4.8V9h4M9.6 12h4.8M9.6 15.4h4.8" /></svg>
                  <span>
                    <b>Registration renewal</b>
                    <small>2021 Toyota Tacoma</small>
                  </span>
                  <em>Aug 12</em>
                </li>
              </ul>
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
              <div className="lp-reveal-side-panels">
                <div className="lp-reveal-panel">
                  <h3>Vehicle health</h3>
                  <p>
                    <span className="lp-dot lp-dot-ok" aria-hidden="true" /> All caught up. Registration,
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
      </div>
    </section>
  );
}
