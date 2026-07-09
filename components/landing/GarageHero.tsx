"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

const proofPoints = ["Free for one vehicle", "No ads, no data selling", "Export anytime"];

/**
 * Full-viewport "sunlit garage" hero.
 *
 * The scene is layered so the vehicle stays a swappable foreground asset:
 * backdrop illustration → floor/stage plane → shadow → vehicle cutout →
 * floating UI cards. Any make/model cutout can be dropped onto the same
 * stage without re-integrating it into the background.
 *
 * Pointer parallax writes --lp-px / --lp-py custom properties consumed by
 * CSS transforms; it is disabled for prefers-reduced-motion and coarse
 * pointers.
 */
export function GarageHero() {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(pointer: fine)");
    if (reducedMotion.matches || !finePointer.matches) return;

    let frame = 0;
    let targetX = 0;
    let targetY = 0;

    const onPointerMove = (event: PointerEvent) => {
      const rect = scene.getBoundingClientRect();
      targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      if (!frame) {
        frame = window.requestAnimationFrame(() => {
          frame = 0;
          scene.style.setProperty("--lp-px", targetX.toFixed(3));
          scene.style.setProperty("--lp-py", targetY.toFixed(3));
        });
      }
    };

    const onPointerLeave = () => {
      scene.style.setProperty("--lp-px", "0");
      scene.style.setProperty("--lp-py", "0");
    };

    scene.addEventListener("pointermove", onPointerMove);
    scene.addEventListener("pointerleave", onPointerLeave);
    return () => {
      scene.removeEventListener("pointermove", onPointerMove);
      scene.removeEventListener("pointerleave", onPointerLeave);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="lp-hero" aria-labelledby="lp-hero-title">
      <div className="lp-hero-scene" ref={sceneRef}>
        <div className="lp-hero-backdrop" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/landing/garage-hero-scene.svg" alt="" className="lp-hero-backdrop-art" />
          <div className="lp-hero-light-shaft" />
        </div>

        <div className="lp-hero-inner">
          <div className="lp-hero-copy">
            <p className="lp-hero-eyebrow">My Car Pal</p>
            <h1 id="lp-hero-title">
              Take care of your car.
              <br />
              <span>We&rsquo;ll handle the rest.</span>
            </h1>
            <p className="lp-hero-sub">
              Reminders, service history, receipts, and glovebox documents — organized in one calm,
              private place for every vehicle you own.
            </p>
            <div className="lp-hero-cta-row">
              <Link href="/register" className="lp-btn lp-btn-primary">
                Start free
              </Link>
              <a href="#product" className="lp-btn lp-btn-ghost">
                See how it works
              </a>
            </div>
            <ul className="lp-hero-proof" aria-label="Highlights">
              {proofPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>

          <div className="lp-hero-stage-wrap" aria-hidden="true">
            <div className="lp-vehicle-stage lp-hero-stage">
              <span className="lp-vehicle-shadow" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/landing/vehicle-cutout-tacoma.png"
                alt=""
                className="lp-vehicle-cutout"
              />
            </div>

            <div className="lp-hero-card lp-hero-card-reminder">
              <span className="lp-hero-card-icon lp-hero-card-icon-clock" />
              <span className="lp-hero-card-copy">
                <strong>Oil change due soon</strong>
                <small>In 480 mi · Reminder set</small>
              </span>
            </div>
            <div className="lp-hero-card lp-hero-card-receipt">
              <span className="lp-hero-card-icon lp-hero-card-icon-check" />
              <span className="lp-hero-card-copy">
                <strong>Receipt saved</strong>
                <small>Tires · $612 · Glovebox</small>
              </span>
            </div>
          </div>
        </div>

        <a href="#product" className="lp-hero-scroll-hint">
          <span aria-hidden="true">↓</span> Your digital garage
        </a>
      </div>
    </section>
  );
}
