"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { DetectionCounter } from "@/components/transitions/detection-counter";
import { OrbitalMapScan } from "@/components/transitions/orbital-map-scan";
import { TelemetryStatus } from "@/components/transitions/telemetry-status";

type TransitionMode = "full" | "fast";

type TransitionState = {
  mode: TransitionMode;
  origin: {
    x: number;
    y: number;
  };
  reducedMotion: boolean;
};

type OrbitalLockTransitionContextValue = {
  isTransitioning: boolean;
  startDashboardTransition: (event?: React.MouseEvent<HTMLElement>) => void;
};

const DASHBOARD_PATH = "/dashboard";
const FULL_DURATION = 4300;
const FAST_DURATION = 820;

const OrbitalLockTransitionContext =
  createContext<OrbitalLockTransitionContextValue | null>(null);

const particles = Array.from({ length: 34 }).map((_, index) => {
  const angle = index * 37;
  const distance = 34 + (index % 9) * 7;
  return {
    delay: 0.22 + (index % 8) * 0.035,
    size: 2 + (index % 4),
    x: Math.cos((angle * Math.PI) / 180) * distance,
    y: Math.sin((angle * Math.PI) / 180) * distance,
  };
});

export function OrbitalLockTransitionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const [transition, setTransition] = useState<TransitionState | null>(null);

  useEffect(() => {
    router.prefetch(DASHBOARD_PATH);
  }, [router]);

  useEffect(() => {
    if (!transition) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.classList.add("orbitfire-transition-active");

    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.classList.remove("orbitfire-transition-active");
    };
  }, [transition]);

  const startDashboardTransition = useCallback(
    (event?: React.MouseEvent<HTMLElement>) => {
      event?.preventDefault();
      if (transition) return;

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const mode: TransitionMode = reducedMotion ? "fast" : "full";
      const origin = event
        ? { x: event.clientX, y: event.clientY }
        : { x: window.innerWidth / 2, y: window.innerHeight / 2 };

      router.prefetch(DASHBOARD_PATH);
      setTransition({ mode, origin, reducedMotion });

      const duration = mode === "full" ? FULL_DURATION : FAST_DURATION;
      window.setTimeout(() => {
        router.push(DASHBOARD_PATH);
      }, duration);
    },
    [router, transition],
  );

  const value = useMemo(
    () => ({
      isTransitioning: Boolean(transition),
      startDashboardTransition,
    }),
    [startDashboardTransition, transition],
  );

  return (
    <OrbitalLockTransitionContext.Provider value={value}>
      {children}
      {transition ? <OrbitalLockTransitionOverlay transition={transition} /> : null}
    </OrbitalLockTransitionContext.Provider>
  );
}

export function useOrbitalLockTransition() {
  const context = useContext(OrbitalLockTransitionContext);
  if (!context) {
    throw new Error(
      "useOrbitalLockTransition must be used inside OrbitalLockTransitionProvider",
    );
  }
  return context;
}

function OrbitalLockTransitionOverlay({
  transition,
}: {
  transition: TransitionState;
}) {
  const compact = transition.mode === "fast" || transition.reducedMotion;
  const style = {
    "--origin-x": `${transition.origin.x}px`,
    "--origin-y": `${transition.origin.y}px`,
  } as CSSProperties;

  return (
    <div
      aria-live="polite"
      aria-busy="true"
      className={`fixed inset-0 z-[100] overflow-hidden bg-[#050505] text-white ${
        compact ? "orbitfire-lock-fast" : "orbitfire-lock-full"
      }`}
      role="status"
      style={style}
    >
      <span className="orbitfire-lock-wave" />
      <span className="orbitfire-lock-core" />

      {compact ? (
        <FastTransition />
      ) : (
        <FullTransition reducedMotion={transition.reducedMotion} />
      )}

      <a
        className="orbitfire-lock-fallback pointer-events-auto fixed bottom-6 left-1/2 z-[120] -translate-x-1/2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/56 backdrop-blur-xl transition hover:border-orange-300/40 hover:text-white"
        href={DASHBOARD_PATH}
      >
        Continuar para o dashboard
      </a>
    </div>
  );
}

function FullTransition({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.16),transparent_52%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_115%,rgba(251,191,36,0.09),transparent_50%)]" />
      <div className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:84px_84px]" />
      <div className="orbitfire-diagonal-rain absolute -left-32 -top-40 h-[135vh] w-[145vw] opacity-35" />
      <div className="orbitfire-lock-grain" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_38%,rgba(0,0,0,0.76)_100%)]" />

      <div className="orbitfire-lock-particles" aria-hidden="true">
        {particles.map((particle) => (
          <span
            key={`${particle.x}-${particle.y}`}
            style={
              {
                "--particle-delay": `${particle.delay}s`,
                "--particle-size": `${particle.size}px`,
                "--particle-x": `${particle.x}vw`,
                "--particle-y": `${particle.y}vh`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div className="relative z-10 grid h-full grid-rows-[auto_1fr_auto] px-5 py-6 md:px-10 md:py-8">
        <div className="flex items-start justify-between gap-4">
          <TelemetryStatus />
          <div className="hidden rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/42 backdrop-blur-xl md:block">
            Da detecção espacial à inteligência ambiental
          </div>
        </div>

        <div className="relative grid min-h-0 items-center gap-6 md:grid-cols-[0.8fr_1.1fr_0.8fr]">
          <div className="hidden md:block" />
          <OrbitalMapScan />
          <DetectionCounter active reducedMotion={reducedMotion} />
        </div>

        <div className="orbitfire-dashboard-assembly">
          <div className="rounded-lg border border-white/10 bg-black/60 p-4 shadow-[0_32px_120px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-orange-300">
                  OrbitFire
                </p>
                <p className="mt-1 text-sm font-medium text-white/70">
                  Painel de Monitoramento Espacial
                </p>
              </div>
              <span className="rounded-full border border-orange-300/20 bg-orange-500/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-orange-200">
                Análise concluída
              </span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-[1.1fr_0.9fr]">
              <div className="min-h-32 rounded-md border border-white/10 bg-white/[0.025]" />
              <div className="grid grid-cols-2 gap-3">
                <span className="rounded-md border border-white/10 bg-white/[0.035]" />
                <span className="rounded-md border border-white/10 bg-white/[0.035]" />
                <span className="rounded-md border border-white/10 bg-white/[0.035]" />
                <span className="rounded-md border border-white/10 bg-white/[0.035]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function FastTransition() {
  return (
    <div className="relative z-10 flex h-full items-center justify-center px-6">
      <div className="text-center">
        <div className="mx-auto mb-6 h-16 w-16 rounded-full border border-orange-300/20 bg-orange-500/10 shadow-[0_0_60px_rgba(249,115,22,0.32)]">
          <div className="h-full w-full rounded-full border-t-2 border-orange-300 [animation:orbitfire-spin-slow_850ms_linear_infinite]" />
        </div>
        <TelemetryStatus compact />
        <div className="mt-7">
          <DetectionCounter active compact />
        </div>
      </div>
    </div>
  );
}
