import { PublicInfoPage } from "@/components/public-info-page";

export default function AboutPage() {
  return (
    <PublicInfoPage
      eyebrow="About us"
      title="Why My Car Pal exists"
      intro="A calmer, owner-first way to care for the vehicles that keep everyday life moving."
      className="about-page-card"
    >
      <p className="section-subtitle about-page-subtitle about-page-lead">
        My Car Pal started from a personal need: managing multiple vehicles without paper notes, scattered files, or the stress of
        forgetting what was due next.
      </p>
      <p className="section-subtitle about-page-subtitle">
        The goal is simple: give everyday drivers a modern, calm, and dependable way to track maintenance, store key documents, and get clear
        reminders at the right time.
      </p>
      <div className="about-pill-list" aria-label="What we prioritize">
        <span className="about-pill">Clean and modern experience</span>
        <span className="about-pill">Helpful service alerts</span>
        <span className="about-pill">Privacy-first approach</span>
        <span className="about-pill">Built for real drivers</span>
      </div>
      <p className="section-subtitle about-page-subtitle">
        We built this to feel personal and respectful, not noisy. No trade-in pressure, no quote funnels, just a focused tool you can trust.
      </p>
      <p className="section-subtitle about-page-subtitle">
        My Car Pal is privacy-first by design, with an emphasis on responsible data handling and practical security. It was created by a
        regular person who saw a real problem and wanted to share a better solution with friends, family, and other drivers.
      </p>
      <p className="about-page-closing">Thanks for supporting My Car Pal and helping us keep building it the right way.</p>
    </PublicInfoPage>
  );
}
