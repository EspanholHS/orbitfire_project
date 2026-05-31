import { FinalCta } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero";
import { IndicatorsSection } from "@/components/landing/indicators-section";
import { ProblemSection } from "@/components/landing/problem-section";
import { ProcessSection } from "@/components/landing/process-section";
import { SolutionSection } from "@/components/landing/solution-section";
import { OrbitalBackground } from "@/components/layout/orbital-background";
import { OrbitalLockTransitionProvider } from "@/components/transitions/orbital-lock-transition";

export default function Home() {
  return (
    <OrbitalLockTransitionProvider>
      <main className="relative isolate min-h-screen overflow-hidden">
        <OrbitalBackground />
        <div className="relative z-10">
          <Hero />
          <ProblemSection />
          <SolutionSection />
          <ProcessSection />
          <IndicatorsSection />
          <FinalCta />
        </div>
      </main>
    </OrbitalLockTransitionProvider>
  );
}
