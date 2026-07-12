"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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
  const heroRef = useRef<HTMLElement>(null);
  const roadRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const [playVideo, setPlayVideo] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & {
      connection?: {
        saveData?: boolean;
        addEventListener?: (type: string, listener: () => void) => void;
        removeEventListener?: (type: string, listener: () => void) => void;
      };
    }).connection;
    const updateMediaMode = () => setPlayVideo(!reducedMotion.matches && !connection?.saveData);

    updateMediaMode();
    reducedMotion.addEventListener("change", updateMediaMode);
    connection?.addEventListener?.("change", updateMediaMode);
    return () => {
      reducedMotion.removeEventListener("change", updateMediaMode);
      connection?.removeEventListener?.("change", updateMediaMode);
    };
  }, []);

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

    const hero = heroRef.current;
    const road = roadRef.current;
    if (hero && road && !reducedMotion.matches) {
      let scrollFrame = 0;

      const updateRoadProgress = () => {
        scrollFrame = 0;
        const holdDistance = Math.max(window.innerHeight * 0.42, 224);
        const scrolled = window.scrollY - hero.offsetTop;
        const progress = Math.min(1, Math.max(0, scrolled / holdDistance));
        // The handoff ramp runs until the garage scene's mask edge crosses the
        // footage, so the seam glow peaks exactly at the crossfade.
        const handoffDistance = Math.max(scene.offsetTop - hero.offsetTop, holdDistance);
        const handoff = Math.min(1, Math.max(0, scrolled / handoffDistance));

        road.style.setProperty("--lp-road-scale", (1 + progress * 0.045).toFixed(4));
        road.style.setProperty("--lp-road-copy-opacity", (1 - progress * 0.72).toFixed(3));
        road.style.setProperty("--lp-road-shade-opacity", (progress * 0.45).toFixed(3));
        hero.style.setProperty("--lp-handoff", handoff.toFixed(3));
      };

      const onScroll = () => {
        if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateRoadProgress);
      };

      updateRoadProgress();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      cleanups.push(() => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
        if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
      });

    }

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

  useEffect(() => {
    const road = roadRef.current;
    const video = road?.querySelector("video");
    if (!road || !video || !playVideo) return;

    const videoObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
    videoObserver.observe(road);
    return () => videoObserver.disconnect();
  }, [playVideo]);

  return (
    <section className="lp-hero" aria-labelledby="lp-road-title" ref={heroRef}>
      <div className="lp-road" ref={roadRef}>
        {playVideo ? (
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
            <source src="/videos/highway-loop.webm" type="video/webm" />
            <source src="/videos/highway-loop.mp4" type="video/mp4" />
          </video>
        ) : null}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/landing/highway-poster.jpg" alt="" className="lp-road-poster" aria-hidden="true" />
        <div className="lp-road-fade" aria-hidden="true" />
        <div className="lp-road-content">
          <p className="lp-road-kicker">My Car Pal</p>
          <h1 id="lp-road-title">Take care of your car. We&rsquo;ll handle the rest.</h1>
          <p className="lp-road-product-copy">
            Your car&rsquo;s maintenance, records, and reminders—organized in one private place.
          </p>
          <div className="lp-road-actions">
            <Link href="/register" className="lp-btn lp-btn-road-primary">Start free</Link>
            <a href="#product" className="lp-btn lp-btn-road-secondary">See the product</a>
          </div>
          <p className="lp-road-proof">Free for one vehicle · No credit card · No ads · Self-hostable</p>
        </div>
        <a href="#garage-handoff" className="lp-road-arrow" aria-label="Begin the scroll into the garage">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 4v14.5M5.8 12.6 12 18.8l6.2-6.2" />
          </svg>
        </a>
      </div>

      {/* The scene overlaps the road slightly so their edges crossfade while scrolling. */}
      <div className="lp-road-gap" id="garage-handoff" aria-hidden="true" />

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
        </div>

        <div className="lp-hero-inner">
          <div className="lp-hero-copy">
            <p className="lp-hero-eyebrow">Your digital garage</p>
            <h2>Everything about your car, in one calm place.</h2>
            <p className="lp-hero-sub">
              Step out of the garage and into a dashboard that keeps maintenance, reminders, and
              records quietly organized.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
