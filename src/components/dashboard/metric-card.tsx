"use client";

import type { ReactNode } from "react";
import type { MouseEvent } from "react";

function updateSpotlight(event: MouseEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
  event.currentTarget.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
}

export function MetricCard({
  accent = false,
  detail,
  icon,
  label,
  tooltip,
  value,
}: {
  accent?: boolean;
  detail?: ReactNode;
  icon?: ReactNode;
  label: string;
  tooltip?: string;
  value: ReactNode;
}) {
  return (
    <article
      className={`orbitfire-metric-card orbitfire-resonance group relative overflow-hidden rounded-lg border border-white/10 bg-[#0b0b0b]/82 p-4 shadow-[0_18px_70px_rgba(0,0,0,0.42)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-orange-300/25 ${accent ? "orbitfire-metric-card-accent" : ""}`}
      onMouseMove={updateSpotlight}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_50%_0%,rgba(249,115,22,0.14),transparent_60%)]" />
      <div className="relative z-10 flex items-start gap-4">
        {icon ? (
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${
              accent
                ? "border-orange-300/20 bg-orange-500/12 text-orange-200"
                : "border-white/10 bg-white/[0.04] text-orange-300"
            } shadow-[0_0_28px_rgba(249,115,22,0.12)]`}
          >
            {icon}
          </div>
        ) : null}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm text-white/62">{label}</p>
            {tooltip ? (
              <span
                className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-white/15 text-[10px] text-white/42"
                title={tooltip}
              >
                i
              </span>
            ) : null}
          </div>
          <strong
            className={`mt-1 block whitespace-nowrap text-2xl font-medium tracking-tight md:text-3xl ${
              accent ? "text-orange-100" : "text-white"
            }`}
          >
            {value}
          </strong>
          {detail ? <p className="mt-2 text-xs leading-5 text-white/46">{detail}</p> : null}
        </div>
      </div>
    </article>
  );
}
