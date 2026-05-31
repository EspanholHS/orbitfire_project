"use client";

import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  clearFilter,
  defaultFilters,
  getActiveFilterChips,
  getFilterOptions,
  precipitationLabels,
  riskLabels,
  riskOrder,
} from "@/lib/fire-filters";
import type { DashboardFilters, FireFocusRecord } from "@/types/fire-focus";

export function GlobalFilters({
  filters,
  records,
  shown,
  total,
  onFiltersChange,
}: {
  filters: DashboardFilters;
  records: FireFocusRecord[];
  shown: number;
  total: number;
  onFiltersChange: (filters: DashboardFilters) => void;
}) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const options = useMemo(() => getFilterOptions(records, filters), [filters, records]);
  const chips = getActiveFilterChips(filters);

  const update = <K extends keyof DashboardFilters>(
    key: K,
    value: DashboardFilters[K],
  ) => {
    const next = { ...filters, [key]: value };
    if (key === "estado") next.municipio = "all";
    onFiltersChange(next);
  };

  return (
    <section className="relative border-b border-white/10 px-4 py-4 md:px-6">
      <div className="orbitfire-filter-panel rounded-lg border border-white/10 bg-[#0a0a0a]/78 p-3 shadow-[0_20px_80px_rgba(0,0,0,0.42)] backdrop-blur-xl">
        <div className="grid gap-3 lg:grid-cols-[repeat(5,minmax(0,1fr))_auto_auto]">
          <FilterSelect
            label="Estado"
            onChange={(value) => update("estado", value)}
            options={options.states.map((state) => ({ label: state, value: state }))}
            placeholder="Todos os estados"
            value={filters.estado}
          />
          <FilterSelect
            label="Município"
            onChange={(value) => update("municipio", value)}
            options={options.municipalities.map((city) => ({ label: city, value: city }))}
            placeholder="Todos os municípios"
            value={filters.municipio}
          />
          <FilterSelect
            label="Bioma"
            onChange={(value) => update("bioma", value)}
            options={options.biomes.map((biome) => ({ label: biome, value: biome }))}
            placeholder="Todos os biomas"
            value={filters.bioma}
          />
          <FilterSelect
            label="Faixa de risco"
            onChange={(value) => update("risco", value as DashboardFilters["risco"])}
            options={riskOrder.map((risk) => ({ label: riskLabels[risk], value: risk }))}
            placeholder="Todas as faixas"
            value={filters.risco}
          />
          <FilterSelect
            label="Satélite"
            onChange={(value) => update("satelite", value)}
            options={options.satellites.map((satellite) => ({ label: satellite, value: satellite }))}
            placeholder="Todos os satélites"
            value={filters.satelite}
          />
          <button
            className="mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-4 text-sm font-medium text-white/72 transition hover:border-orange-300/25 hover:text-white"
            onClick={() => setAdvancedOpen((current) => !current)}
            type="button"
          >
            <SlidersHorizontal size={16} />
            Filtros avançados
          </button>
          <button
            className="mt-auto h-11 rounded-lg px-3 text-sm font-semibold text-orange-300 transition hover:bg-orange-500/10"
            onClick={() => onFiltersChange(defaultFilters)}
            type="button"
          >
            Limpar filtros
          </button>
        </div>

        <div
          aria-hidden={!advancedOpen}
          className={`orbitfire-advanced-filters-shell ${advancedOpen ? "orbitfire-advanced-filters-shell-open" : ""}`}
        >
          <div className="orbitfire-advanced-filters-panel mt-4 grid gap-4 rounded-lg border border-white/10 bg-black/40 p-4 md:grid-cols-3">
            <div className="orbitfire-advanced-filter-item" style={{ "--advanced-delay": "0ms" } as CSSProperties}>
              <AdvancedNumber
                label="Dias sem chuva"
                max={filters.maxDryDays}
                min={filters.minDryDays}
                onMax={(value) => update("maxDryDays", value)}
                onMin={(value) => update("minDryDays", value)}
                suffix="dias"
              />
            </div>
            <div className="orbitfire-advanced-filter-item" style={{ "--advanced-delay": "70ms" } as CSSProperties}>
              <FilterSelect
                label="Precipitação"
                onChange={(value) =>
                  update("precipitation", value as DashboardFilters["precipitation"])
                }
                options={Object.entries(precipitationLabels)
                  .filter(([value]) => value !== "all")
                  .map(([value, label]) => ({
                    label,
                    value,
                  }))}
                placeholder="Todas"
                value={filters.precipitation}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <QuickButton onClick={() => update("precipitation", "zero")}>
                  Sem precipitação
                </QuickButton>
                <QuickButton onClick={() => update("precipitation", "positive")}>
                  Com registro
                </QuickButton>
              </div>
            </div>
            <div className="orbitfire-advanced-filter-item" style={{ "--advanced-delay": "140ms" } as CSSProperties}>
              <AdvancedNumber
                label="FRP"
                max={filters.maxFrp}
                min={filters.minFrp}
                onMax={(value) => update("maxFrp", value)}
                onMin={(value) => update("minFrp", value)}
                suffix="MW"
              />
            </div>
            <div
              className="orbitfire-advanced-filter-item flex flex-wrap gap-2 md:col-span-3"
              style={{ "--advanced-delay": "210ms" } as CSSProperties}
            >
              {[10, 20, 30].map((days) => (
                <QuickButton key={days} onClick={() => update("minDryDays", days)}>
                  Acima de {days} dias
                </QuickButton>
              ))}
              {[50, 100].map((frp) => (
                <QuickButton key={frp} onClick={() => update("minFrp", frp)}>
                  FRP acima de {frp} MW
                </QuickButton>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <button
              className="orbitfire-filter-chip inline-flex items-center gap-2 rounded-full border border-orange-300/20 bg-orange-500/10 px-3 py-1.5 text-xs font-medium text-orange-300 transition hover:border-orange-300/35"
              key={`${chip.key}-${chip.label}`}
              onClick={() => onFiltersChange(clearFilter(filters, chip.key))}
              type="button"
            >
              {chip.label}
              <X size={13} />
            </button>
          ))}
          <span className="text-xs text-white/48">
            Mostrando {shown.toLocaleString("pt-BR")} de {total.toLocaleString("pt-BR")} detecções
          </span>
        </div>
      </div>
    </section>
  );
}

function FilterSelect({
  label,
  onChange,
  options,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  placeholder: string;
  value: string;
}) {
  const [open, setOpen] = useState(false);
  const [menuRect, setMenuRect] = useState<DOMRect | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const currentLabel = value === "all"
    ? placeholder
    : options.find((option) => option.value === value)?.label ?? placeholder;

  useEffect(() => {
    if (!open) return;
    const updateRect = () => {
      const rect = buttonRef.current?.getBoundingClientRect() ?? null;
      setMenuRect(rect);
    };
    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [open]);

  return (
    <div
      className="relative grid gap-1.5"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <span className="text-xs text-white/60">{label}</span>
      <button
        className={`orbitfire-filter-trigger flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-3 text-left text-sm text-white outline-none transition hover:border-orange-300/20 focus:border-orange-300/30 ${open ? "orbitfire-filter-trigger-open" : ""}`}
        onClick={() => setOpen((current) => !current)}
        ref={buttonRef}
        type="button"
      >
        <span className="truncate">{currentLabel}</span>
        <ChevronDown
          className={`shrink-0 text-white/42 transition ${open ? "rotate-180" : ""}`}
          size={16}
        />
      </button>
      {open && menuRect ? createPortal(
        <div
          className="orbitfire-dropdown-menu orbitfire-scrollbar fixed z-[9999] max-h-72 overflow-y-auto rounded-lg border border-orange-300/18 bg-[#090909] p-1 shadow-[0_24px_70px_rgba(0,0,0,0.72)]"
          style={{
            left: menuRect.left,
            top: Math.max(8, Math.min(menuRect.bottom + 6, window.innerHeight - 302)),
            width: menuRect.width,
          }}
        >
          <button
            className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${
              value === "all"
                ? "bg-orange-500/15 text-orange-200"
                : "text-white/62 hover:bg-white/[0.055] hover:text-white"
            }`}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              onChange("all");
              setOpen(false);
            }}
            type="button"
          >
            {placeholder}
          </button>
          {options.map((option) => (
            <button
              className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${
                value === option.value
                  ? "bg-orange-500/15 text-orange-200"
                  : "text-white/62 hover:bg-white/[0.055] hover:text-white"
              }`}
              key={option.value}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>,
        document.body,
      ) : null}
    </div>
  );
}

function AdvancedNumber({
  label,
  max,
  min,
  onMax,
  onMin,
  suffix,
}: {
  label: string;
  max: number | null;
  min: number | null;
  onMax: (value: number | null) => void;
  onMin: (value: number | null) => void;
  suffix: string;
}) {
  return (
    <div>
      <p className="text-xs text-white/60">{label}</p>
      <div className="mt-1.5 grid grid-cols-2 gap-2">
        <input
          className="h-11 rounded-lg border border-white/10 bg-white/[0.035] px-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-orange-300/30"
          min={0}
          onChange={(event) => onMin(event.target.value ? Number(event.target.value) : null)}
          placeholder={`Mín. ${suffix}`}
          type="number"
          value={min ?? ""}
        />
        <input
          className="h-11 rounded-lg border border-white/10 bg-white/[0.035] px-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-orange-300/30"
          min={0}
          onChange={(event) => onMax(event.target.value ? Number(event.target.value) : null)}
          placeholder={`Máx. ${suffix}`}
          type="number"
          value={max ?? ""}
        />
      </div>
    </div>
  );
}

function QuickButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-xs text-white/62 transition hover:border-orange-300/25 hover:text-white"
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
