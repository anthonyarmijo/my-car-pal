"use client";

import { useRef, useState, type KeyboardEvent, type TouchEvent } from "react";
import {
  GloveboxRegistrationForm,
  type GloveboxRegistrationFormProps,
} from "@/components/glovebox-registration-form";

const SWIPE_THRESHOLD = 48;

export type GloveboxRegistrationCarouselItem = GloveboxRegistrationFormProps & {
  label: string;
};

type GloveboxRegistrationCarouselProps = {
  vehicles: GloveboxRegistrationCarouselItem[];
};

export function GloveboxRegistrationCarousel({
  vehicles,
}: GloveboxRegistrationCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const canBrowse = vehicles.length > 1;
  const activeVehicle = vehicles[activeIndex] ?? vehicles[0];

  if (!activeVehicle) {
    return null;
  }

  function showPreviousVehicle() {
    if (!canBrowse) {
      return;
    }
    setActiveIndex(
      (current) => (current - 1 + vehicles.length) % vehicles.length,
    );
  }

  function showNextVehicle() {
    if (!canBrowse) {
      return;
    }
    setActiveIndex((current) => (current + 1) % vehicles.length);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget || !canBrowse) {
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPreviousVehicle();
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      showNextVehicle();
    }
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const startX = touchStartX.current;
    const endX = event.changedTouches[0]?.clientX;
    touchStartX.current = null;

    if (!canBrowse || startX === null || endX === undefined) {
      return;
    }

    const distance = endX - startX;
    if (Math.abs(distance) < SWIPE_THRESHOLD) {
      return;
    }

    if (distance > 0) {
      showPreviousVehicle();
    } else {
      showNextVehicle();
    }
  }

  return (
    <div
      className="glovebox-registration-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label="Vehicle registrations"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="glovebox-registration-carousel-header">
        <div className="glovebox-registration-vehicle-heading">
          <span className="glovebox-registration-kicker">
            Vehicle registration
          </span>
          <h3 className="section-title">{activeVehicle.label}</h3>
        </div>

        <div className="glovebox-registration-carousel-controls">
          <button
            type="button"
            className="glovebox-registration-carousel-button"
            onClick={showPreviousVehicle}
            disabled={!canBrowse}
            aria-label="Show previous vehicle"
            title={
              canBrowse ? "Previous vehicle" : "Add another vehicle to browse"
            }
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m14.5 6-6 6 6 6" />
            </svg>
          </button>
          <span
            className="glovebox-registration-carousel-position"
            aria-live="polite"
          >
            {canBrowse
              ? `${activeIndex + 1} of ${vehicles.length}`
              : "1 vehicle"}
          </span>
          <button
            type="button"
            className="glovebox-registration-carousel-button"
            onClick={showNextVehicle}
            disabled={!canBrowse}
            aria-label="Show next vehicle"
            title={canBrowse ? "Next vehicle" : "Add another vehicle to browse"}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m9.5 6 6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="glovebox-registration-carousel-panel">
        <GloveboxRegistrationForm
          key={activeVehicle.vehicleId}
          {...activeVehicle}
        />
      </div>
    </div>
  );
}
