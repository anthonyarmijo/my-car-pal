"use client";

import { useFadeIn } from "@/components/landing/useFadeIn";

const stories = [
  {
    number: "01",
    title: "Know what needs attention",
    description:
      "Turn mileage, dates, and service intervals into a calm, useful view of what is due now and what is coming next.",
    points: ["Maintenance reminders and alerts", "Mileage-aware upcoming service", "Clear due-soon priorities"],
    visual: "attention",
  },
  {
    number: "02",
    title: "Keep every record together",
    description:
      "Build a useful history for every vehicle, with the paperwork and proof you need close at hand.",
    points: ["Service history, costs, and receipts", "Registration and insurance", "A private digital glovebox"],
    visual: "records",
  },
  {
    number: "03",
    title: "Stay in control",
    description:
      "Start quickly with VIN-assisted setup, then choose the ownership model that fits your garage—managed cloud or self-hosted open core.",
    points: ["Cars, trucks, SUVs, and motorcycles", "Cost visibility by vehicle", "Exportable records and self-hosting"],
    visual: "control",
  },
] as const;

function StoryVisual({ visual }: { visual: (typeof stories)[number]["visual"] }) {
  if (visual === "attention") {
    return (
      <div className="lp-story-ui lp-story-attention" aria-hidden="true">
        <div className="lp-story-ui-bar"><span>Upcoming</span><small>3 items</small></div>
        <div className="lp-story-due-card">
          <span className="lp-story-status is-amber" aria-hidden="true" />
          <span><strong>Oil &amp; filter change</strong><small>Due in 480 mi</small></span>
          <b>82%</b>
        </div>
        <div className="lp-story-progress" aria-hidden="true"><span /></div>
        <div className="lp-story-row"><span className="lp-story-status" aria-hidden="true" /><span><strong>Registration renewal</strong><small>Aug 12 · 35 days</small></span></div>
        <div className="lp-story-row"><span className="lp-story-status" aria-hidden="true" /><span><strong>Tire rotation</strong><small>In 4,780 mi</small></span></div>
      </div>
    );
  }

  if (visual === "records") {
    return (
      <div className="lp-story-ui lp-story-records" aria-hidden="true">
        <div className="lp-story-ui-bar"><span>Outback records</span><small>All saved</small></div>
        <div className="lp-record-summary"><strong>$684.20</strong><span>Service total this year</span></div>
        <div className="lp-record-doc"><span className="lp-doc-icon" aria-hidden="true">✓</span><span><strong>30,000-mile service</strong><small>Receipt attached · May 18</small></span><b>$412</b></div>
        <div className="lp-record-doc"><span className="lp-doc-icon" aria-hidden="true">▤</span><span><strong>Insurance policy</strong><small>Glovebox · renews Nov 4</small></span><b>PDF</b></div>
        <div className="lp-record-tabs" aria-hidden="true"><span className="is-active">History</span><span>Receipts</span><span>Glovebox</span></div>
      </div>
    );
  }

  return (
    <div className="lp-story-ui lp-story-control" aria-hidden="true">
      <div className="lp-story-ui-bar"><span>Add a vehicle</span><small>Step 1 of 2</small></div>
      <div className="lp-control-vin"><span>VIN</span><strong>4S4BTGUD•••••••••</strong><b>Decoded</b></div>
      <div className="lp-control-vehicle"><span><small>2023</small><strong>Subaru Outback Wilderness</strong></span><em>32,215 mi</em></div>
      <div className="lp-control-choice"><span><small>Hosted for you</small><strong>My Car Pal Cloud</strong></span><span><small>Run it yourself</small><strong>Open core</strong></span></div>
      <p><span aria-hidden="true">↓</span> Your records stay exportable</p>
    </div>
  );
}

export function FeatureSection() {
  const ref = useFadeIn();

  return (
    <section ref={ref} className="lp-section lp-features lp-fade-up" id="features" aria-labelledby="lp-features-title">
      <div className="lp-section-head lp-feature-head">
        <p className="lp-kicker">Built around ownership</p>
        <h2 id="lp-features-title">Less admin. More confidence in every mile.</h2>
        <p className="lp-section-sub">A simple system for the moments that matter—from the next oil change to the complete story of a vehicle.</p>
      </div>
      <div className="lp-story-list">
        {stories.map((story) => (
          <article key={story.title} className="lp-story">
            <div className="lp-story-copy">
              <span className="lp-story-number" aria-hidden="true">{story.number}</span>
              <h3>{story.title}</h3>
              <p>{story.description}</p>
              <ul>
                {story.points.map((point) => <li key={point}>{point}</li>)}
              </ul>
            </div>
            <StoryVisual visual={story.visual} />
          </article>
        ))}
      </div>
      <p className="lp-owners-line">Built for owners, not dealerships.</p>
    </section>
  );
}
