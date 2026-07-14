"use client";

import { HomeIcon, type HomeIconName } from "@/components/home-icon";
import { Badge, Card, getButtonClassName } from "@my-car-pal/ui";
import Link from "next/link";
import { useRef, useState, type KeyboardEvent, type TouchEvent } from "react";

export type HomeVehicleCarouselItem = {
  id: string;
  label: string;
  meta: string;
  currentOdometer: string;
  hasOdometer: boolean;
  updatedLabel: string;
  imageUrl: string;
  imageIsDefault: boolean;
  stats: Array<{
    icon: HomeIconName;
    label: string;
    value: string;
    note: string;
  }>;
};

type HomeVehicleCarouselProps = {
  vehicles: HomeVehicleCarouselItem[];
};

const SWIPE_THRESHOLD = 45;

export function HomeVehicleCarousel({ vehicles }: HomeVehicleCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  if (vehicles.length === 0) {
    return null;
  }

  const canBrowse = vehicles.length > 1;
  const activeVehicle = vehicles[activeIndex] ?? vehicles[0];

  function showPreviousVehicle() {
    if (!canBrowse) return;
    setActiveIndex((index) => (index - 1 + vehicles.length) % vehicles.length);
  }

  function showNextVehicle() {
    if (!canBrowse) return;
    setActiveIndex((index) => (index + 1) % vehicles.length);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.target !== event.currentTarget) return;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPreviousVehicle();
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      showNextVehicle();
    }
  }

  function handleTouchStart(event: TouchEvent<HTMLElement>) {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: TouchEvent<HTMLElement>) {
    const startX = touchStartX.current;
    const endX = event.changedTouches[0]?.clientX;
    touchStartX.current = null;

    if (!canBrowse || startX === null || endX === undefined) return;
    const distance = endX - startX;
    if (Math.abs(distance) < SWIPE_THRESHOLD) return;
    if (distance > 0) showPreviousVehicle();
    else showNextVehicle();
  }

  return (
    <Card
      as="section"
      className="section-card home-primary-vehicle-card"
      role="region"
      aria-roledescription="carousel"
      aria-label="Garage vehicles"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="home-primary-vehicle-card-header">
        <Badge className="badge home-primary-vehicle-eyebrow">
          <HomeIcon name={activeIndex === 0 ? "star" : "garage"} />
          {activeIndex === 0 ? "Primary vehicle" : "Garage vehicle"}
        </Badge>
        <div className="home-primary-vehicle-header-actions">
          <div
            className="home-vehicle-carousel-controls"
            title={canBrowse ? "Browse garage vehicles" : "Add another vehicle to browse"}
          >
            <button
              type="button"
              className="home-vehicle-carousel-button"
              onClick={showPreviousVehicle}
              disabled={!canBrowse}
              aria-label="Previous vehicle"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 5.5-6 6.5 6 6.5" /></svg>
            </button>
            <span className="home-vehicle-carousel-position" aria-live="polite">
              {canBrowse ? `${activeIndex + 1} of ${vehicles.length}` : "1 vehicle"}
            </span>
            <button
              type="button"
              className="home-vehicle-carousel-button"
              onClick={showNextVehicle}
              disabled={!canBrowse}
              aria-label="Next vehicle"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9.5 5.5 6 6.5-6 6.5" /></svg>
            </button>
            {!canBrowse ? <span className="home-vehicle-carousel-hint">Add another vehicle to browse</span> : null}
          </div>
          <Link href={`/vehicle/${activeVehicle.id}`} className={getButtonClassName({ variant: "secondary", className: "home-garage-link" })}>
            View in Garage
            <HomeIcon name="chevron" />
          </Link>
        </div>
      </div>

      <div key={activeVehicle.id} className="home-vehicle-carousel-content" aria-live="polite" aria-atomic="true">
        <div className="home-primary-vehicle-body">
          <div className="home-primary-vehicle-copy">
            <h2 className="section-title home-primary-vehicle-title">{activeVehicle.label}</h2>
            <p className="section-subtitle home-primary-vehicle-subtitle">{activeVehicle.meta}</p>
            <div className="home-current-odometer">
              <span>Current odometer</span>
              <strong>
                {activeVehicle.currentOdometer}
                {activeVehicle.hasOdometer ? <small> mi</small> : null}
              </strong>
              <small>{activeVehicle.updatedLabel}</small>
            </div>
            <Link href={`/vehicle/${activeVehicle.id}`} className={getButtonClassName({ className: "home-primary-odometer-link" })}>
              <HomeIcon name="gauge" />
              Update odometer
            </Link>
          </div>
          <div className="home-primary-vehicle-media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeVehicle.imageUrl}
              alt={activeVehicle.label}
              className={`home-primary-vehicle-image${activeVehicle.imageIsDefault ? " home-primary-vehicle-image-default" : ""}`}
            />
          </div>
        </div>
        <div className="home-vehicle-stat-strip">
          {activeVehicle.stats.map((item) => (
            <article key={item.label} className="home-vehicle-stat">
              <HomeIcon name={item.icon} />
              <span>
                <small>{item.label}</small>
                <strong>{item.value}</strong>
                <em>{item.note}</em>
              </span>
            </article>
          ))}
        </div>
      </div>
    </Card>
  );
}
