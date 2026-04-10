import { Suspense } from "react";
import type { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { EcoPromiseSection } from "@/components/home/EcoPromiseSection";
import { ServicesPreviewSection } from "@/components/home/ServicesPreview";
import { WhyChooseSection } from "@/components/home/WhyChooseSection";
import { InsightsSection } from "@/components/home/InsightsSection";
import { GallerySection } from "@/components/home/GallerySection";
import { NewsletterSection } from "@/components/home/NewsletterSection";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Expertise you can trust: premier property management and cleaning in Bangor and North Wales.",
};

function InsightsFallback() {
  return (
    <section className="border-y border-primary/10 bg-white py-24">
      <div className="mx-auto max-w-6xl px-4 text-center text-sm text-ink/40">
        Loading insights…
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <EcoPromiseSection />
      <ServicesPreviewSection />
      <WhyChooseSection />
      <Suspense fallback={<InsightsFallback />}>
        <InsightsSection />
      </Suspense>
      <GallerySection />
      <NewsletterSection />
    </>
  );
}
