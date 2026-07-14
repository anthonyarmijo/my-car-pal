import type { ReactNode } from "react";
import { Badge, Card } from "@my-car-pal/ui";

type PublicInfoPageProps = {
  eyebrow: string;
  title: string;
  intro: ReactNode;
  children: ReactNode;
  className?: string;
};

type PublicInfoSectionProps = {
  title: string;
  children: ReactNode;
};

export function PublicInfoPage({ eyebrow, title, intro, children, className = "" }: PublicInfoPageProps) {
  return (
    <Card as="section" className={`public-info-page${className ? ` ${className}` : ""}`}>
      <header className="public-info-header">
        <Badge>{eyebrow}</Badge>
        <h1>{title}</h1>
        <p>{intro}</p>
      </header>
      <div className="public-info-content">{children}</div>
    </Card>
  );
}

export function PublicInfoSection({ title, children }: PublicInfoSectionProps) {
  return (
    <Card as="article" className="public-info-section">
      <h2>{title}</h2>
      <div>{children}</div>
    </Card>
  );
}
