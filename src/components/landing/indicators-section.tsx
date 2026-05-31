"use client";

import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/landing/section-heading";
import { useInView } from "@/hooks/use-in-view";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { useState, useRef, useEffect } from "react";

const indicators = [
  { label: "Focos detectados", value: 3141 },
  { label: "Municípios com focos detectados", value: 369 },
  { label: "FRP acumulado", value: 76091.2, suffix: " MW", subtext: "Potência radiativa observada" },
  { label: "Focos detectados no Cerrado", value: 2088 },
  { label: "Registros na faixa visual muito alta*", value: 1991, isHighRisk: true },
];

export function IndicatorsSection() {
  const { ref, isInView } = useInView({ threshold: 0.1 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [animationCompleted, setAnimationCompleted] = useState(false);

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setAnimationCompleted(true), 2500);
      return () => clearTimeout(timer);
    }
  }, [isInView]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };
  
  const handleMouseLeave = () => {
    setMousePos({ x: -1000, y: -1000 });
  };

  return (
    <section className="relative py-24 md:py-32 overflow-hidden" id="indicadores" ref={ref}>
      {/* Fundo técnico de leitura de dados decorativo */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <div className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] [background-size:60px_60px]" />
        {isInView && (
          <>
            <div className="absolute left-10 top-20 h-px w-32 bg-orange-400 [animation:orbitfire-scan-x_6s_linear_infinite]" />
            <div className="absolute right-20 bottom-40 h-20 w-px bg-orange-400 [animation:orbitfire-scan-y_4s_linear_infinite]" />
            <span className="absolute font-mono text-[10px] text-orange-300 top-10 left-10 animate-pulse">SYS.COORD: 45.2.11</span>
          </>
        )}
      </div>

      <Container>
        <div 
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className={`relative rounded-lg border border-white/10 bg-black/50 p-5 shadow-[0_32px_120px_rgba(0,0,0,0.56)] backdrop-blur-xl md:p-8 transition-all duration-1000 ${isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          {/* Spotlight global para os cards */}
          <div 
            className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 hover:opacity-100"
            style={{
              background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(249,115,22,0.06), transparent 40%)`,
              opacity: mousePos.x === -1000 ? 0 : 1
            }}
          />
          
          <div className="relative z-10 grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <SectionHeading
              eyebrow="Indicadores reais"
              title="Uma leitura sintética do dia analisado"
              text="Os principais números do arquivo do Programa Queimadas ajudam a revelar concentração territorial, exposição por bioma e condições associadas aos focos detectados."
            />

            <p className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-sm font-medium text-white/54 lg:justify-self-end">
              Dados analisados: Programa Queimadas do INPE - 29/05/2026.
            </p>
          </div>

          <div className="relative z-10 mt-10 grid gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 md:grid-cols-5">
            {indicators.map((indicator, index) => (
              <article
                className={`group relative bg-[#070707]/90 p-5 transition duration-300 md:min-h-[190px] overflow-hidden ${indicator.isHighRisk ? 'hover:bg-orange-500/10' : 'hover:bg-white/[0.04]'}`}
                key={indicator.label}
              >
                {/* Spotlight local do card */}
                <div 
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: `radial-gradient(200px circle at 50% 50%, rgba(255,255,255,0.05), transparent 70%)` }}
                />
                {/* Expandable top orange line */}
                <div className={`absolute left-0 top-0 h-[2px] bg-gradient-to-r from-orange-500 to-amber-300 transition-all duration-1000 ease-out ${isInView ? "w-full" : "w-0"}`} style={{ transitionDelay: `${index * 150 + 300}ms` }} />
                
                {/* Linha indicadora de leitura concluída */}
                <div className={`absolute left-5 right-5 bottom-0 h-px bg-orange-400/40 transition-all duration-700 ${animationCompleted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
                   <span className="absolute right-0 top-1/2 -translate-y-1/2 h-0.5 w-0.5 bg-white rounded-full" />
                </div>
                
                {/* Glowing border for high risk card */}
                {indicator.isHighRisk && (
                  <div className="absolute inset-0 border border-orange-500/20 animate-[pulse_4s_ease-in-out_infinite]" />
                )}
                
                {/* Energy pulse detail for FRP card */}
                {indicator.suffix === " MW" && (
                  <div className="absolute right-4 top-4 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
                  </div>
                )}
                
                <p className={`relative z-10 font-mono text-xs ${indicator.isHighRisk ? 'text-orange-400/70' : 'text-white/28'}`}>
                  {String(index + 1).padStart(2, "0")}
                </p>
                <strong className={`relative z-10 mt-8 block text-4xl font-medium tracking-tight md:text-5xl transition-all duration-300 group-hover:drop-shadow-[0_0_16px_rgba(249,115,22,0.4)] ${indicator.isHighRisk ? 'text-orange-300' : 'text-white'} ${indicator.suffix ? 'group-hover:text-amber-200' : ''}`}>
                  {isInView ? (
                    <AnimatedNumber value={indicator.value} formatOptions={{ minimumFractionDigits: indicator.value % 1 !== 0 ? 1 : 0 }} />
                  ) : (
                    "0"
                  )}
                  {indicator.suffix && <span className="text-2xl opacity-60">{indicator.suffix}</span>}
                </strong>
                <p className="mt-4 text-sm font-medium leading-6 text-white/52">
                  {indicator.label}
                </p>
                {indicator.subtext && (
                  <p className="mt-1 text-xs text-white/30">{indicator.subtext}</p>
                )}
              </article>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <p className="text-[11px] leading-relaxed text-white/30 max-w-2xl text-right">
              * Faixa visual criada pelo OrbitFire para registros com risco_fogo superior a 0,75, com base no campo disponibilizado no conjunto de dados.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
