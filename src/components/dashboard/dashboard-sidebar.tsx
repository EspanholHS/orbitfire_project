"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  Flame,
  Globe2,
  MapPinned,
  RadioTower,
  Satellite,
  X,
} from "lucide-react";
import type { ComponentType } from "react";
import type { DashboardView } from "@/types/fire-focus";

const navItems: Array<{
  icon: ComponentType<{ size?: number; className?: string }>;
  id: DashboardView;
  label: string;
}> = [
  { icon: Flame, id: "overview", label: "Visão Geral" },
  { icon: MapPinned, id: "map", label: "Mapa de Focos" },
  { icon: BarChart3, id: "prioritization", label: "Priorização" },
  { icon: Globe2, id: "environment", label: "Condições Ambientais" },
  { icon: RadioTower, id: "orbital", label: "Cobertura Orbital" },
];

export function DashboardSidebar({
  activeView,
  analysisDateLabel,
  mobileOpen,
  onClose,
  onViewChange,
  sourceLabel,
  totalDetections,
}: {
  activeView: DashboardView;
  analysisDateLabel: string;
  mobileOpen: boolean;
  onClose: () => void;
  onViewChange: (view: DashboardView) => void;
  sourceLabel: string;
  totalDetections: number;
}) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition md:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed bottom-0 left-0 top-0 z-50 flex w-[280px] flex-col border-r border-white/10 bg-[#080808]/96 p-4 shadow-[28px_0_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-transform duration-300 md:sticky md:z-10 md:h-screen md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="orbitfire-sidebar-logo relative flex h-12 w-12 items-center justify-center rounded-full border border-orange-400/30 bg-orange-500/10 text-orange-300 shadow-[0_0_32px_rgba(249,115,22,0.18)]">
              <Satellite size={23} />
              <span className="absolute inset-1 rounded-full border border-orange-300/20" />
            </div>
            <div>
              <p className="text-xl font-semibold tracking-tight text-white">
                Orbit<span className="text-orange-500">Fire</span>
              </p>
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/42">
                Monitoramento espacial
              </p>
            </div>
          </div>
          <button
            aria-label="Fechar navegação"
            className="rounded-full border border-white/10 p-2 text-white/60 md:hidden"
            onClick={onClose}
            type="button"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-xs text-white/62">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.9)]" />
          Sistema ativo
        </div>

        <nav className="mt-10 space-y-7">
          <div>
            <p className="px-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/34">
              Monitoramento
            </p>
            <div className="mt-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeView === item.id;

                return (
                  <button
                    className={`orbitfire-sidebar-item group relative flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left text-sm transition duration-300 ${
                      active
                        ? "orbitfire-sidebar-item-active border-orange-300/18 bg-orange-500/12 text-white shadow-[0_0_28px_rgba(249,115,22,0.12)]"
                        : "border-transparent text-white/62 hover:border-white/10 hover:bg-white/[0.035] hover:text-white"
                    }`}
                    key={item.id}
                    onClick={() => {
                      onViewChange(item.id);
                      onClose();
                    }}
                    type="button"
                  >
                    {active ? (
                      <span className="absolute -left-4 bottom-2 top-2 w-1 rounded-r-full bg-orange-500 shadow-[0_0_18px_rgba(249,115,22,0.85)]" />
                    ) : null}
                    <Icon className={active ? "text-orange-300" : "text-white/48"} size={18} />
                    <span className="flex-1">{item.label}</span>
                    {active ? <span className="text-orange-300">›</span> : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="px-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/34">
              Sistema
            </p>
            <div className="mt-3 space-y-1">
              <Link
                className="flex items-center gap-3 rounded-lg border border-transparent px-3 py-3 text-sm text-white/55 transition hover:border-orange-300/18 hover:bg-orange-500/10 hover:text-white"
                href="/"
              >
                <ArrowLeft size={17} />
                Voltar à página inicial
              </Link>
            </div>
          </div>
        </nav>

        <div className="orbitfire-source-card mt-auto overflow-hidden rounded-lg border border-white/10 bg-white/[0.035] p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/34">
            Fonte dos dados
          </p>
          <p className="mt-4 text-sm font-medium text-orange-300">{sourceLabel}</p>
          <p className="text-sm text-orange-300">INPE</p>
          <p className="mt-5 text-xs text-white/50">Dataset:</p>
          <p className="mt-1 text-sm text-white">{analysisDateLabel}</p>
          <p className="mt-5 text-sm leading-6 text-white/62">
            {totalDetections.toLocaleString("pt-BR")} detecções processadas
          </p>
          <div className="mt-4 h-20 rounded-md bg-[radial-gradient(ellipse_at_bottom,rgba(249,115,22,0.26),transparent_60%)]" />
        </div>
      </aside>
    </>
  );
}
