"use client";

import { AlertTriangle, Layers3, MapPinned } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/landing/section-heading";
import { useInView } from "@/hooks/use-in-view";
import { useState, type RefObject } from "react";

const problemCards = [
  {
    icon: AlertTriangle,
    title: "Milhares de registros",
    text: "Analisar 3.141 detecções distribuídas pelo território dificulta reconhecer rapidamente padrões espaciais e priorizar o acompanhamento.",
  },
  {
    icon: Layers3,
    title: "Biomas sob pressão",
    text: "Cerrado, Amazônia, Caatinga e outros biomas exigem uma leitura territorial que vá além da observação de dados brutos.",
  },
  {
    icon: MapPinned,
    title: "Priorização operacional",
    text: "Equipes ambientais precisam identificar rapidamente onde estão concentrados os focos detectados e quais áreas merecem acompanhamento prioritário.",
  },
];

// Seeded PRNG (mulberry32) — determinístico para evitar hydration mismatch
function seededRandom(seed: number) {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

const dots = Array.from({ length: 65 }).map((_, i) => {
  const r1 = seededRandom(i * 7 + 1);
  const r2 = seededRandom(i * 7 + 2);
  const r3 = seededRandom(i * 7 + 3);
  const r4 = seededRandom(i * 7 + 4);
  const r5 = seededRandom(i * 7 + 5);
  const r6 = seededRandom(i * 7 + 6);

  const left = 25 + r1 * 75;
  const top = 8 + r2 * 84;
  return {
    id: i,
    top: `${top}%`,
    left: `${left}%`,
    size: r3 > 0.85 ? 4 : r3 > 0.5 ? 2.5 : 1.5,
    delay: r4 * 6,
    duration: 2 + r5 * 4,
    clusterId: left > 60 && top < 40 ? 1 : left > 40 && top > 50 ? 2 : 3,
    isMain: r6 > 0.88,
    // Pontos que terão halo permanente (8 pontos)
    hasHalo: r6 > 0.82,
    // Pontos que participam de conexões permanentes
    hasConnection: i % 8 === 0,
  };
});

// Hotspots permanentes com animação de anel (posições fixas para consistência SSR)
const hotspotRings = [
  { top: "32%", left: "68%", delay: 0, size: 20 },
  { top: "55%", left: "82%", delay: 1.5, size: 16 },
  { top: "45%", left: "55%", delay: 3, size: 24 },
  { top: "25%", left: "78%", delay: 4.5, size: 14 },
  { top: "70%", left: "65%", delay: 2, size: 18 },
  { top: "38%", left: "90%", delay: 5, size: 12 },
];

export function ProblemSection() {
  const { ref, isInView } = useInView({ rootMargin: "-14% 0px -14% 0px", threshold: 0.1 });
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <section
      className="relative border-t border-white/10 py-24 md:py-32 overflow-hidden bg-[#050505]"
      id="problema"
    >
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes orbitfire-scanner-sweep {
          0% { transform: translateX(-120%) skewX(-20deg); opacity: 0; }
          5% { opacity: 1; }
          95% { opacity: 1; }
          100% { transform: translateX(200vw) skewX(-20deg); opacity: 0; }
        }
        @keyframes orbitfire-pulse-organic {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        @keyframes orbitfire-reveal-silhouette {
          0%, 100% { opacity: 0.06; }
          40%, 60% { opacity: 0.25; }
        }
        @keyframes orbitfire-flow-down {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 0.4; }
          100% { transform: translateY(200%); opacity: 0; }
        }
        @keyframes orbitfire-ring-expand {
          0% { transform: scale(0.5); opacity: 0.6; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes orbitfire-flicker {
          0%, 100% { opacity: 0.15; }
          25% { opacity: 0.6; }
          50% { opacity: 0.3; }
          75% { opacity: 0.8; }
        }
        @keyframes orbitfire-connection-pulse {
          0%, 100% { opacity: 0.08; }
          50% { opacity: 0.35; }
        }
        @keyframes orbitfire-telemetry-blink {
          0%, 100% { opacity: 0.12; }
          50% { opacity: 0.4; }
        }
        @keyframes orbitfire-glow-drift {
          0% { transform: translate(0, 0); opacity: 0.12; }
          33% { transform: translate(3%, -2%); opacity: 0.18; }
          66% { transform: translate(-2%, 3%); opacity: 0.14; }
          100% { transform: translate(0, 0); opacity: 0.12; }
        }
        @media (prefers-reduced-motion: reduce) {
          .orbitfire-animated { animation: none !important; }
        }
      `}} />

      {/* ── Camada 1: Fundo com gradientes mais presentes ── */}
      <div className="absolute inset-0 z-0">
        {/* Gradiente principal laranja — mais forte */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_65%_45%,rgba(249,115,22,0.14),transparent_55%)]" />
        {/* Segundo glow menor, mais à direita */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_35%,rgba(251,146,60,0.08),transparent_40%)]" />
        {/* Glow vivo que se move sutilmente */}
        <div
          className="orbitfire-animated absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(249,115,22,0.1),transparent_50%)]"
          style={{ animation: "orbitfire-glow-drift 20s ease-in-out infinite" }}
        />
        {/* Vinheta escura nas bordas */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.7)_100%)]" />
      </div>

      {/* ── Camada 2: Grade geoespacial — mais visível ── */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-[2000ms] ${isInView ? "opacity-100" : "opacity-0"}`}>
        {/* Grade principal */}
        <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(249,115,22,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.4)_1px,transparent_1px)] [background-size:48px_48px]" />
        {/* Grade diagonal sutil */}
        <div className="absolute inset-0 opacity-[0.02] [background-image:linear-gradient(45deg,rgba(249,115,22,0.5)_1px,transparent_1px)] [background-size:68px_68px]" />

        {/* Telemetria decorativa — mais visível */}
        <div className="orbitfire-animated absolute top-[18%] right-[8%] hidden md:block font-mono text-[9px] text-orange-400/50" style={{ animation: "orbitfire-telemetry-blink 4s ease-in-out infinite" }}>
          <p>LAT: -15.79</p>
          <p>LON: -47.88</p>
          <p className="text-orange-300/60">● SCAN: ACTIVE</p>
        </div>
        <div className="orbitfire-animated absolute bottom-[28%] right-[22%] hidden md:block font-mono text-[9px] text-orange-300/40" style={{ animation: "orbitfire-telemetry-blink 5s ease-in-out infinite 1.5s" }}>
          <p>FRP: 142.7 MW</p>
          <p>VOL: HIGH</p>
        </div>
        <div className="orbitfire-animated absolute top-[65%] right-[15%] hidden md:block font-mono text-[8px] text-orange-500/30" style={{ animation: "orbitfire-telemetry-blink 6s ease-in-out infinite 3s" }}>
          <p>BIOMA: CER</p>
          <p>CONF: 82%</p>
        </div>
        <div className="orbitfire-animated absolute top-[75%] left-[45%] hidden md:block font-mono text-[8px] text-white/10" style={{ animation: "orbitfire-telemetry-blink 7s ease-in-out infinite 2s" }}>
          SYS.SEQ.001 ─ RECV
        </div>
        {/* Tracinhos técnicos decorativos */}
        <div className="absolute top-[30%] right-[5%] hidden md:block w-12 h-px bg-gradient-to-r from-orange-500/30 to-transparent" />
        <div className="absolute top-[50%] right-[3%] hidden md:block w-8 h-px bg-orange-400/20" />
        <div className="absolute top-[42%] right-[12%] hidden md:block w-px h-6 bg-orange-400/15" />
      </div>

      {/* ── Camada 3: Silhueta fantasma do Brasil — mais presente ── */}
      <div className="absolute inset-y-0 right-0 w-full md:w-[65%] z-0 pointer-events-none flex items-center justify-center">
         <svg
            aria-hidden="true"
            className={`orbitfire-animated h-[85%] max-h-[540px] w-auto transition-opacity duration-1000 ${hoveredCard === 1 ? "opacity-40" : "opacity-100"}`}
            viewBox="0 0 220 260"
            style={{ animation: "orbitfire-reveal-silhouette 10s ease-in-out infinite" }}
          >
            <path
              d="M78 12 L112 18 L138 32 L165 48 L180 75 L200 95 L208 120 L195 155 L175 190 L150 215 L125 240 L105 250 L85 240 L65 210 L50 180 L35 150 L25 110 L35 80 L55 50 Z"
              fill="rgba(249,115,22,0.03)"
              stroke="rgba(249,115,22,0.35)"
              strokeWidth="0.8"
              strokeDasharray="3 5"
            />
            {/* Preenchimento interno com grade pontilhada */}
            <pattern id="dotPattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.4" fill="rgba(249,115,22,0.2)" />
            </pattern>
            <path
              d="M78 12 L112 18 L138 32 L165 48 L180 75 L200 95 L208 120 L195 155 L175 190 L150 215 L125 240 L105 250 L85 240 L65 210 L50 180 L35 150 L25 110 L35 80 L55 50 Z"
              fill="url(#dotPattern)"
            />
          </svg>
      </div>

      {/* ── Camada 4: Campo de detecções, Varredura e Conexões ── */}
      <div className={`absolute inset-0 z-[1] overflow-hidden transition-opacity duration-[2000ms] ${isInView ? "opacity-100" : "opacity-0"}`}>

        {/* Scanner Sweep — muito mais visível */}
        <div
          className="orbitfire-animated absolute inset-y-0 w-48 pointer-events-none"
          style={{ animation: "orbitfire-scanner-sweep 6s linear infinite 2s" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-400/25 to-transparent blur-sm" />
          {/* Rastro de glow atrás do scanner */}
          <div className="absolute inset-y-0 -left-16 w-24 bg-gradient-to-r from-transparent to-orange-500/10 blur-lg" />
          {/* Linha central mais nítida */}
          <div className="absolute inset-y-0 left-1/2 w-px bg-orange-400/40 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
        </div>

        {/* Conexões permanentes entre pontos — linhas que pulsam */}
        <svg className="orbitfire-animated absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
          <line x1="68%" y1="32%" x2="82%" y2="55%" stroke="rgba(249,115,22,0.15)" strokeWidth="0.5" style={{ animation: "orbitfire-connection-pulse 5s ease-in-out infinite" }} />
          <line x1="55%" y1="45%" x2="65%" y2="70%" stroke="rgba(249,115,22,0.1)" strokeWidth="0.5" style={{ animation: "orbitfire-connection-pulse 6s ease-in-out infinite 1s" }} />
          <line x1="78%" y1="25%" x2="90%" y2="38%" stroke="rgba(249,115,22,0.12)" strokeWidth="0.5" style={{ animation: "orbitfire-connection-pulse 4s ease-in-out infinite 2s" }} />
          <line x1="60%" y1="58%" x2="75%" y2="42%" stroke="rgba(249,115,22,0.08)" strokeWidth="0.5" style={{ animation: "orbitfire-connection-pulse 7s ease-in-out infinite 0.5s" }} />
          <line x1="85%" y1="60%" x2="72%" y2="75%" stroke="rgba(249,115,22,0.1)" strokeWidth="0.5" style={{ animation: "orbitfire-connection-pulse 5.5s ease-in-out infinite 3s" }} />
        </svg>

        {/* Hotspot rings permanentes — anéis de detecção pulsando continuamente */}
        {hotspotRings.map((ring, i) => (
          <div
            key={i}
            className="orbitfire-animated absolute pointer-events-none"
            style={{ top: ring.top, left: ring.left }}
          >
            <span
              className="absolute rounded-full border border-orange-400/30"
              style={{
                width: ring.size,
                height: ring.size,
                marginLeft: -ring.size / 2,
                marginTop: -ring.size / 2,
                animation: `orbitfire-ring-expand ${3 + i * 0.5}s ease-out infinite ${ring.delay}s`,
              }}
            />
            <span
              className="absolute rounded-full border border-orange-500/20"
              style={{
                width: ring.size * 0.7,
                height: ring.size * 0.7,
                marginLeft: -(ring.size * 0.7) / 2,
                marginTop: -(ring.size * 0.7) / 2,
                animation: `orbitfire-ring-expand ${3 + i * 0.5}s ease-out infinite ${ring.delay + 0.8}s`,
              }}
            />
            {/* Ponto central permanente */}
            <span className="absolute h-1.5 w-1.5 -ml-[3px] -mt-[3px] rounded-full bg-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
          </div>
        ))}

        {/* Pontos de detecção — mais brilhantes e vivos */}
        <div className="absolute inset-0 pointer-events-none">
          {dots.map((dot) => {
            let isActive = false;
            let isDimmed = false;

            if (hoveredCard === 0) {
              isActive = dot.id % 2 === 0;
            } else if (hoveredCard === 1) {
              isActive = dot.clusterId === 1 || dot.clusterId === 2;
              isDimmed = dot.clusterId === 3;
            } else if (hoveredCard === 2) {
              isActive = dot.isMain;
              isDimmed = !dot.isMain;
            }

            return (
              <span
                key={dot.id}
                className={`orbitfire-animated absolute rounded-full transition-all duration-700 ease-out
                  ${isActive
                    ? "bg-orange-400 shadow-[0_0_20px_rgba(249,115,22,1)] scale-[2] opacity-100"
                    : isDimmed
                      ? "bg-orange-500/15 opacity-[0.06] scale-75"
                      : "bg-orange-400/70 shadow-[0_0_6px_rgba(249,115,22,0.5)]"}
                `}
                style={{
                  top: dot.top,
                  left: dot.left,
                  width: `${dot.size}px`,
                  height: `${dot.size}px`,
                  animation: !isActive && !isDimmed
                    ? `orbitfire-pulse-organic ${dot.duration}s ease-in-out infinite ${dot.delay}s`
                    : "none",
                }}
              >
                {/* Halo permanente em alguns pontos */}
                {dot.hasHalo && !isDimmed && (
                  <span
                    className="orbitfire-animated absolute -inset-2 rounded-full bg-orange-500/20"
                    style={{ animation: `orbitfire-ring-expand ${dot.duration + 1}s ease-out infinite ${dot.delay}s` }}
                  />
                )}
                {/* Halos extras no hover do card 03 (Priorização) */}
                {hoveredCard === 2 && dot.isMain && (
                  <>
                    <span className="absolute -inset-4 rounded-full border border-orange-400/60 animate-ping [animation-duration:1.5s]" />
                    <span className="absolute -inset-6 rounded-full border border-orange-400/30 animate-ping [animation-duration:2.5s]" />
                  </>
                )}
                {/* Conexões efêmeras no hover do card 01 (Volume) */}
                {hoveredCard === 0 && dot.id % 4 === 0 && (
                  <span className="absolute top-1/2 left-1/2 w-20 h-px bg-gradient-to-r from-orange-400/50 to-transparent origin-left" style={{ transform: `rotate(${(dot.id * 37) % 360}deg)` }} />
                )}
                {/* Flicker em pontos menores no hover do card 01 */}
                {hoveredCard === 0 && dot.id % 3 === 0 && (
                  <span
                    className="absolute inset-0 rounded-full bg-orange-300"
                    style={{ animation: `orbitfire-flicker ${0.5 + (dot.id % 4) * 0.3}s ease-in-out infinite ${dot.id * 0.1}s` }}
                  />
                )}
              </span>
            );
          })}
        </div>

        {/* Transição para a próxima seção: Linhas descendo */}
        <div className="absolute bottom-0 left-[15%] right-[15%] h-40 flex justify-between opacity-30">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="orbitfire-animated w-px h-full bg-gradient-to-b from-transparent via-orange-500 to-transparent"
              style={{ animation: `orbitfire-flow-down ${2.5 + i * 0.3}s linear infinite ${i * 0.4}s` }}
            />
          ))}
        </div>
      </div>

      {/* ── Conteúdo ── */}
      <Container className="relative z-10">
        <div
          ref={ref as RefObject<HTMLDivElement>}
          className={`grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center transition-all duration-1000 ${isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="pt-8">
            <SectionHeading
              eyebrow="Problema"
              title={
                <>
                  Dados espaciais existem. O desafio é transformá-los em decisão.
                </>
              }
              text="Satélites identificam focos de fogo em grandes áreas do território brasileiro. Porém, analisar milhares de detecções distribuídas pelo território dificulta reconhecer rapidamente concentrações relevantes, biomas expostos e condições ambientais associadas aos registros."
            />
          </div>

          <div className="grid gap-4">
            {problemCards.map((card, index) => {
              const Icon = card.icon;

              return (
                <article
                  className={`group relative overflow-hidden rounded-lg border border-white/[0.06] bg-[#080808]/80 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-lg transition-all duration-700 hover:-translate-y-1 hover:border-orange-500/40 hover:bg-[#0c0c0c]/90 hover:shadow-[0_24px_90px_rgba(249,115,22,0.15)] ${isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                  style={{ transitionDelay: `${index * 150 + 200}ms` }}
                  key={card.title}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* scanning line on hover */}
                  <div className="absolute inset-x-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-orange-400 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:[animation:orbitfire-scan_2s_linear_infinite]" />
                  <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-orange-400/40 to-transparent opacity-0 transition group-hover:opacity-100" />
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.02] text-orange-300 transition-all duration-300 group-hover:shadow-[0_0_28px_rgba(249,115,22,0.3)] group-hover:bg-orange-500/10">
                      <Icon aria-hidden="true" size={19} className="transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <div>
                      <p className="font-mono text-xs text-white/30 transition-colors duration-300 group-hover:text-orange-300/80">
                        0{index + 1}
                      </p>
                      <h3 className="mt-2 text-xl font-medium tracking-tight text-white/90 group-hover:text-white">
                        {card.title}
                      </h3>
                      <p className="mt-2 max-w-2xl text-sm leading-7 text-white/50 group-hover:text-white/60">
                        {card.text}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
