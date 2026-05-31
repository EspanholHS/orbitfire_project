"use client";

import { ArrowRight, X } from "lucide-react";
import { riskLabels } from "@/lib/fire-filters";
import { formatDecimal, formatRisk } from "@/lib/fire-metrics";
import type { FireFocusRecord } from "@/types/fire-focus";

export function FocusDetailsDrawer({
  focus,
  onClose,
  onInvestigateMunicipality,
}: {
  focus: FireFocusRecord | null;
  onClose: () => void;
  onInvestigateMunicipality: (record: FireFocusRecord) => void;
}) {
  return (
    <aside
      className={`fixed bottom-0 right-0 top-0 z-40 w-full max-w-md border-l border-white/10 bg-[#080808]/96 p-5 shadow-[-28px_0_90px_rgba(0,0,0,0.58)] backdrop-blur-2xl transition-transform duration-300 ${
        focus ? "translate-x-0" : "translate-x-full"
      }`}
      aria-hidden={!focus}
    >
      {focus ? (
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-orange-300">
                Foco detectado
              </p>
              <h2 className="mt-3 text-2xl font-medium tracking-tight text-white">
                {focus.municipio} — {focus.uf}
              </h2>
              <p className="mt-1 text-sm text-white/54">{focus.bioma}</p>
            </div>
            <button
              aria-label="Fechar detalhe"
              className="rounded-full border border-white/10 p-2 text-white/60 transition hover:text-white"
              onClick={onClose}
              type="button"
            >
              <X size={17} />
            </button>
          </div>

          <div className="space-y-6 overflow-y-auto py-6">
            <DetailGroup
              title="Detecção"
              rows={[
                ["Data/hora GMT", focus.dataHoraGmtFormatada],
                ["Satélite", focus.satelite],
                ["Latitude", formatDecimal(focus.lat, 4)],
                ["Longitude", formatDecimal(focus.lon, 4)],
              ]}
            />
            <DetailGroup
              title="Condições associadas"
              rows={[
                ["Risco de fogo", formatRisk(focus.riscoFogo)],
                ["Faixa visual OrbitFire", riskLabels[focus.riscoVisual]],
                [
                  "Dias sem chuva",
                  focus.numeroDiasSemChuva === null
                    ? "Não disponível"
                    : `${formatDecimal(focus.numeroDiasSemChuva, 0)} dias`,
                ],
                [
                  "Precipitação",
                  focus.precipitacao === null
                    ? "Não disponível"
                    : `${formatDecimal(focus.precipitacao, 1)} mm`,
                ],
                [
                  "FRP",
                  focus.frp === null ? "Não disponível" : `${formatDecimal(focus.frp, 1)} MW`,
                ],
              ]}
            />

            <div className="rounded-lg border border-orange-300/14 bg-orange-500/8 p-4 text-sm leading-7 text-white/56">
              Registro detectado por satélite. Não representa confirmação isolada
              de incêndio florestal.
            </div>
          </div>

          <button
            className="mt-auto inline-flex items-center justify-center gap-2 rounded-lg border border-orange-300/20 bg-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_0_30px_rgba(249,115,22,0.24)] transition hover:bg-orange-500"
            onClick={() => onInvestigateMunicipality(focus)}
            type="button"
          >
            Investigar município
            <ArrowRight size={16} />
          </button>
        </div>
      ) : null}
    </aside>
  );
}

function DetailGroup({
  rows,
  title,
}: {
  rows: Array<[string, string]>;
  title: string;
}) {
  return (
    <section>
      <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/36">
        {title}
      </h3>
      <div className="mt-3 divide-y divide-white/8 rounded-lg border border-white/10 bg-white/[0.025]">
        {rows.map(([label, value]) => (
          <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm" key={label}>
            <span className="text-white/42">{label}</span>
            <span className="text-right text-white/82">{value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
