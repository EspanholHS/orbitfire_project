"use client";

import Link from "next/link";
import { Bell, Home, Menu, Search } from "lucide-react";
import { DataSourceBadge } from "@/components/dashboard/data-source-badge";
import { DatePeriodSelector } from "@/components/dashboard/date-period-selector";
import type { DashboardView } from "@/types/fire-focus";
import type { AvailableDailyPeriod, DataSourceKind } from "@/types/orbitfire-api";

const viewCopy: Record<DashboardView, { title: string; subtitle: string }> = {
  overview: {
    title: "Visão Geral",
    subtitle: "Focos detectados por satélite em território brasileiro",
  },
  map: {
    title: "Mapa de Focos",
    subtitle: "Exploração territorial das detecções registradas em GMT",
  },
  prioritization: {
    title: "Priorização",
    subtitle: "Áreas prioritárias para acompanhamento ambiental",
  },
  environment: {
    title: "Condições Ambientais",
    subtitle: "Risco de fogo, seca, precipitação e biomas expostos",
  },
  orbital: {
    title: "Cobertura Orbital",
    subtitle: "Sensores espaciais e horários de observação do dataset",
  },
};

export function DashboardHeader({
  dataSource,
  loadingDate,
  municipalities,
  onDateChange,
  onMenuClick,
  onMunicipalitySearch,
  periods,
  selectedDate,
  view,
}: {
  dataSource: DataSourceKind;
  loadingDate: string | null;
  municipalities: string[];
  onDateChange: (date: string) => void;
  onMenuClick: () => void;
  onMunicipalitySearch: (municipality: string) => void;
  periods: AvailableDailyPeriod[];
  selectedDate: string;
  view: DashboardView;
}) {
  const copy = viewCopy[view];

  return (
    <header className="flex flex-col gap-5 border-b border-white/10 px-4 py-4 md:px-6 2xl:flex-row 2xl:items-center 2xl:justify-between">
      <div className="flex items-start gap-3">
        <button
          aria-label="Abrir navegação"
          className="mt-1 rounded-full border border-white/10 bg-white/[0.035] p-2 text-white/70 md:hidden"
          onClick={onMenuClick}
          type="button"
        >
          <Menu size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-white md:text-3xl">
            {copy.title}
          </h1>
          <p className="mt-1 text-sm text-white/58">{copy.subtitle}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          className="orbitfire-back-link group inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-lg border border-white/10 bg-white/[0.035] px-4 text-xs font-medium text-white/62 transition hover:border-orange-300/25 hover:bg-orange-500/10 hover:text-white"
          href="/"
        >
          <Home className="transition-transform duration-200 group-hover:-translate-x-0.5" size={15} />
          Voltar ao início
        </Link>
        <BadgeText label="Dados reais" tone="orange" />
        <BadgeText label="INPE" />
        <DataSourceBadge source={dataSource} />
        <DatePeriodSelector
          loadingDate={loadingDate}
          onDateChange={onDateChange}
          periods={periods}
          selectedDate={selectedDate}
        />

        <label className="relative min-w-[220px] flex-1 xl:w-60 xl:flex-none 2xl:w-72">
          <span className="sr-only">Buscar município</span>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/36"
            size={17}
          />
          <input
            className="orbitfire-search-input h-11 w-full rounded-lg border border-white/10 bg-white/[0.035] pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-white/32 focus:border-orange-300/30 focus:bg-white/[0.055]"
            list="orbitfire-municipios"
            onChange={(event) => {
              const value = event.target.value;
              if (municipalities.includes(value)) onMunicipalitySearch(value);
            }}
            placeholder="Buscar município..."
            type="search"
          />
          <datalist id="orbitfire-municipios">
            {municipalities.map((municipality) => (
              <option key={municipality} value={municipality} />
            ))}
          </datalist>
        </label>

        <button
          aria-label="Notificações"
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.035] text-white/62 transition hover:border-orange-300/30 hover:text-white"
          type="button"
        >
          <Bell size={17} />
        </button>
      </div>
    </header>
  );
}

function BadgeText({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "orange";
}) {
  return (
    <span
      className={`inline-flex h-11 items-center whitespace-nowrap rounded-lg border px-4 text-xs font-medium ${
        tone === "orange"
          ? "orbitfire-real-data-badge border-orange-300/14 bg-orange-500/10 text-orange-300"
          : "border-white/10 bg-white/[0.035] text-white/62"
      }`}
    >
      {label}
    </span>
  );
}
