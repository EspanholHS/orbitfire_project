"use client";

import type { CSSProperties } from "react";

type TelemetryStatusProps = {
  compact?: boolean;
};

const telemetryLines = [
  "ORBITFIRE // SISTEMA DE MONITORAMENTO ESPACIAL",
  "FONTE DE DADOS: PROGRAMA QUEIMADAS - INPE",
  "DATASET SELECIONADO: 29.05.2026",
  "STATUS: ADQUIRINDO DETECÇÕES",
];

export function TelemetryStatus({ compact = false }: TelemetryStatusProps) {
  if (compact) {
    return (
      <div className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
        <p className="text-orange-300">Sinal orbital estabelecido</p>
        <p className="mt-2 text-white/38">Carregando painel analítico...</p>
      </div>
    );
  }

  return (
    <div className="orbitfire-telemetry-panel">
      <div className="mb-4 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_14px_rgba(249,115,22,0.9)] orbitfire-lock-blink" />
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-orange-300">
          Inicialização orbital
        </span>
      </div>

      <div className="space-y-2">
        {telemetryLines.map((line, index) => (
          <p
            className="orbitfire-telemetry-line font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-white/58 md:text-xs"
            key={line}
            style={{ "--delay": `${0.98 + index * 0.15}s` } as CSSProperties}
          >
            {line}
          </p>
        ))}
      </div>

      <div className="mt-5 space-y-2 border-t border-white/10 pt-4">
        <p className="orbitfire-telemetry-line font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-amber-200 md:text-xs" style={{ "--delay": "2.02s" } as CSSProperties}>
          Sinal orbital estabelecido
        </p>
        <p className="orbitfire-telemetry-line font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-white/52 md:text-xs" style={{ "--delay": "2.16s" } as CSSProperties}>
          Processando focos detectados...
        </p>
        <p className="orbitfire-telemetry-complete font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-orange-300 md:text-xs">
          Análise concluída
        </p>
      </div>
    </div>
  );
}
