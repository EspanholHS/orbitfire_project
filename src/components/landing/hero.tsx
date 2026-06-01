"use client";

import { Database, Flame, Satellite } from "lucide-react";
import { Container } from "@/components/layout/container";
import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { DashboardTransitionLink } from "@/components/transitions/dashboard-transition-link";
import { Badge } from "@/components/ui/badge";
import { useInView } from "@/hooks/use-in-view";
import type { RefObject } from "react";

const supportBadges = [
  {
    icon: <Database aria-hidden="true" size={14} />,
    label: "Dados reais do INPE",
  },
  {
    icon: <Flame aria-hidden="true" size={14} />,
    label: "Consumo dos dados via API OrbitFire",
  },
  {
    icon: <Satellite aria-hidden="true" size={14} />,
    label: "Monitoramento por satélite",
  },
];

export function Hero() {
  const { ref: heroContentRef, isInView: heroContentInView } = useInView({
    rootMargin: "-42% 0px -4% 0px",
    threshold: 0.01,
  });
  const { ref: heroPreviewRef, isInView: heroPreviewInView } = useInView({
    rootMargin: "-42% 0px -4% 0px",
    threshold: 0.01,
  });
  const { ref: heroFooterRef, isInView: heroFooterInView } = useInView({
    rootMargin: "-48% 0px -4% 0px",
    threshold: 0.01,
  });

  return (
    <section className="relative overflow-hidden">
      <Container className="grid min-h-[calc(100svh-28px)] items-center gap-12 pb-10 pt-20 md:pt-24 lg:grid-cols-[1.02fr_0.98fr] lg:pb-14">
        <div
          ref={heroContentRef as RefObject<HTMLDivElement>}
          className={`relative z-10 animate-orbitfire-fade-up transition-all duration-1000 ${
            heroContentInView ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
          }`}
        >
          <Badge className="shadow-[0_0_28px_rgba(249,115,22,0.16)]">
            <span className="h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_14px_rgba(249,115,22,0.9)]" />
            OrbitFire
          </Badge>

          <h1 className="mt-8 max-w-4xl text-[2.85rem] font-medium leading-[0.94] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-[5.75rem]">
            <span className="block">Monitoramento</span>
            <span className="block">espacial para</span>
            <span className="block">identificar áreas</span>
            <span className="block">sob risco de fogo</span>
          </h1>

          <p className="mt-7 max-w-[20rem] text-base font-medium leading-8 text-white/64 md:max-w-xl md:text-xl md:leading-9">
            O OrbitFire transforma dados públicos do INPE em mapas, indicadores
            e prioridades de acompanhamento ambiental.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <DashboardTransitionLink>Acessar dashboard</DashboardTransitionLink>
            <p className="max-w-sm text-sm font-medium leading-6 text-white/42">
              Focos detectados por satélite não representam confirmação de
              incêndio florestal.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            {supportBadges.map((item) => (
              <span
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-semibold text-white/58 backdrop-blur-md"
                key={item.label}
              >
                <span className="text-orange-300">{item.icon}</span>
                {item.label}
              </span>
            ))}
          </div>
        </div>

        <div
          ref={heroPreviewRef as RefObject<HTMLDivElement>}
          className={`relative z-10 animate-orbitfire-fade-up [animation-delay:180ms] transition-all duration-1000 ${
            heroPreviewInView ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
          }`}
        >
          <DashboardPreview variant="hero" />
        </div>
      </Container>

      <Container className="pb-8">
        <div
          ref={heroFooterRef as RefObject<HTMLDivElement>}
          className={`grid gap-4 border-t border-white/10 pt-5 text-xs font-semibold uppercase tracking-[0.18em] text-white/36 transition-all duration-1000 md:grid-cols-3 ${
            heroFooterInView ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-6"
          }`}
        >
          <span>Programa Queimadas - INPE</span>
          <span className="md:text-center">FRP acumulado: 76.091,2 MW</span>
          <span className="md:text-right">Bioma mais afetado: Cerrado</span>
        </div>
      </Container>
    </section>
  );
}
