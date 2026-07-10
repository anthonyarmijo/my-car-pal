"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

const proofPoints = ["Free for one vehicle", "No ads, no data selling", "Export anytime"];

/**
 * Landing opener: a full-viewport highway loop, then the empty sunlit-garage
 * scene fading in beneath it with the copy centered over the clean floor.
 * (The composited vehicle lives in the dashboard reveal below — see the
 * lp-vehicle-stage pattern there.)
 *
 * Pointer parallax on the backdrop writes --lp-px / --lp-py custom
 * properties consumed by CSS transforms; it is disabled for
 * prefers-reduced-motion and coarse pointers, as is the highway video.
 */
export function GarageHero() {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const cleanups: Array<() => void> = [];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("landing-fade-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    observer.observe(scene);
    cleanups.push(() => observer.disconnect());

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(pointer: fine)");
    if (!reducedMotion.matches && finePointer.matches) {
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
      cleanups.push(() => {
        scene.removeEventListener("pointermove", onPointerMove);
        scene.removeEventListener("pointerleave", onPointerLeave);
        if (frame) window.cancelAnimationFrame(frame);
      });
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <section className="lp-hero" aria-labelledby="lp-hero-title">
      <div className="lp-road">
        <video
          className="lp-road-video"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="/images/landing/highway-poster.jpg"
          aria-hidden="true"
        >
          <source src="/videos/highway-loop.mp4" type="video/mp4" />
        </video>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/landing/highway-poster.jpg" alt="" className="lp-road-poster" aria-hidden="true" />
        <div className="lp-road-fade" aria-hidden="true" />
        <p className="lp-road-tagline">Take care of your car. We&rsquo;ll handle the rest.</p>
        <a href="#garage" className="lp-road-arrow" aria-label="Scroll down to explore My Car Pal">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 4v14.5M5.8 12.6 12 18.8l6.2-6.2" />
          </svg>
        </a>
      </div>

      {/* Quiet breathing room so the garage reveal asks for one more scroll. */}
      <div className="lp-road-gap" aria-hidden="true" />

      <div className="lp-hero-scene lp-fade-up" id="garage" ref={sceneRef}>
        <div className="lp-hero-backdrop" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/landing/garage-hero-scene.jpg"
            srcSet="/images/landing/garage-hero-scene-900.jpg 900w, /images/landing/garage-hero-scene.jpg 1672w"
            sizes="100vw"
            alt=""
            fetchPriority="high"
            className="lp-hero-backdrop-art"
          />
          <div className="lp-hero-light-shaft" />
          {/* Night composite (dark theme only): sky, moon, and stars drawn
              through the door opening; silhouetted treeline; moonlit spill. */}
          <svg className="lp-hero-night" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="lpNightSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#0a1428" />
                <stop offset="0.5" stopColor="#122246" />
                <stop offset="1" stopColor="#233a63" />
              </linearGradient>
              <radialGradient id="lpMoonGlow" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0" stopColor="#f5f0dc" stopOpacity="0.95" />
                <stop offset="0.3" stopColor="#e8e4cf" stopOpacity="0.32" />
                <stop offset="1" stopColor="#e8e4cf" stopOpacity="0" />
              </radialGradient>
              <filter id="lpNightBlur" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1" />
              </filter>
            </defs>
            <g filter="url(#lpNightBlur)">
              {/* sky above the treeline, below the raised door panel */}
              <polygon points="53,12 100,8 100,44 53,44" fill="url(#lpNightSky)" opacity="0.85" />
              {/* silhouetted treeline / hedge */}
              <polygon points="53,42 62,44 70,40 80,44 88,41 100,43 100,54 53,52" fill="#0b1530" opacity="0.6" />
              {/* moonlit driveway: dim the daylight pavement */}
              <polygon points="53,51 100,53 100,80 53,74" fill="#101c38" opacity="0.42" />
            </g>
            <circle cx="81" cy="20" r="5.5" fill="url(#lpMoonGlow)" />
            <circle cx="81" cy="20" r="1.3" fill="#F3EFDA" />
            <g fill="#E9E6D2">
              <circle cx="60" cy="17" r="0.3" opacity="0.8" />
              <circle cx="66" cy="28" r="0.24" opacity="0.55" />
              <circle cx="71" cy="14" r="0.28" opacity="0.7" />
              <circle cx="89" cy="13" r="0.26" opacity="0.7" />
              <circle cx="93" cy="26" r="0.3" opacity="0.55" />
              <circle cx="97" cy="16" r="0.24" opacity="0.65" />
              <circle cx="86" cy="33" r="0.22" opacity="0.45" />
              <circle cx="57" cy="33" r="0.24" opacity="0.5" />
            </g>
          </svg>
        </div>

        <div className="lp-hero-inner">
          <div className="lp-hero-copy">
            <p className="lp-hero-eyebrow">Your digital garage</p>
            <h2 id="lp-hero-title">Everything about your car, in one calm place.</h2>
            <p className="lp-hero-sub">
              Step out of the garage and into a dashboard that keeps maintenance, reminders, and
              records quietly organized.
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
        </div>
      </div>
    </section>
  );
}
