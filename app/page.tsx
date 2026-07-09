import type { Metadata } from "next";
import { GarageHero } from "@/components/landing/GarageHero";
import { DashboardReveal } from "@/components/landing/DashboardReveal";
import { FeatureSection } from "@/components/landing/FeatureSection";
import { PrivacySection } from "@/components/landing/PrivacySection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import "./landing.css";

export const metadata: Metadata = {
  title: "My Car Pal — Take care of your car. We'll handle the rest.",
  description:
    "The owner-first vehicle maintenance home. Reminders, service history, receipts, and glovebox documents — private, ad-free, and in your control.",
};

export default function LandingPage() {
  return (
    <div className="landing-product-page lp-page">
      <GarageHero />
      <DashboardReveal />
      <FeatureSection />
      <PrivacySection />
      <FinalCTA />
    </div>
  );
}
