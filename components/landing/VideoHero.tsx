"use client";

import { CarLogoMark } from "@/components/app-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

const appTabs = ["Home", "Garage", "Maintenance", "DIY", "Glovebox"];

const statItems = [
  { label: "Services completed", value: "12", note: "View history" },
  { label: "Upcoming services", value: "3", note: "View schedule" },
  { label: "Total spent", value: "$840", note: "View expenses" },
  { label: "Vehicles tracked", value: "1", note: "View garage" },
];

export function VideoHero() {
  return (
    <section className="landing-video-hero">
      <video
        className="landing-video-bg"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      >
        <source src="/videos/hero-bg.mp4" type="video/mp4" />
      </video>

      <div className="landing-video-overlay" />

      <nav className="landing-video-nav">
        <Link href="/" className="landing-video-nav-logo" aria-label="My Car Pal home">
          <CarLogoMark className="landing-video-nav-mark" />
          <span>My Car Pal</span>
        </Link>
        <div className="landing-video-nav-links">
          <a href="#features">Features</a>
          <a href="#privacy">Privacy</a>
          <ThemeToggle />
          <Link href="/login" className="landing-video-login-link">
            Log In
          </Link>
          <Link href="/register" className="landing-btn landing-btn-primary">
            Start free
          </Link>
        </div>
      </nav>

      <div className="landing-video-container">
        <div className="landing-video-content">
          <div className="landing-video-copy">
            <h1>Own your car&apos;s history.</h1>
            <p>
              Track service, receipts, and reminders with real privacy. No ads.
              No data selling. Just your garage, organized.
            </p>
            <div className="landing-video-cta-row">
              <Link href="/register" className="landing-btn landing-btn-primary landing-btn-lg">
                Get started free →
              </Link>
              <a href="#features" className="landing-btn landing-btn-ghost">
                See features
              </a>
            </div>
            <div className="landing-video-trust-line">
              🔒 No credit card · Free for one vehicle · Export anytime
            </div>
          </div>

          <div className="landing-video-card" aria-label="Dashboard preview">
            <div className="landing-video-card-top">
              <div className="landing-video-card-window-controls" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <div className="landing-video-card-address">mycarpal.app/home</div>
              <span className="landing-video-card-browser-action" aria-hidden="true" />
            </div>

            <div className="landing-video-card-appbar">
              <div className="landing-video-card-brand">
                <CarLogoMark className="landing-video-card-brand-mark" />
                <span>My Car Pal</span>
              </div>
              <div className="landing-video-card-tabs">
                {appTabs.map((tab) => (
                  <span key={tab} className={`landing-video-card-tab${tab === "Home" ? " active" : ""}`}>
                    {tab}
                  </span>
                ))}
              </div>
            </div>

            <div className="landing-video-card-body">
              <div className="landing-video-card-home-top">
                <div className="landing-video-card-greeting">
                  <span className="landing-video-card-weather">☼ 68° Clear</span>
                  <strong>Steady as you go.</strong>
                  <small>Here&apos;s what&apos;s happening with your vehicles.</small>
                </div>
                <div className="landing-video-card-setup">
                  <span>Complete your account setup</span>
                  <strong>4 of 5</strong>
                </div>
              </div>

              <div className="landing-video-card-vehicle-panel">
                <div className="landing-video-card-vehicle-info">
                  <span>Primary vehicle</span>
                  <strong>2021 Toyota Tacoma</strong>
                  <small>TRD Off-Road · 32,215 mi · Updated today</small>
                  <div className="landing-video-card-vehicle-actions">
                    <em>Current odometer</em>
                    <b>32,215 mi</b>
                  </div>
                </div>
                <div className="landing-video-card-car-frame">
                  <img
                    src="/images/landing/vehicle-cutout-tacoma.png"
                    alt="White Toyota Tacoma"
                    className="landing-video-card-car-img"
                  />
                </div>
              </div>

              <div className="landing-video-card-panels">
                <div className="landing-video-card-panel">
                  <div className="landing-video-card-panel-head">
                    <h4>Dashboard overview</h4>
                    <span>This vehicle</span>
                  </div>
                  <div className="landing-video-card-stats" aria-label="Garage overview">
                    {statItems.map((item) => (
                      <div key={item.label} className="landing-video-card-stat">
                        <strong>{item.value}</strong>
                        <span>{item.label}</span>
                        <small>{item.note}</small>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="landing-video-card-side-stack">
                  <div className="landing-video-card-panel landing-video-card-panel-compact">
                    <div className="landing-video-card-panel-head">
                      <h4>Alerts</h4>
                      <span>View all</span>
                    </div>
                    <p>No active alerts right now.</p>
                  </div>
                  <div className="landing-video-card-panel landing-video-card-panel-compact">
                    <div className="landing-video-card-panel-head">
                      <h4>Quick odometer update</h4>
                    </div>
                    <p>Keep reminders accurate and on track.</p>
                    <span className="landing-video-card-action-link">Update odometer</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="landing-video-attribution">
        Video:{" "}
        <a
          href="https://coverr.co/videos/misty-mountain-road-journey"
          target="_blank"
          rel="noopener noreferrer"
        >
          Coverr
        </a>{" "}
        (free, no attribution required)
      </div>
    </section>
  );
}
