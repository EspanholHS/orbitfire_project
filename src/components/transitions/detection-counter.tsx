"use client";

import { useEffect, useState } from "react";

type DetectionCounterProps = {
  active: boolean;
  compact?: boolean;
  reducedMotion?: boolean;
};

const formatter = new Intl.NumberFormat("pt-BR");

export function DetectionCounter({
  active,
  compact = false,
  reducedMotion = false,
}: DetectionCounterProps) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active || reducedMotion || compact) return;

    let frame = 0;
    let startedAt = 0;
    const startDelay = window.setTimeout(() => {
      const animate = (timestamp: number) => {
        if (!startedAt) startedAt = timestamp;
        const progress = Math.min((timestamp - startedAt) / 1100, 1);
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -9 * progress);
        setValue(Math.round(3141 * eased));

        if (progress < 1) {
          frame = window.requestAnimationFrame(animate);
        } else {
          setValue(3141);
        }
      };

      frame = window.requestAnimationFrame(animate);
    }, 1450);

    return () => {
      window.clearTimeout(startDelay);
      window.cancelAnimationFrame(frame);
    };
  }, [active, compact, reducedMotion]);

  const displayValue = active ? (reducedMotion || compact ? 3141 : value) : 0;

  return (
    <div
      className={`orbitfire-lock-counter ${
        compact ? "orbitfire-lock-counter-fast" : ""
      }`}
    >
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-orange-300/80 md:text-xs">
        Focos detectados
      </p>
      <strong className="mt-2 block text-5xl font-medium tracking-tight text-orange-100 drop-shadow-[0_0_24px_rgba(249,115,22,0.28)] md:text-7xl">
        {formatter.format(displayValue)}
      </strong>
      <span className="mt-4 block h-px w-full overflow-hidden rounded-full bg-white/10">
        <span className="block h-full bg-gradient-to-r from-orange-500 via-amber-200 to-transparent orbitfire-lock-counter-line" />
      </span>
      <div className="mt-5 grid gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white/54 sm:grid-cols-3 md:text-[11px]">
        <span className="orbitfire-lock-data-chip">23 estados com detecções</span>
        <span className="orbitfire-lock-data-chip">369 municípios identificados</span>
        <span className="orbitfire-lock-data-chip">6 biomas analisados</span>
      </div>
    </div>
  );
}
