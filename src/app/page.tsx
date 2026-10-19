import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Hero } from "@/components/landing/hero";
import {
  CtaBand,
  Faq,
  Features,
  HowItWorks,
  Privacy,
  TheReveal,
} from "@/components/landing/sections";

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      <main id="main" className="flex-1">
        <Hero />
        <HowItWorks />
        <TheReveal />
        <Features />
        <Privacy />
        <Faq />
        <CtaBand />
      </main>

      <SiteFooter />
    </div>
  );
}
