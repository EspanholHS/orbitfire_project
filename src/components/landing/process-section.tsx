"use client";

import { Activity, RadioTower, Satellite } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/landing/section-heading";
import { useInView } from "@/hooks/use-in-view";
import { useState, useEffect } from "react";

const steps = [
  {
    icon: Satellite,
    label: "Etapa 1",
    title: "Detecção espacial",
    text: "O INPE disponibiliza dados de focos de fogo identificados por satélites em território brasileiro.",
  },
  {
    icon: Activity,
    label: "Etapa 2",
    title: "Organização e análise",
    text: "O OrbitFire consome uma API própria desenvolvida pela equipe, que organiza localização, bioma, risco de fogo, dias sem chuva, precipitação e potência radiativa observada.",
  },
  {
    icon: RadioTower,
    label: "Etapa 3",
    title: "Monitoramento visual",
    text: "O usuário acessa mapas, indicadores, rankings e detalhes de cada foco detectado para identificar áreas prioritárias de acompanhamento.",
  },
];

export function ProcessSection() {
  const { ref, isInView } = useInView({ threshold: 0.1 });
  const [activeStep, setActiveStep] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isInView || isHovered) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isInView, isHovered]);

  return (
    <section
      className="relative border-y border-white/10 py-24 md:py-32"
      id="como-funciona"
      ref={ref}
    >
      <Container>
        <SectionHeading
          align="center"
          eyebrow="Como funciona"
          title="Da detecção por satélite ao acompanhamento territorial"
        />

        <div 
          className={`relative mt-16 grid gap-5 lg:grid-cols-3 transition-all duration-1000 ${isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Animated line connecting steps */}
          <div className="pointer-events-none absolute left-[15%] right-[15%] top-12 hidden h-px lg:block overflow-visible z-0">
             <div className="absolute inset-0 bg-white/5" />
             <div 
                className="absolute top-0 h-full bg-gradient-to-r from-transparent via-orange-400 to-transparent transition-all duration-1000 ease-in-out" 
                style={{ 
                  left: `${(activeStep / (steps.length - 1)) * 100}%`,
                  width: '30%',
                  transform: 'translateX(-50%)',
                  opacity: isInView ? 1 : 0
                }} 
             />
             <div 
                className="absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 -translate-x-1/2 rounded-full bg-orange-400 shadow-[0_0_10px_rgba(249,115,22,1)] transition-all duration-1000 ease-in-out z-10"
                style={{ left: `${(activeStep / (steps.length - 1)) * 100}%` }}
             />
          </div>
          {steps.map((step, idx) => {
            const Icon = step.icon;

            return (
              <article
                className={`group relative rounded-lg border bg-black/52 p-6 shadow-[0_28px_90px_rgba(0,0,0,0.46)] backdrop-blur-xl transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_32px_100px_rgba(249,115,22,0.15)] hover:border-orange-500/50 ${isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${activeStep === idx ? "border-orange-500/40" : "border-white/10"}`}
                style={{ transitionDelay: `${idx * 200 + 100}ms` }}
                key={step.label}
                onMouseEnter={() => setActiveStep(idx)}
              >
                {/* Glow effect on hover or active */}
                <div className={`absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/0 transition-colors duration-500 rounded-lg group-hover:from-orange-500/10 group-hover:to-transparent ${activeStep === idx ? "from-orange-500/5" : ""}`} />
                
                <div className={`relative flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-500 group-hover:bg-orange-500/20 group-hover:text-orange-300 group-hover:shadow-[0_0_36px_rgba(249,115,22,0.4)] ${isInView ? "opacity-100 scale-100" : "opacity-0 scale-50"} ${activeStep === idx ? "border-orange-400/40 bg-orange-500/15 text-orange-300 shadow-[0_0_30px_rgba(249,115,22,0.3)]" : "border-orange-300/20 bg-orange-500/5 text-orange-200/70 shadow-[0_0_26px_rgba(249,115,22,0.1)]"}`} style={{ transitionDelay: `${idx * 200 + 400}ms` }}>
                  {/* Thematic icon animations */}
                  {idx === 0 && activeStep === 0 && (
                    <span className="absolute inset-0 rounded-full animate-ping bg-orange-400/30" style={{ animationDuration: '2s' }} />
                  )}
                  {idx === 1 && activeStep === 1 && (
                    <span className="absolute inset-0 rounded-full bg-orange-500/20 animate-pulse" />
                  )}
                  {idx === 2 && activeStep === 2 && (
                    <span className="absolute inset-0 rounded-full overflow-hidden">
                      <span className="absolute top-1/2 left-1/2 w-full h-full bg-gradient-to-tr from-transparent via-orange-400/40 to-transparent origin-top-left animate-[orbitfire-spin-slow_2s_linear_infinite]" />
                    </span>
                  )}
                  
                  <Icon aria-hidden="true" size={21} className={`relative z-10 transition-transform duration-300 group-hover:scale-110 ${activeStep === idx && idx === 1 ? 'animate-bounce [animation-duration:2s]' : ''}`} />
                </div>
                <p className={`mt-8 text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-300 group-hover:text-orange-400 ${activeStep === idx ? "text-orange-400" : "text-orange-300/50"}`}>
                  {step.label}
                </p>
                <h3 className={`mt-3 text-2xl font-medium tracking-tight transition-colors duration-300 group-hover:text-orange-50 ${activeStep === idx ? "text-white" : "text-white/80"}`}>
                  {step.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-white/56">{step.text}</p>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
