"use client";

import { RadioTower } from "lucide-react";

export function DashboardLoadingState({
  dateLabel,
  visible,
}: {
  dateLabel: string;
  visible: boolean;
}) {
  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed left-1/2 top-24 z-[80] w-[min(460px,calc(100vw-32px))] -translate-x-1/2 overflow-hidden rounded-2xl border border-orange-300/18 bg-[#090706]/92 p-4 text-center shadow-[0_24px_90px_rgba(0,0,0,0.55),0_0_48px_rgba(249,115,22,0.18)] backdrop-blur-2xl">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent" />
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-orange-300/20 bg-orange-500/10 text-orange-300 shadow-[0_0_28px_rgba(249,115,22,0.22)]">
        <RadioTower className="animate-pulse" size={20} />
      </div>
      <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-orange-200">
        Sincronizando dados orbitais
      </p>
      <p className="mt-1 text-sm text-white/58">API OrbitFire // {dateLabel}</p>
    </div>
  );
}
