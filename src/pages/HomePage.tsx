import React, { useEffect } from "react";
import { HeroAnimatedIntro } from "../components/home/HeroAnimatedIntro";
import { FeatureCards } from "../components/home/FeatureCards";
import { HowItWorks } from "../components/home/HowItWorks";
import { PrivacyShowcase } from "../components/home/PrivacyShowcase";
import { SearchDiscovery } from "../components/home/SearchDiscovery";
import { ExampleProfilePreview } from "../components/home/ExampleProfilePreview";
import { CTASection } from "../components/home/CTASection";
import { updateSeoMeta } from "../utils/seo";

export const HomePage: React.FC = () => {
  useEffect(() => {
    updateSeoMeta({
      title: "ProfileHub — Privacy-First Searchable Personal Profile Platform",
      description:
        "Create a verified, searchable, and privacy-protected personal profile on the web with structured SEO and instant QR sharing.",
      url: window.location.origin,
    });
  }, []);

  return (
    <div className="w-full">
      <HeroAnimatedIntro />
      <FeatureCards />
      <HowItWorks />
      <PrivacyShowcase />
      <SearchDiscovery />
      <ExampleProfilePreview />
      <CTASection />
    </div>
  );
};
