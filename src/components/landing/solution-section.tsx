"use client";

import { BarChart3, Filter, Map, PanelTop } from "lucide-react";
import { Container } from "@/components/layout/container";
import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { SectionHeading } from "@/components/landing/section-heading";
import { useInView } from "@/hooks/use-in-view";
import type { RefObject } from "react";

const solutionItems = [
  { icon: Map, label: "Mapa" },
  { icon: PanelTop, label: "Dashboard" },
  { icon: Filter, label: "Filtros" },
  { icon: BarChart3, label: "Indicadores" },
];

export function SolutionSection() {
  const { ref, isInView } = useInView({ rootMargin: "-14% 0px -14% 0px", threshold: 0.1 });

  return (
    <section className="relative py-24 md:py-32" id="solucao">
      <div className="absolute inset-x-0 top-12 -z-0 h-96 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.13),transparent_68%)]" />
      <Container className="relative z-10">
        <div
          ref={ref as RefObject<HTMLDivElement>}
          className={`grid gap-12 transition-all duration-1000 lg:grid-cols-[0.95fr_1.05fr] lg:items-center ${
            isInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="relative order-2 lg:order-1">
            <DashboardPreview variant="solution" />
          </div>

          <div className="order-1 lg:order-2">
            <SectionHeading
              eyebrow="Solução"
              title="Inteligência visual para monitoramento ambiental"
              text="O OrbitFire organiza focos detectados por satélite em uma plataforma interativa, permitindo visualizar registros no mapa, comparar estados e biomas, acompanhar indicadores ambientais e destacar municípios com maior concentração de detecções."
            />

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
              {solutionItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.035] p-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-orange-300/30 hover:bg-orange-500/10 hover:shadow-[0_8px_30px_rgba(249,115,22,0.1)]"
                    key={item.label}
                  >
                    <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-orange-300/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <Icon
                      aria-hidden="true"
                      className="text-orange-300 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                      size={18}
                    />
                    <p className="mt-4 text-sm font-semibold text-white/74 transition-colors group-hover:text-white">
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
