"use client";

import { useFadeIn } from "@/components/landing/useFadeIn";

export function PhotoShowcase() {
  const ref = useFadeIn();

  return (
    <section ref={ref} className="landing-photo-showcase landing-fade-up" id="photos">
      <div className="landing-photo-container">
        <div className="landing-photo-header">
          <div className="landing-photo-kicker">Your garage, anywhere</div>
          <h2>Carry your car with you.</h2>
          <p>Every receipt, every record — always at your fingertips.</p>
        </div>
        <div className="landing-photo-grid">
          <div className="landing-photo-card">
            <img
              src="/images/dashboard-interior.jpg"
              alt="Modern car interior dashboard"
              loading="lazy"
            />
            <div className="landing-photo-label">
              <strong>Your ride, your data</strong>
              <span>Track maintenance, mileage, and more — all private to you.</span>
            </div>
          </div>
          <div className="landing-photo-card">
            <img
              src="/images/offroad-dust.jpg"
              alt="4x4 kicking up dust on an off-road trail"
              loading="lazy"
            />
            <div className="landing-photo-label">
              <strong>Built for the road ahead</strong>
              <span>Adventure-ready reminders so you never miss a beat.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
