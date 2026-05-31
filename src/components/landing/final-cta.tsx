"use client";

import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { DashboardTransitionLink } from "@/components/transitions/dashboard-transition-link";
import { useInView } from "@/hooks/use-in-view";
import { useState, useRef } from "react";

export function FinalCta() {
  const { ref, isInView } = useInView({ threshold: 0.1 });
  const buttonRef = useRef<HTMLDivElement>(null);
  const [buttonTransform, setButtonTransform] = useState("translate(0px, 0px)");

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setButtonTransform(`translate(${x * 0.2}px, ${y * 0.2}px)`);
  };

  const handleMouseLeave = () => {
    setButtonTransform("translate(0px, 0px)");
  };

  return (
      <section className="relative pb-24 pt-12 md:pb-32" id="explorar" ref={ref}>
        <Container>
          <div className="relative overflow-hidden rounded-lg border border-white/10 bg-black/55 p-8 shadow-[0_36px_140px_rgba(0,0,0,0.64)] backdrop-blur-xl md:p-12 lg:p-16">
            {/* Slowly pulsing radial glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(249,115,22,0.22),transparent_52%)] animate-pulse [animation-duration:4s]" />

            {/* Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {Array.from({ length: 8 }).map((_, i) => (
                <span
                  key={i}
                  className="absolute block h-1 w-1 rounded-full bg-orange-400 opacity-20 [animation:orbitfire-float-up_10s_linear_infinite]"
                  style={{
                    left: `${10 + i * 12}%`,
                    bottom: "-5%",
                    animationDelay: `${i * 1.5}s`,
                    animationDuration: `${10 + (i % 3) * 5}s`
                  }}
                />
              ))}
            </div>

            {/* Orbital arc moving slowly with dots */}
            <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full border border-orange-500/10 [animation:orbitfire-spin-slow_30s_linear_infinite] border-t-orange-400/30 border-r-orange-400/10 border-b-transparent border-l-transparent pointer-events-none">
              <span className="absolute top-[14%] left-[14%] h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,1)]" />
            </div>
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full border border-orange-300/20 [animation:orbitfire-spin-slow_20s_linear_infinite_reverse] border-t-orange-400/40 border-r-transparent border-b-transparent border-l-orange-400/10 pointer-events-none">
              <span className="absolute bottom-[14%] right-[14%] h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-300/60 to-transparent" />

            <div className="relative z-10 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <div className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-orange-300 transition-all duration-700 ${isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                  <ArrowUpRight aria-hidden="true" size={20} />
                </div>
                <h2 className={`mt-8 max-w-4xl text-4xl font-medium leading-[1.02] tracking-tight text-white md:text-6xl transition-all duration-700 delay-150 ${isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                  Transforme observação espacial em inteligência ambiental
                </h2>
                <p className={`mt-6 max-w-2xl text-base font-medium leading-8 text-white/60 md:text-lg transition-all duration-700 delay-300 ${isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                  Explore dados reais de focos detectados por satélite e
                  identifique as regiões com maior concentração de registros no período
                  analisado.
                </p>
              </div>

              <div
                ref={buttonRef}
                className={`lg:pb-1 transition-all duration-700 delay-500 p-8 -m-8 ${isInView ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"}`}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <div
                  className="transition-transform duration-300 ease-out inline-block"
                  style={{ transform: buttonTransform }}
                >
                  <DashboardTransitionLink>Explorar dashboard</DashboardTransitionLink>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
  );
}
