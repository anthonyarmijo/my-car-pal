import Link from "next/link";
import { Badge, Card, getButtonClassName } from "@my-car-pal/ui";

export function DiyComingSoon() {
  return (
    <Card as="section" className="section-card diy-coming-soon-card">
      <div className="diy-coming-soon-copy">
        <Badge className="badge">Coming soon...</Badge>
        <h2 className="diy-coming-soon-title">DIY is in the workshop.</h2>
        <p className="diy-coming-soon-description">
          We&apos;re refining this learning space before opening it to everyone. The goal is practical guidance that is
          clear, safety-first, and genuinely useful beside your vehicle.
        </p>
        <ul className="list-reset diy-coming-soon-list">
          <li>Step-by-step maintenance guides</li>
          <li>Tool, preparation, and safety checklists</li>
          <li>Better connections to your maintenance history</li>
        </ul>
        <div className="diy-coming-soon-actions">
          <Link href="/maintenance" className={getButtonClassName()}>
            Review maintenance
          </Link>
          <Link href="/home" className={getButtonClassName({ variant: "secondary" })}>
            Back to home
          </Link>
        </div>
      </div>

      <div className="diy-coming-soon-visual" aria-hidden="true">
        <span className="diy-coming-soon-orbit" />
        <svg viewBox="0 0 96 96" role="presentation">
          <path d="M61.8 17.2a17.2 17.2 0 0 0-21.1 23.1L17.4 63.6a8.8 8.8 0 0 0 0 12.5l2.5 2.5a8.8 8.8 0 0 0 12.5 0l23.3-23.3a17.2 17.2 0 0 0 23.1-21.1L68 45l-12.4-4.6L51 28l10.8-10.8Z" />
          <path d="m25.5 69.5.1.1" />
        </svg>
        <span className="diy-coming-soon-caption">Safety-first guides in progress</span>
      </div>
    </Card>
  );
}
