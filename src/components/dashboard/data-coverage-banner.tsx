"use client";

import { AlertTriangle } from "lucide-react";
import type { DataCoverage } from "@/types/orbitfire-api";

export function DataCoverageBanner({ coverage }: { coverage: DataCoverage }) {
  if (!coverage.hasEnvironmentalGap) return null;

  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-orange-300/18 bg-orange-500/[0.055] p-4 shadow-[0_0_34px_rgba(249,115,22,0.08)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-orange-300/20 bg-orange-500/10 text-orange-300">
            <AlertTriangle size={17} />
          </span>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-orange-200">
              Cobertura ambiental parcial
            </p>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-white/62">
              Algumas variaveis de risco e condicoes climaticas nao estao disponiveis para esta data.
              Metricas ambientais usam apenas registros validos.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-white/58 sm:grid-cols-4">
          <CoveragePill label="Risco" value={coverage.risk} />
          <CoveragePill label="Sem chuva" value={coverage.dryDays} />
          <CoveragePill label="Precipitacao" value={coverage.precipitation} />
          <CoveragePill label="FRP" value={coverage.frp} />
        </div>
      </div>
    </div>
  );
}

function CoveragePill({ label, value }: { label: string; value: number }) {
  return (
    <span className="rounded-lg border border-white/10 bg-black/22 px-3 py-2">
      <span className="block text-white/38">{label}</span>
      <span className="mt-1 block font-mono text-orange-200">{value.toFixed(0)}%</span>
    </span>
  );
}
