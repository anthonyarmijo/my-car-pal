import type { Metadata } from "next";
import { VideoHero } from "@/components/landing/VideoHero";
import { PhotoShowcase } from "@/components/landing/PhotoShowcase";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { TrustBar } from "@/components/landing/TrustBar";
import { FinalCTA } from "@/components/landing/FinalCTA";

export const metadata: Metadata = {
  title: "My Car Pal — Own your car's history",
  description:
    "The owner-first vehicle maintenance command center. Track service, receipts, registration, and reminders — private, ad-free, and in your control.",
};

export default function LandingPage() {
  return (
    <div className="landing-product-page">
      <VideoHero />
      <PhotoShowcase />
      <FeatureGrid />
      <TrustBar />
      <FinalCTA />
    </div>
  );
}
