"use client";

import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import { riskColors, riskLabels, riskOrder } from "@/lib/fire-filters";
import { formatDecimal, formatInteger } from "@/lib/fire-metrics";
import type { MunicipalityAggregate, VisualRiskLevel } from "@/types/fire-focus";

type ScatterMode = "priority" | "environment";

function updateSpotlight(event: MouseEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
  event.currentTarget.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
}

export function Panel({
  children,
  className = "",
  title,
  action,
}: {
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  title: string;
}) {
  return (
    <section
      className={`orbitfire-panel-live orbitfire-resonance rounded-lg border border-white/10 bg-[#0b0b0b]/82 p-4 shadow-[0_20px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl ${className}`}
      onMouseMove={updateSpotlight}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-orange-300">
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}

export function HorizontalBarChart({
  activeLabels = [],
  data,
  dimInactive = false,
  maxLabel = "",
  onClick,
}: {
  activeLabels?: string[];
  data: Array<{ label: string; count: number; sublabel?: string }>;
  dimInactive?: boolean;
  maxLabel?: string;
  onClick?: (label: string) => void;
}) {
  const max = Math.max(...data.map((item) => item.count), 1);
  const activeSet = new Set(activeLabels);

  return (
    <div className="space-y-3">
      {data.map((item, index) => {
        const active = activeSet.has(item.label);
        return (
        <button
          className={`orbitfire-chart-row grid w-full grid-cols-[minmax(92px,0.5fr)_1fr_54px] items-center gap-3 text-left text-xs text-white/62 ${
            active ? "orbitfire-chart-row-active" : dimInactive ? "orbitfire-chart-row-dim" : ""
          }`}
          key={`${item.label}-${item.sublabel ?? ""}`}
          onClick={() => onClick?.(item.label)}
          type="button"
          style={{ "--row-delay": `${index * 70}ms` } as CSSProperties}
        >
          <span className="truncate">
            {item.label}
            {item.sublabel ? <span className="text-white/32"> {item.sublabel}</span> : null}
          </span>
          <span className="h-3 overflow-hidden rounded-full bg-white/[0.06]">
            <span
              className="orbitfire-chart-bar block h-full origin-left rounded-full bg-gradient-to-r from-orange-600 to-orange-300 shadow-[0_0_14px_rgba(249,115,22,0.28)]"
              style={{ width: `${(item.count / max) * 100}%` }}
            />
          </span>
          <span className="text-right text-white/78">{formatInteger(item.count)}</span>
        </button>
        );
      })}
      {maxLabel ? <p className="pt-2 text-right text-[10px] text-white/28">{maxLabel}</p> : null}
    </div>
  );
}

export function DonutChart({
  data,
  total,
}: {
  data: Array<{ label: string; count: number; color?: string }>;
  total: number;
}) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const segments = data.reduce<{
    current: number;
    items: Array<{
      color: string;
      dash: number;
      label: string;
      offset: number;
    }>;
  }>(
    (acc, item, index) => {
      const share = total ? item.count / total : 0;
      return {
        current: acc.current + share,
        items: [
          ...acc.items,
          {
            color: item.color ?? chartColors[index % chartColors.length],
            dash: share * circumference,
            label: item.label,
            offset: -acc.current * circumference,
          },
        ],
      };
    },
    { current: 0, items: [] },
  ).items;

  return (
    <div className="grid items-center gap-5 md:grid-cols-[150px_1fr]">
      <div className="relative mx-auto h-36 w-36">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" fill="none" r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
          {segments.map((segment, index) => (
            <circle
              className="orbitfire-donut-segment"
              cx="50"
              cy="50"
              fill="none"
              key={segment.label}
              r={radius}
              stroke={segment.color}
              strokeDasharray={`${segment.dash} ${circumference - segment.dash}`}
              strokeDashoffset={segment.offset}
              strokeLinecap="butt"
              strokeWidth="12"
              style={{ "--segment-delay": `${index * 110}ms` } as CSSProperties}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <strong className="text-xl font-medium text-white">{formatInteger(total)}</strong>
          <span className="text-[10px] text-white/42">detecções</span>
        </div>
      </div>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div className="flex items-center justify-between gap-3 text-xs" key={item.label}>
            <span className="flex items-center gap-2 text-white/62">
              <span
                className="h-3 w-3 rounded-sm"
                style={{ background: item.color ?? chartColors[index % chartColors.length] }}
              />
              {item.label}
            </span>
            <span className="text-white/72">
              {formatInteger(item.count)} ({formatDecimal(total ? (item.count / total) * 100 : 0, 1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RiskBarChart({
  data,
  onClick,
}: {
  data: Array<{ key: VisualRiskLevel; label: string; count: number }>;
  onClick?: (risk: VisualRiskLevel) => void;
}) {
  const max = Math.max(...data.map((item) => item.count), 1);

  return (
    <div className="flex h-44 items-end gap-3">
      {data.map((item, index) => (
        <button
          className="group flex flex-1 flex-col items-center justify-end gap-2 text-center"
          key={item.key}
          onClick={() => onClick?.(item.key)}
          type="button"
        >
          <span className="text-xs text-white/72">{formatInteger(item.count)}</span>
          <span className="relative flex h-28 w-full max-w-12 items-end border-b border-white/10">
            <span
              className="orbitfire-risk-bar block w-full origin-bottom rounded-t-sm transition duration-500 group-hover:brightness-125"
              style={{
                background: riskColors[item.key],
                boxShadow: `0 0 18px ${riskColors[item.key]}55`,
                height: `${Math.max((item.count / max) * 100, 4)}%`,
                animationDelay: `${index * 90}ms`,
              }}
            />
          </span>
          <span className="text-[10px] leading-3 text-white/52">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

export function TimelineChart({
  activeHour,
  data,
  onHourSelect,
  playbackHour,
  playbackState = "idle",
}: {
  activeHour: number | null;
  data: Array<{ hour: number; count: number }>;
  onHourSelect: (hour: number | null) => void;
  playbackHour?: number | null;
  playbackState?: "idle" | "playing" | "paused" | "complete";
}) {
  const normalized = Array.from({ length: 24 }, (_, hour) => ({
    count: data.find((item) => item.hour === hour)?.count ?? 0,
    hour,
  }));
  const max = Math.max(...normalized.map((item) => item.count), 1);

  return (
    <div>
      <div className="relative rounded-lg border border-white/10 bg-black/24 px-3 pb-8 pt-5">
        {playbackHour !== null && playbackHour !== undefined ? (
          <span
            className="pointer-events-none absolute bottom-8 top-5 z-20 w-px bg-orange-200 shadow-[0_0_16px_rgba(251,191,36,0.72)]"
            style={{ left: `calc(0.75rem + ${(playbackHour / 23) * 100}%)` }}
          />
        ) : null}
        <div className="pointer-events-none absolute inset-x-3 bottom-8 top-5 grid grid-rows-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <span className="border-t border-white/[0.045]" key={index} />
          ))}
        </div>
        <div className="relative flex h-36 items-end gap-1">
          {normalized.map((item, index) => (
            <button
              className="group flex h-full flex-1 items-end rounded-sm"
              key={item.hour}
              onClick={() => onHourSelect(activeHour === item.hour ? null : item.hour)}
              title={`${String(item.hour).padStart(2, "0")}:00 GMT • ${item.count} detecções`}
              type="button"
            >
              <span
                className={`orbitfire-timeline-bar block w-full rounded-t-sm transition ${
                  activeHour === item.hour
                    ? "bg-amber-200 shadow-[0_0_16px_rgba(251,191,36,0.45)]"
                    : playbackHour !== null && playbackHour !== undefined && item.hour <= playbackHour
                      ? "bg-orange-400 shadow-[0_0_14px_rgba(251,146,60,0.45)]"
                    : item.count
                      ? "bg-orange-600/85 group-hover:bg-orange-400"
                      : "bg-white/[0.08]"
                }`}
                style={{
                  animationDelay: `${index * 28}ms`,
                  height: item.count ? `${Math.max((item.count / max) * 100, 5)}%` : "3%",
                  opacity:
                    playbackState !== "idle" && playbackHour !== null && playbackHour !== undefined
                      ? item.hour <= playbackHour
                        ? 1
                        : 0.24
                      : undefined,
                }}
              />
            </button>
          ))}
        </div>
        <div className="absolute bottom-2 left-3 right-3 flex justify-between font-mono text-[10px] text-white/38">
          <span>00:00 GMT</span>
          <span>04:00</span>
          <span>08:00</span>
          <span>12:00</span>
          <span>16:00</span>
          <span>20:00</span>
          <span>23:59 GMT</span>
        </div>
      </div>
    </div>
  );
}

export function ScatterPlot({
  data,
  mode = "priority",
  onSelect,
}: {
  data: MunicipalityAggregate[];
  mode?: ScatterMode;
  onSelect: (municipality: MunicipalityAggregate) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const [hovered, setHovered] = useState<{
    item: MunicipalityAggregate;
    x: number;
    y: number;
  } | null>(null);

  const ordered = useMemo(
    () =>
      [...data].sort((a, b) =>
        mode === "environment"
          ? b.count - a.count || (b.averageRisk ?? 0) - (a.averageRisk ?? 0)
          : b.orbitFireScore - a.orbitFireScore || b.count - a.count,
      ),
    [data, mode],
  );
  const sample = showAll ? ordered : ordered.slice(0, 30);
  const maxCount = Math.max(...ordered.map((item) => item.count), 1);
  const maxDry = Math.max(...ordered.map((item) => item.averageDryDays ?? 0), 1);
  const maxFrp = Math.max(...ordered.map((item) => item.maxFrp ?? 0), 1);
  const topIds = new Set(ordered.slice(0, 5).map((item) => item.id));

  return (
    <div>
      <div className="relative h-80 rounded-lg border border-white/10 bg-black/28 p-5">
        <div className="absolute inset-x-10 bottom-10 top-6 border-b border-l border-white/12" />
        <div className="pointer-events-none absolute inset-x-10 bottom-10 top-6 grid grid-rows-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <span className="border-t border-white/[0.04]" key={index} />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-x-10 bottom-10 top-6 grid grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <span className="border-l border-white/[0.035]" key={index} />
          ))}
        </div>

        {sample.map((item) => {
          const x =
            mode === "environment"
              ? ((item.averageDryDays ?? 0) / maxDry) * 82 + 10
              : (Math.log1p(item.count) / Math.log1p(maxCount)) * 82 + 10;
          const y = 90 - Math.max(item.averageRisk ?? 0, 0) * 78;
          const size =
            mode === "environment"
              ? 8 + Math.sqrt(item.count / maxCount) * 26
              : 8 + Math.sqrt((item.maxFrp ?? 0) / maxFrp) * 26;
          const color =
            mode === "environment"
              ? biomeColor(item.bioma)
              : priorityColor(item.orbitFireScore);
          const featured = topIds.has(item.id);

          return (
            <button
              className={`orbitfire-scatter-dot absolute -translate-x-1/2 -translate-y-1/2 rounded-full border transition hover:z-20 hover:scale-125 ${
                featured
                  ? "border-white/42 shadow-[0_0_18px_rgba(249,115,22,0.35)]"
                  : "border-white/16"
              }`}
              key={item.id}
              onClick={() => onSelect(item)}
              onMouseEnter={(event) =>
                setHovered({ item, x: event.currentTarget.offsetLeft, y: event.currentTarget.offsetTop })
              }
              onMouseLeave={() => setHovered(null)}
              onMouseMove={(event) =>
                setHovered({ item, x: event.currentTarget.offsetLeft + 10, y: event.currentTarget.offsetTop - 10 })
              }
              style={{
                background: color,
                height: size,
                left: `${x}%`,
                opacity: featured ? 0.92 : 0.68,
                top: `${y}%`,
                width: size,
              }}
              type="button"
            >
              {featured ? (
                <span className="pointer-events-none absolute left-1/2 top-full mt-1 max-w-28 -translate-x-1/2 truncate text-[10px] text-white/62">
                  {item.municipio}
                </span>
              ) : null}
            </button>
          );
        })}

        {hovered ? (
          <div
            className="pointer-events-none absolute z-30 w-64 rounded-lg border border-orange-300/20 bg-black/88 p-3 text-xs shadow-[0_20px_60px_rgba(0,0,0,0.56)] backdrop-blur-xl"
            style={{
              left: Math.min(Math.max(hovered.x + 14, 16), 560),
              top: Math.max(hovered.y - 26, 12),
            }}
          >
            <strong className="block text-sm text-white">
              {hovered.item.municipio} — {hovered.item.uf}
            </strong>
            <span className="mt-2 block text-white/58">Bioma: {hovered.item.bioma}</span>
            <span className="block text-white/58">Detecções: {formatInteger(hovered.item.count)}</span>
            <span className="block text-white/58">Risco médio: {formatRiskValue(hovered.item.averageRisk)}</span>
            {mode === "environment" ? (
              <>
                <span className="block text-white/58">
                  Média de dias sem chuva: {formatDecimal(hovered.item.averageDryDays, 1)} dias
                </span>
                <span className="block text-white/58">
                  Precipitação zero: {formatDecimal(hovered.item.zeroPrecipitationPercent, 1)}%
                </span>
              </>
            ) : (
              <>
                <span className="block text-white/58">
                  FRP máximo: {formatDecimal(hovered.item.maxFrp, 1)} MW
                </span>
                <span className="block text-orange-200">
                  Índice OrbitFire: {hovered.item.orbitFireScore} / 100
                </span>
              </>
            )}
          </div>
        ) : null}

        <span className="absolute bottom-2 left-10 text-[10px] text-white/34">
          {mode === "environment" ? "Média válida de dias sem chuva" : "Detecções por município"}
        </span>
        <span className="absolute left-2 top-6 -rotate-90 text-[10px] text-white/34">
          Risco médio
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-xs leading-5 text-white/42">
          {mode === "environment"
            ? "Cada ponto representa um município agregado. A visualização compara condições registradas de seca e risco de fogo associadas aos focos detectados."
            : "Cada ponto representa um município agregado. O tamanho indica o maior FRP observado e a cor representa a faixa do Índice OrbitFire."}
        </p>
        {ordered.length > 30 ? (
          <button
            className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-orange-300 transition hover:border-orange-300/30"
            onClick={() => setShowAll((current) => !current)}
            type="button"
          >
            {showAll ? "Exibir 30" : "Exibir todos"}
          </button>
        ) : null}
      </div>

      {mode === "environment" ? (
        <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-white/52">
          {[...new Set(ordered.map((item) => item.bioma))].slice(0, 6).map((biome) => (
            <span className="flex items-center gap-1.5" key={biome}>
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: biomeColor(biome) }} />
              {biome}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function StackedRiskByBiome({
  data,
  onBiomeSelect,
}: {
  data: Array<{ biome: string; total: number; risks: Record<VisualRiskLevel, number> }>;
  onBiomeSelect: (biome: string) => void;
}) {
  return (
    <div className="space-y-4">
      {data.map((item) => (
        <button
          className="grid w-full grid-cols-[112px_1fr_56px] items-center gap-3 text-left text-xs"
          key={item.biome}
          onClick={() => onBiomeSelect(item.biome)}
          title={`${item.biome}: ${formatInteger(item.total)} detecções`}
          type="button"
        >
          <span className="truncate text-white/62">{item.biome}</span>
          <span className="flex h-4 overflow-hidden rounded-full bg-white/[0.06]">
            {riskOrder.map((risk) => (
              <span
                className="orbitfire-stacked-segment"
                key={risk}
                style={{
                  background: riskColors[risk],
                  width: `${item.total ? (item.risks[risk] / item.total) * 100 : 0}%`,
                }}
                title={`${riskLabels[risk]}: ${item.risks[risk]}`}
              />
            ))}
          </span>
          <span className="text-right text-white/72">{formatInteger(item.total)}</span>
        </button>
      ))}
    </div>
  );
}

export function SegmentedBar({
  data,
}: {
  data: Array<{ label: string; count: number }>;
}) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  return (
    <div>
      <div className="flex h-6 overflow-hidden rounded-full bg-white/[0.06]">
        {data.map((item, index) => (
          <span
            className="orbitfire-segment"
            key={item.label}
            style={{
              background: chartColors[index],
              width: `${total ? (item.count / total) * 100 : 0}%`,
            }}
            title={`${item.label}: ${formatInteger(item.count)} (${formatDecimal(total ? (item.count / total) * 100 : 0, 1)}%)`}
          />
        ))}
      </div>
      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div className="flex items-center justify-between text-sm" key={item.label}>
            <span className="flex items-center gap-2 text-white/60">
              <span className="h-3 w-3 rounded-sm" style={{ background: chartColors[index] }} />
              {item.label}
            </span>
            <span className="text-white">
              {formatInteger(item.count)} ({formatDecimal(total ? (item.count / total) * 100 : 0, 1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatRiskValue(value: number | null) {
  return value === null ? "Não disponível" : formatDecimal(value, 2);
}

function priorityColor(score: number) {
  if (score >= 75) return "rgba(239,59,29,0.82)";
  if (score >= 50) return "rgba(249,115,22,0.76)";
  if (score >= 25) return "rgba(245,158,11,0.72)";
  return "rgba(115,115,115,0.62)";
}

function biomeColor(biome: string) {
  const colors: Record<string, string> = {
    Amazônia: "rgba(34,197,94,0.72)",
    Caatinga: "rgba(234,179,8,0.76)",
    Cerrado: "rgba(249,115,22,0.76)",
    "Mata Atlântica": "rgba(56,189,248,0.72)",
    Pampa: "rgba(139,92,246,0.72)",
    Pantanal: "rgba(20,184,166,0.72)",
  };
  return colors[biome] ?? "rgba(249,115,22,0.7)";
}

export const chartColors = [
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#22c55e",
  "#38bdf8",
  "#8b5cf6",
  "#ef4444",
];
