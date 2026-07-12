"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useFadeIn } from "@/components/landing/useFadeIn";

const proofPoints = ["Free for one vehicle", "No ads, no data selling", "Export anytime"];

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

      <div className="lp-reveal-frame" aria-label="Illustrated dashboard preview">
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
                <b>Jordan</b>
                <small>Personal garage</small>
              </span>
            </div>
          </aside>

          <div className="lp-reveal-main">
            <div className="lp-reveal-productbar" aria-hidden="true">
              <span className="lp-reveal-search">
                <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.6" /><path d="m16 16 4 4" /></svg>
                Search cars &amp; records
                <kbd>⌘ K</kbd>
              </span>
              <span className="lp-reveal-saved"><i /> All changes saved</span>
              <svg className="lp-reveal-bell" viewBox="0 0 24 24"><path d="M18 9a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7" /><path d="M10.3 20a2 2 0 0 0 3.4 0" /></svg>
            </div>
            <div className="lp-reveal-topbar">
              <span>
                <small className="lp-reveal-eyebrow">Tuesday, July 8 · 68° and clear</small>
                <b>Good morning, Jordan</b>
                <small>Everything&apos;s in good shape — one reminder is coming up.</small>
              </span>
              <span className="lp-reveal-alert-chip">1 reminder due soon</span>
            </div>

            <div className="lp-reveal-vehicle">
              <div className="lp-reveal-vehicle-copy">
                <span className="lp-pill">Primary vehicle</span>
                <strong>2023 Subaru Outback Wilderness</strong>
                <small>Wilderness · 2.4L turbo · 32,215 mi · Updated today</small>
                <div className="lp-reveal-next">
                  <em>Next up</em>
                  <b>Oil &amp; filter change</b>
                  <span className="lp-reveal-progress"><i /><small>480 mi left</small></span>
                  <small>4,520 of 5,000 mi since last change · Feb 14</small>
                </div>
              </div>
              <div className="lp-vehicle-stage lp-reveal-stage" aria-hidden="true">
                <span className="lp-vehicle-shadow" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/landing/vehicle-cutout-subaru-outback-wilderness.webp" alt="" className="lp-vehicle-cutout" />
              </div>
            </div>

            <div className="lp-reveal-panel lp-reveal-upcoming">
              <div className="lp-reveal-panel-heading"><h3>Upcoming</h3><span>View all →</span></div>
              <ul>
                <li>
                  <svg viewBox="0 0 24 24"><path d="M15.7 4.6a3.7 3.7 0 0 0-4.3 4.8l-6.5 6.5 3.2 3.2 6.5-6.5a3.7 3.7 0 0 0 4.8-4.3l-2.5 2.5-2.4-2.4 2.5-2.5Z" /></svg>
                  <span>
                    <b>Oil &amp; filter change</b>
                    <small>Outback · 0W-20 synthetic, last done Feb 14</small>
                  </span>
                  <em className="is-due">Due in 480 mi</em>
                </li>
                <li>
                  <svg viewBox="0 0 24 24"><path d="M7 4.5h6.2l3.8 3.8v11.2H7z" /><path d="M13 4.8V9h4M9.6 12h4.8M9.6 15.4h4.8" /></svg>
                  <span>
                    <b>Registration renewal</b>
                    <small>Outback · renew online with the DMV</small>
                  </span>
                  <em>Aug 12 · 35 days</em>
                </li>
                <li>
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="3" /><path d="M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3" /></svg>
                  <span>
                    <b>Tire rotation</b>
                    <small>Outback · last done 2 days ago</small>
                  </span>
                  <em>In 4,780 mi</em>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      <ul className="lp-product-scope" aria-label="My Car Pal capabilities">
        <li>Reminders &amp; alerts</li>
        <li>Service history &amp; receipts</li>
        <li>Digital glovebox</li>
        <li>VIN-assisted setup</li>
        <li>Cost visibility</li>
        <li>Cars to motorcycles</li>
      </ul>

      <div className="lp-reveal-cta">
        <div className="lp-hero-cta-row">
          <Link href="/register" className="lp-btn lp-btn-primary">
            Start free
          </Link>
          <a href="#features" className="lp-btn lp-btn-ghost">
            See how it works
          </a>
        </div>
        <ul className="lp-hero-proof" aria-label="Highlights">
          {proofPoints.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
