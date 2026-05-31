"use client";

import {
  BarChart3,
  Bell,
  Filter,
  Flame,
  Home,
  MapPinned,
  Radar,
  Satellite,
  Search,
  Sun,
} from "lucide-react";
import { useState } from "react";
import type { MouseEvent, ReactNode } from "react";

type DashboardPreviewVariant = "hero" | "solution";

const stateBars = [
  { label: "TO", value: "1.184", width: "96%" },
  { label: "MT", value: "524", width: "52%" },
  { label: "MA", value: "441", width: "44%" },
  { label: "BA", value: "264", width: "28%" },
];

const heroCards = [
  { icon: Flame, label: "Focos detectados", value: "3.141", detail: "29/05/2026" },
  { icon: MapPinned, label: "Coordenadas", value: "2.743", detail: "distintas" },
  { icon: Radar, label: "Risco muito alto", value: "1.991", detail: "risco_fogo > 0,75" },
  { icon: Sun, label: "Média sem chuva", value: "13,5", detail: "dias" },
];

const mapPoints = [
  { x: "58%", y: "39%", size: "h-1.5 w-1.5", delay: "0ms" },
  { x: "61%", y: "42%", size: "h-1.5 w-1.5", delay: "360ms" },
  { x: "56%", y: "45%", size: "h-1.5 w-1.5", delay: "720ms" },
  { x: "52%", y: "52%", size: "h-1 w-1", delay: "1080ms" },
  { x: "63%", y: "55%", size: "h-1 w-1", delay: "1440ms" },
  { x: "48%", y: "61%", size: "h-1 w-1", delay: "1800ms" },
  { x: "67%", y: "50%", size: "h-1 w-1", delay: "2100ms" },
  { x: "45%", y: "44%", size: "h-1 w-1", delay: "900ms" },
  { x: "71%", y: "47%", size: "h-1 w-1", delay: "1200ms" },
  { x: "42%", y: "69%", size: "h-1 w-1", delay: "1700ms" },
];

const chips = ["Bioma", "Estado", "Satélite", "Risco"];

export function DashboardPreview({ variant }: { variant: DashboardPreviewVariant }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const isHero = variant === "hero";

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * (isHero ? 5 : 8);
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * (isHero ? -5 : -8);
    setTilt({ x, y });
  }

  return (
    <div
      className={`group relative ${isHero ? "lg:-rotate-2" : ""}`}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      onMouseMove={handleMouseMove}
      style={{
        transform: `perspective(1200px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
        transition: "transform 420ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {isHero ? <HeroDashboardPreview /> : <SolutionDashboardPreview />}
    </div>
  );
}

function HeroDashboardPreview() {
  return (
    <div className="orbitfire-hero-orbital-frame relative rounded-lg p-px shadow-[0_34px_120px_rgba(0,0,0,0.76)] transition duration-700 group-hover:scale-[1.01]">
      <span className="orbitfire-frame-corner orbitfire-frame-corner-tl" />
      <span className="orbitfire-frame-corner orbitfire-frame-corner-tr" />
      <span className="orbitfire-frame-corner orbitfire-frame-corner-bl" />
      <span className="orbitfire-frame-corner orbitfire-frame-corner-br" />
      <span aria-hidden="true" className="orbitfire-frame-runner">
        <span className="orbitfire-frame-runner-top" />
        <span className="orbitfire-frame-runner-right" />
        <span className="orbitfire-frame-runner-bottom" />
        <span className="orbitfire-frame-runner-left" />
      </span>
      <div className="absolute -inset-8 -z-10 rounded-[2rem] bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.25),transparent_68%)] blur-3xl" />
      <div className="absolute inset-0 overflow-hidden rounded-lg opacity-0 transition duration-500 group-hover:opacity-20">
        <div className="absolute -inset-full animate-[orbitfire-border-spin_5s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_76deg,rgba(251,191,36,0.72)_145deg,rgba(249,115,22,0.92)_184deg,transparent_258deg,transparent_360deg)]" />
      </div>

      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-[#070707] p-2 backdrop-blur-xl">
        <span className="orbitfire-preview-sweep" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:42px_42px]" />
        <div className="relative grid min-h-[430px] grid-cols-[72px_1fr] overflow-hidden rounded-md border border-white/10 bg-[#050505] lg:min-h-[470px]">
          <aside className="border-r border-white/10 bg-black/42 p-3">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full border border-orange-300/25 bg-orange-500/10 text-orange-300">
                <Radar size={16} />
              </span>
              <span className="hidden text-xs font-semibold text-white/80 xl:inline">
                Orbit<span className="text-orange-400">Fire</span>
              </span>
            </div>
            <div className="mt-10 space-y-3">
              {["Visão", "Mapa", "Risco", "Orbital"].map((item, index) => (
                <span
                  className={`flex h-8 items-center rounded-md border px-2 text-[9px] font-bold uppercase tracking-[0.14em] ${
                    index === 0
                      ? "border-orange-300/20 bg-orange-500/18 text-orange-200"
                      : "border-transparent text-white/28"
                  }`}
                  key={item}
                >
                  {item}
                </span>
              ))}
            </div>
          </aside>

          <div className="relative min-w-0 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-medium tracking-tight text-white">Visão Geral</h3>
                <p className="mt-1 text-[11px] text-white/46">
                  Focos detectados por satélite em território brasileiro
                </p>
              </div>
              <div className="flex items-center gap-2">
                <MiniBadge icon={<Home size={11} />} label="Início" />
                <MiniBadge label="INPE" active />
                <MiniBadge label="29/05/2026" />
                <span className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.035] text-white/44">
                  <Bell size={13} />
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.025] p-3">
              <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2">
                {["Estado", "Município", "Bioma", "Satélite"].map((filter) => (
                  <div className="rounded-md border border-white/10 bg-[#0b0b0b] px-3 py-2" key={filter}>
                    <p className="text-[8px] text-white/42">{filter}</p>
                    <p className="mt-1 truncate text-[10px] font-semibold text-white/74">Todos</p>
                  </div>
                ))}
                <div className="flex items-center gap-2 rounded-md border border-white/10 bg-[#0b0b0b] px-3 text-[10px] font-semibold text-white/55">
                  <Search size={11} />
                  Buscar
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-3">
              {heroCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <div
                    className="rounded-lg border border-white/10 bg-white/[0.035] p-3 [animation:orbitfire-chip-reveal_480ms_ease-out_both]"
                    key={card.label}
                    style={{ animationDelay: `${index * 90}ms` }}
                  >
                    <Icon className="text-orange-300" size={15} />
                    <p className="mt-2 text-[9px] font-semibold text-white/44">{card.label}</p>
                    <strong className="mt-1 block text-xl font-medium text-white">{card.value}</strong>
                    <p className="text-[9px] text-white/34">{card.detail}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 grid min-h-[230px] grid-cols-[1fr_190px] gap-3">
              <div className="relative overflow-hidden rounded-lg border border-white/10 bg-[#070707]">
                <div className="absolute left-3 top-3 z-10 flex overflow-hidden rounded-md border border-white/10 bg-black/70 p-1 text-[9px] font-bold">
                  <span className="rounded bg-orange-500/22 px-3 py-1.5 text-orange-100">Concentração</span>
                  <span className="px-3 py-1.5 text-white/42">Risco</span>
                  <span className="px-3 py-1.5 text-white/42">FRP</span>
                </div>
                <MiniBrazilMap dense />
                <div className="absolute bottom-3 left-3 rounded-md border border-white/10 bg-black/65 px-3 py-2 text-[10px] text-white/55 backdrop-blur-md">
                  <p className="font-semibold text-white/80">Concentração</p>
                  <p className="mt-1 max-w-[150px]">Detecções registradas no período.</p>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="rounded-lg border border-orange-300/18 bg-orange-500/8 p-3">
                  <p className="font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-orange-300">
                    Área em destaque
                  </p>
                  <h4 className="mt-2 text-sm font-semibold text-white">Ponte Alta do Tocantins</h4>
                  <p className="text-[10px] text-white/46">Tocantins • Cerrado</p>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <MiniStat value="243" label="det." />
                    <MiniStat value="117" label="pts." />
                    <MiniStat value="0,91" label="risco" />
                  </div>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/[0.025] p-3">
                  <p className="font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-orange-300">
                    Ranking rápido
                  </p>
                  {["Ponte Alta", "Natividade", "Balsas", "Lagoa Confusão"].map((item, index) => (
                    <div className="mt-2 grid grid-cols-[18px_1fr_30px] text-[10px]" key={item}>
                      <span className="text-orange-300">0{index + 1}</span>
                      <span className="truncate text-white/58">{item}</span>
                      <span className="text-right text-orange-200">{[243, 173, 158, 136][index]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SolutionDashboardPreview() {
  return (
    <div className="relative rounded-lg p-px shadow-[0_32px_120px_rgba(0,0,0,0.72)] transition duration-700 group-hover:scale-[1.012]">
      <div className="absolute -inset-8 -z-10 rounded-[2rem] bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.22),transparent_66%)] blur-3xl" />
      <div className="absolute inset-0 overflow-hidden rounded-lg opacity-0 transition duration-500 group-hover:opacity-20">
        <div className="absolute -inset-full animate-[orbitfire-border-spin_5s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_76deg,rgba(251,191,36,0.72)_145deg,rgba(249,115,22,0.92)_184deg,transparent_258deg,transparent_360deg)]" />
      </div>

      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-[#080706]/92 p-3 backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_62%_18%,rgba(249,115,22,0.13),transparent_54%)]" />
        <div className="relative overflow-hidden rounded-md border border-white/10 bg-[#050505]">
          <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.035] px-4 py-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-orange-300">
                Painel Orbital
              </p>
              <p className="mt-1 text-xs font-medium text-white/58">
                Monitoramento espacial INPE
              </p>
            </div>
            <MiniBadge label="29/05/2026" active />
          </div>

          <div className="grid min-h-[500px] gap-0 lg:grid-cols-[1fr_220px]">
            <MiniBrazilMap />
            <div className="grid gap-3 border-t border-white/10 p-3 lg:border-l lg:border-t-0">
              <SolutionControls />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniBrazilMap({ dense = false }: { dense?: boolean }) {
  return (
    <div className="relative min-h-[260px] overflow-hidden bg-[radial-gradient(ellipse_at_55%_46%,rgba(249,115,22,0.14),transparent_48%)]">
      <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:34px_34px]" />
      <div className="absolute -left-1/3 top-0 h-32 w-[160%] rotate-[28deg] bg-gradient-to-r from-transparent via-orange-200/18 to-transparent blur-sm [animation:orbitfire-preview-scan_4.8s_ease-in-out_infinite]" />
      <div className="absolute inset-5 flex items-center justify-center">
        <div className={`relative aspect-[0.88] ${dense ? "w-[64%]" : "w-[72%]"} max-w-[360px]`}>
          <svg
            aria-hidden="true"
            className="absolute inset-0 h-full w-full drop-shadow-[0_0_32px_rgba(249,115,22,0.17)]"
            viewBox="0 0 240 280"
          >
            <path
              d="M95 11 126 18 150 35 169 41 184 58 206 66 218 91 208 119 220 145 203 175 186 198 169 214 150 235 126 267 101 249 87 220 66 205 49 179 30 160 38 132 27 105 43 78 67 62 74 35Z"
              fill="rgba(249,115,22,0.08)"
              stroke="rgba(255,255,255,0.24)"
              strokeWidth="1.5"
            />
            <path d="M74 64 101 78 127 72 152 86 171 111 159 139 180 162 156 190 128 200 104 233 86 204 63 187 56 153 43 126 51 96Z" fill="none" stroke="rgba(255,255,255,0.11)" strokeWidth="1" />
            <path d="M101 78 105 118 93 153 104 197" fill="none" stroke="rgba(251,191,36,0.18)" strokeDasharray="4 7" strokeWidth="1" />
            <path d="M127 72 128 113 159 139" fill="none" stroke="rgba(251,191,36,0.16)" strokeDasharray="4 7" strokeWidth="1" />
            <path d="M74 64 86 111 63 187" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="1" />
          </svg>

          <span className="absolute left-[55%] top-[37%] h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/20 blur-xl" />
          <span className="absolute left-[55%] top-[37%] h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-orange-300/30 [animation:orbitfire-detection-halo_2.4s_ease-out_infinite]" />
          {mapPoints.map((point) => (
            <span
              className={`animate-orbitfire-pulse-point absolute rounded-full bg-orange-400 shadow-[0_0_18px_rgba(249,115,22,0.95)] ${point.size}`}
              key={`${point.x}-${point.y}`}
              style={{ animationDelay: point.delay, left: point.x, top: point.y }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniBadge({
  active,
  icon,
  label,
}: {
  active?: boolean;
  icon?: ReactNode;
  label: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[10px] font-semibold ${
        active
          ? "border-orange-300/20 bg-orange-500/14 text-orange-200"
          : "border-white/10 bg-white/[0.035] text-white/46"
      }`}
    >
      {icon}
      {label}
    </span>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <strong className="block text-sm font-medium text-orange-100">{value}</strong>
      <span className="text-[8px] text-white/38">{label}</span>
    </div>
  );
}

function SolutionControls() {
  return (
    <div className="grid h-full gap-3">
      <div className="rounded-md border border-white/10 bg-white/[0.04] p-4">
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-300">
          <BarChart3 size={13} />
          Estados
        </p>
        <div className="mt-4 space-y-3">
          {stateBars.map((bar, index) => (
            <div className="grid grid-cols-[30px_1fr_42px] items-center gap-2" key={bar.label}>
              <span className="font-mono text-xs text-white/50">{bar.label}</span>
              <span className="h-2 overflow-hidden rounded-full bg-white/10">
                <span
                  className="block h-full origin-left rounded-full bg-gradient-to-r from-orange-600 via-orange-400 to-amber-200 [animation:orbitfire-bar-fill_950ms_cubic-bezier(0.16,1,0.3,1)_both]"
                  style={{ animationDelay: `${index * 140}ms`, width: bar.width }}
                />
              </span>
              <span className="text-right font-mono text-[11px] text-orange-200">{bar.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-white/10 bg-white/[0.04] p-4">
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/42">
          <Filter size={13} />
          Filtros
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {chips.map((chip, index) => (
            <span
              className="rounded-full border border-white/10 bg-black/45 px-3 py-1.5 text-xs font-semibold text-white/62 [animation:orbitfire-chip-reveal_460ms_ease-out_both] even:border-orange-300/20 even:bg-orange-500/10 even:text-orange-200"
              key={chip}
              style={{ animationDelay: `${360 + index * 120}ms` }}
            >
              {chip}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-orange-300/18 bg-orange-500/8 p-4">
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-300">
          <Satellite size={13} />
          Área prioritária
        </p>
        <p className="mt-3 text-sm font-semibold text-white">Ponte Alta do Tocantins</p>
        <p className="mt-1 text-xs text-white/45">243 detecções • Cerrado</p>
      </div>
    </div>
  );
}
