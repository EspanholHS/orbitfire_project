"use client";

import {
  Activity,
  ArrowRight,
  Droplets,
  Flame,
  Gauge,
  LocateFixed,
  MapPinned,
  Pause,
  Play,
  RadioTower,
  RotateCcw,
  Satellite,
  Sun,
} from "lucide-react";
import type { ComponentType } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { OrbitalDashboardBackground } from "@/components/dashboard/orbital-dashboard-background";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { FocusDetailsDrawer } from "@/components/dashboard/focus-details-drawer";
import { GlobalFilters } from "@/components/dashboard/global-filters";
import { MetricCard } from "@/components/dashboard/metric-card";
import { OrbitMap } from "@/components/dashboard/orbit-map";
import {
  DonutChart,
  HorizontalBarChart,
  Panel,
  RiskBarChart,
  ScatterPlot,
  SegmentedBar,
  StackedRiskByBiome,
  TimelineChart,
  chartColors,
} from "@/components/dashboard/charts";
import {
  defaultFilters,
  filterRecords,
  riskLabels,
} from "@/lib/fire-filters";
import {
  aggregateMunicipalities,
  createMetrics,
  formatDecimal,
  formatInteger,
  formatRisk,
  precipitationSummary,
  riskDistributionByBiome,
} from "@/lib/fire-metrics";
import type {
  DashboardFilters,
  DashboardView,
  FireDataPayload,
  FireFocusRecord,
  MapMode,
  MunicipalityAggregate,
  VisualRiskLevel,
} from "@/types/fire-focus";

const viewStatus: Record<DashboardView, string> = {
  environment: "PROCESSANDO CAMADAS AMBIENTAIS",
  map: "INICIALIZANDO MAPA TERRITORIAL",
  orbital: "SINCRONIZANDO COBERTURA ORBITAL",
  overview: "RECALIBRANDO CAMADA ANALITICA",
  prioritization: "CALCULANDO PRIORIZACAO",
};

export function DashboardShell({ data }: { data: FireDataPayload }) {
  const [view, setView] = useState<DashboardView>("overview");
  const [filters, setFilters] = useState<DashboardFilters>(defaultFilters);
  const [mapMode, setMapMode] = useState<MapMode>("concentration");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedFocus, setSelectedFocus] = useState<FireFocusRecord | null>(null);
  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState<string | null>(null);
  const [motionStatus, setMotionStatus] = useState<string | null>(null);
  const [motionKey, setMotionKey] = useState(0);
  const statusTimeout = useRef<number | null>(null);

  const showMotionStatus = (label: string) => {
    setMotionStatus(label);
    if (statusTimeout.current) window.clearTimeout(statusTimeout.current);
    statusTimeout.current = window.setTimeout(() => setMotionStatus(null), 980);
  };

  useEffect(
    () => () => {
      if (statusTimeout.current) window.clearTimeout(statusTimeout.current);
    },
    [],
  );

  const records = data.records;
  const filteredRecords = useMemo(() => filterRecords(records, filters), [filters, records]);
  const metrics = useMemo(() => createMetrics(filteredRecords), [filteredRecords]);
  const municipalities = useMemo(
    () => aggregateMunicipalities(filteredRecords),
    [filteredRecords],
  );
  const allMunicipalities = useMemo(
    () =>
      [...new Set(records.map((record) => record.municipio))].sort((a, b) =>
        a.localeCompare(b, "pt-BR"),
      ),
    [records],
  );
  const selectedMunicipality =
    municipalities.find((item) => item.id === selectedMunicipalityId) ?? null;

  const updateFilters = (next: DashboardFilters) => {
    showMotionStatus(next === defaultFilters ? "VISAO NACIONAL RESTAURADA" : "RECALCULANDO RECORTE ANALITICO");
    setMotionKey((current) => current + 1);
    setFilters(next);
    setSelectedFocus(null);
  };

  const changeView = (nextView: DashboardView) => {
    if (nextView === view) return;
    showMotionStatus(viewStatus[nextView]);
    setMotionKey((current) => current + 1);
    setView(nextView);
  };

  const selectMunicipality = (
    municipality: MunicipalityAggregate,
    applyAsFilter = false,
  ) => {
    setSelectedMunicipalityId(municipality.id);
    if (applyAsFilter) {
      updateFilters({
        ...filters,
        estado: "all",
        municipio: municipality.municipio,
      });
    }
  };

  const prioritizeState = (state: string, municipality?: MunicipalityAggregate) => {
    showMotionStatus(viewStatus.prioritization);
    setMotionKey((current) => current + 1);
    setView("prioritization");
    setFilters({ ...filters, estado: state, municipio: "all" });
    setSelectedFocus(null);
    if (municipality) setSelectedMunicipalityId(municipality.id);
  };

  const searchMunicipality = (municipio: string) => {
    updateFilters({ ...filters, municipio });
    const aggregate = aggregateMunicipalities(
      records.filter((record) => record.municipio === municipio),
    )[0];
    if (aggregate) setSelectedMunicipalityId(aggregate.id);
  };

  const investigateFocusMunicipality = (focus: FireFocusRecord) => {
    setView("prioritization");
    updateFilters({ ...filters, municipio: focus.municipio });
    const aggregate = aggregateMunicipalities(
      records.filter((record) => record.municipio === focus.municipio && record.uf === focus.uf),
    )[0];
    if (aggregate) setSelectedMunicipalityId(aggregate.id);
  };

  return (
    <main className="min-h-screen bg-[#070707] text-white">
      <OrbitalDashboardBackground intensified={Boolean(motionStatus)} view={view} />
      <MotionStatus label={motionStatus} />

      <div className="relative z-10 md:grid md:grid-cols-[280px_1fr]">
        <DashboardSidebar
          activeView={view}
          mobileOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          onViewChange={changeView}
          totalDetections={data.summary.totalDetections}
        />
        <div className="min-w-0">
          <DashboardHeader
            municipalities={allMunicipalities}
            onMenuClick={() => setMobileSidebarOpen(true)}
            onMunicipalitySearch={searchMunicipality}
            view={view}
          />
          <GlobalFilters
            filters={filters}
            onFiltersChange={updateFilters}
            records={records}
            shown={filteredRecords.length}
            total={records.length}
          />
          <div className="p-4 md:p-6">
            {filteredRecords.length === 0 ? (
              <EmptyState onClear={() => updateFilters(defaultFilters)} />
            ) : (
              <div className="orbitfire-view-stage" key={`${view}-${motionKey}`}>
                <DashboardViewContent
                  filters={filters}
                  mapMode={mapMode}
                  metrics={metrics}
                  municipalities={municipalities}
                  onBiomeFilter={(bioma) => updateFilters({ ...filters, bioma })}
                  onFocusSelect={setSelectedFocus}
                  onHourSelect={(hour) => updateFilters({ ...filters, hour })}
                  onMapModeChange={(nextMode) => {
                    showMotionStatus(`MODO ${nextMode.toUpperCase()} ATIVO`);
                    setMapMode(nextMode);
                  }}
                  onMunicipalitySelect={selectMunicipality}
                  onPrioritizeState={prioritizeState}
                  onRiskFilter={(risco) => updateFilters({ ...filters, risco })}
                  onSatelliteFilter={(satelite) => updateFilters({ ...filters, satelite })}
                  onStateFilter={(estado) => updateFilters({ ...filters, estado, municipio: "all" })}
                  records={filteredRecords}
                  selectedFocus={selectedFocus}
                  selectedMunicipality={selectedMunicipality}
                  view={view}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <FocusDetailsDrawer
        focus={selectedFocus}
        onClose={() => setSelectedFocus(null)}
        onInvestigateMunicipality={investigateFocusMunicipality}
      />
    </main>
  );
}

function DashboardViewContent({
  filters,
  mapMode,
  metrics,
  municipalities,
  onBiomeFilter,
  onFocusSelect,
  onHourSelect,
  onMapModeChange,
  onMunicipalitySelect,
  onPrioritizeState,
  onRiskFilter,
  onSatelliteFilter,
  onStateFilter,
  records,
  selectedFocus,
  selectedMunicipality,
  view,
}: {
  filters: DashboardFilters;
  mapMode: MapMode;
  metrics: ReturnType<typeof createMetrics>;
  municipalities: MunicipalityAggregate[];
  onBiomeFilter: (bioma: string) => void;
  onFocusSelect: (record: FireFocusRecord) => void;
  onHourSelect: (hour: number | null) => void;
  onMapModeChange: (mode: MapMode) => void;
  onMunicipalitySelect: (municipality: MunicipalityAggregate, applyAsFilter?: boolean) => void;
  onPrioritizeState: (state: string, municipality?: MunicipalityAggregate) => void;
  onRiskFilter: (risk: VisualRiskLevel) => void;
  onSatelliteFilter: (satellite: string) => void;
  onStateFilter: (state: string) => void;
  records: FireFocusRecord[];
  selectedFocus: FireFocusRecord | null;
  selectedMunicipality: MunicipalityAggregate | null;
  view: DashboardView;
}) {
  if (view === "map") {
    return (
      <MapFocusView
        filters={filters}
        currentState={filters.estado}
        mapMode={mapMode}
        metrics={metrics}
        municipalities={municipalities}
        onFocusSelect={onFocusSelect}
        onHourSelect={onHourSelect}
        onMapModeChange={onMapModeChange}
        onMunicipalitySelect={onMunicipalitySelect}
        onPrioritizeState={onPrioritizeState}
        onStateFilter={onStateFilter}
        records={records}
        selectedFocus={selectedFocus}
        selectedMunicipality={selectedMunicipality}
      />
    );
  }

  if (view === "prioritization") {
    return (
      <PrioritizationView
        municipalities={municipalities}
        onMunicipalitySelect={onMunicipalitySelect}
        selectedMunicipality={selectedMunicipality}
      />
    );
  }

  if (view === "environment") {
    return (
      <EnvironmentView
        metrics={metrics}
        municipalities={municipalities}
        onBiomeFilter={onBiomeFilter}
        onMunicipalitySelect={onMunicipalitySelect}
        records={records}
      />
    );
  }

  if (view === "orbital") {
    return (
      <OrbitalCoverageView
        metrics={metrics}
        onSatelliteFilter={onSatelliteFilter}
        records={records}
      />
    );
  }

  return (
    <OverviewView
      currentState={filters.estado}
      mapMode={mapMode}
      metrics={metrics}
      municipalities={municipalities}
      onFocusSelect={onFocusSelect}
      onMapModeChange={onMapModeChange}
      onMunicipalitySelect={onMunicipalitySelect}
      onPrioritizeState={onPrioritizeState}
      onRiskFilter={onRiskFilter}
      onStateFilter={onStateFilter}
      records={records}
      selectedFocus={selectedFocus}
      selectedMunicipality={selectedMunicipality}
    />
  );
}

function MotionStatus({ label }: { label: string | null }) {
  if (!label) return null;
  return (
    <div className="pointer-events-none fixed left-1/2 top-24 z-[80] -translate-x-1/2">
      <div className="orbitfire-motion-status rounded-full border border-orange-300/24 bg-black/72 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-orange-200 shadow-[0_0_34px_rgba(249,115,22,0.18)] backdrop-blur-xl">
        <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-orange-300 shadow-[0_0_10px_rgba(251,146,60,0.95)]" />
        {label}
      </div>
    </div>
  );
}

function sortMunicipalitiesByDetections(municipalities: MunicipalityAggregate[]) {
  return [...municipalities].sort(
    (a, b) =>
      b.count - a.count ||
      (b.maxRisk ?? 0) - (a.maxRisk ?? 0) ||
      (b.maxFrp ?? 0) - (a.maxFrp ?? 0) ||
      a.municipio.localeCompare(b.municipio, "pt-BR"),
  );
}

function OverviewView({
  currentState,
  mapMode,
  metrics,
  municipalities,
  onFocusSelect,
  onMapModeChange,
  onMunicipalitySelect,
  onPrioritizeState,
  onRiskFilter,
  onStateFilter,
  records,
  selectedFocus,
  selectedMunicipality,
}: {
  currentState: string;
  mapMode: MapMode;
  metrics: ReturnType<typeof createMetrics>;
  municipalities: MunicipalityAggregate[];
  onFocusSelect: (record: FireFocusRecord) => void;
  onMapModeChange: (mode: MapMode) => void;
  onMunicipalitySelect: (municipality: MunicipalityAggregate, applyAsFilter?: boolean) => void;
  onPrioritizeState: (state: string, municipality?: MunicipalityAggregate) => void;
  onRiskFilter: (risk: VisualRiskLevel) => void;
  onStateFilter: (state: string) => void;
  records: FireFocusRecord[];
  selectedFocus: FireFocusRecord | null;
  selectedMunicipality: MunicipalityAggregate | null;
}) {
  const detectionRanking = sortMunicipalitiesByDetections(municipalities);
  const topMunicipality = selectedMunicipality ?? detectionRanking[0];
  const [targetAcquisition, setTargetAcquisition] = useState<{
    detail: string;
    subtitle: string;
    title: string;
  } | null>(null);
  const targetTimeouts = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const stateFocus =
    currentState !== "all"
      ? {
          averageRisk: metrics.averageRisk,
          biomes: new Set(records.map((record) => record.bioma)).size,
          count: metrics.total,
          maxFrp: metrics.maxFrp,
          municipalities: municipalities.length,
          name: currentState,
          topMunicipality,
          uniqueCoordinates: metrics.uniqueCoordinates,
        }
      : null;

  useEffect(
    () => () => {
      targetTimeouts.current.forEach((timeout) => clearTimeout(timeout));
    },
    [],
  );

  const triggerInvestigation = (municipality: MunicipalityAggregate) => {
    targetTimeouts.current.forEach((timeout) => clearTimeout(timeout));
    setTargetAcquisition({
      detail: `${formatInteger(municipality.count)} DETECCOES IDENTIFICADAS`,
      subtitle: `${municipality.municipio.toUpperCase()} - ${municipality.uf}`,
      title: "ALVO ADQUIRIDO",
    });
    targetTimeouts.current = [
      setTimeout(() => onPrioritizeState(municipality.estado, municipality), 900),
      setTimeout(() => setTargetAcquisition(null), 2400),
    ];
  };

  return (
    <div className="space-y-5 orbitfire-dashboard-enter">
      <MetricGrid metrics={metrics} />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <OrbitMap
          activeMunicipality={topMunicipality}
          currentState={currentState}
          mode={mapMode}
          onFocusSelect={onFocusSelect}
          onModeChange={onMapModeChange}
          onStateSelect={onStateFilter}
          records={records}
          selectedFocus={selectedFocus}
          targetAcquisition={targetAcquisition}
        />

        <div className="grid gap-5">
          <Panel title="Destaques do dia">
            {stateFocus ? (
              <StateFocusCard
                onInvestigate={() => {
                  if (stateFocus.topMunicipality) {
                    triggerInvestigation(stateFocus.topMunicipality);
                  }
                }}
                state={stateFocus}
              />
            ) : topMunicipality ? (
              <div className="rounded-lg border border-orange-300/18 bg-orange-500/8 p-4">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-orange-300">
                  Área em destaque
                </p>
                <h3 className="mt-3 text-xl font-medium text-white">
                  {topMunicipality.municipio}
                </h3>
                <p className="mt-1 text-sm text-white/52">
                  {topMunicipality.estado} • {topMunicipality.bioma}
                </p>
                <div className="mt-5 grid grid-cols-4 gap-3 text-center">
                  <MiniStat label="detecções" value={formatInteger(topMunicipality.count)} />
                  <MiniStat label="pontos distintos" value={formatInteger(topMunicipality.uniqueCoordinates)} />
                  <MiniStat label="FRP máximo" value={`${formatDecimal(topMunicipality.maxFrp, 1)} MW`} />
                  <MiniStat label="risco médio" value={formatRisk(topMunicipality.averageRisk)} />
                </div>
                <button
                  className="orbitfire-investigate-button group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white"
                  onClick={() => triggerInvestigation(topMunicipality)}
                  type="button"
                >
                  <span className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full bg-white/12 text-orange-50">
                    <LocateFixed className="orbitfire-investigate-icon" size={13} />
                  </span>
                  <span className="relative z-10">Investigar área</span>
                  <ArrowRight className="relative z-10 transition-transform duration-300 group-hover:translate-x-1" size={16} />
                </button>
              </div>
            ) : null}
            <RankingList
              municipalities={detectionRanking.slice(0, 5)}
              onSelect={(item) => onMunicipalitySelect(item, true)}
            />
          </Panel>

          <Panel title="Resumo ambiental">
            <SummaryRows
              rows={[
                ["Risco de fogo médio (válido)", formatRisk(metrics.averageRisk), Flame],
                ["Média de dias sem chuva", `${formatDecimal(metrics.averageDryDays, 1)} dias`, Sun],
                ["Detecções com precipitação zero", `${formatDecimal(metrics.zeroPrecipitationPercent, 1)}%`, Droplets],
                ["Bioma com mais detecções", metrics.topBiome?.label ?? "Não disponível", Activity],
              ]}
            />
          </Panel>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Panel title="Detecções por estado">
          <HorizontalBarChart
            data={metrics.stateRanking.slice(0, 5)}
            maxLabel="Top 5 estados"
            onClick={onStateFilter}
          />
        </Panel>
        <Panel title="Distribuição por bioma">
          <DonutChart
            data={metrics.biomeRanking.map((item, index) => ({
              ...item,
              color: chartColors[index],
            }))}
            total={metrics.total}
          />
        </Panel>
        <Panel title="Distribuição por risco (OrbitFire)">
          <RiskBarChart data={metrics.riskDistribution} onClick={onRiskFilter} />
        </Panel>
      </div>
      <p className="text-xs text-white/34">
        * Faixa visual criada pelo OrbitFire a partir do campo risco_fogo da base do INPE.
      </p>
    </div>
  );
}

function MetricGrid({ metrics }: { metrics: ReturnType<typeof createMetrics> }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <MetricCard
        detail="29/05/2026"
        icon={<Flame size={20} />}
        label="Focos detectados"
        value={formatInteger(metrics.total)}
      />
      <MetricCard
        detail="Localizações únicas"
        icon={<MapPinned size={20} />}
        label="Coordenadas distintas"
        value={formatInteger(metrics.uniqueCoordinates)}
      />
      <MetricCard
        accent
        detail="risco_fogo > 0,75"
        icon={<Gauge size={20} />}
        label="Risco muito alto*"
        tooltip="Faixa visual criada pelo OrbitFire a partir do campo risco_fogo da base."
        value={formatInteger(metrics.veryHighRisk)}
      />
      <MetricCard
        detail={`${formatDecimal(metrics.zeroPrecipitationPercent, 1)}% com precipitação zero`}
        icon={<Sun size={20} />}
        label="Média sem chuva"
        value={`${formatDecimal(metrics.averageDryDays, 1)} dias`}
      />
      <MetricCard
        accent
        detail={metrics.maxFrpRecord?.municipio ?? "Não disponível"}
        icon={<Activity size={20} />}
        label="Maior FRP observado"
        value={`${formatDecimal(metrics.maxFrp, 1)} MW`}
      />
    </div>
  );
}

function StateFocusCard({
  onInvestigate,
  state,
}: {
  onInvestigate: () => void;
  state: {
    averageRisk: number | null;
    biomes: number;
    count: number;
    maxFrp: number | null;
    municipalities: number;
    name: string;
    topMunicipality?: MunicipalityAggregate;
    uniqueCoordinates: number;
  };
}) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-orange-300/22 bg-orange-500/8 p-4 shadow-[0_0_42px_rgba(249,115,22,0.09)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_18%,rgba(251,191,36,0.16),transparent_42%)]" />
      <div className="relative">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-orange-300">
          Estado em foco
        </p>
        <h3 className="mt-3 text-2xl font-medium text-white">{state.name}</h3>
        <p className="mt-1 text-sm text-white/52">
          Recorte territorial selecionado no mapa
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 text-center">
          <MiniStat label="detecções" value={formatInteger(state.count)} />
          <MiniStat label="municípios" value={formatInteger(state.municipalities)} />
          <MiniStat label="pontos distintos" value={formatInteger(state.uniqueCoordinates)} />
          <MiniStat label="biomas" value={formatInteger(state.biomes)} />
          <MiniStat label="FRP máximo" value={`${formatDecimal(state.maxFrp, 1)} MW`} />
          <MiniStat label="risco médio" value={formatRisk(state.averageRisk)} />
        </div>

        {state.topMunicipality ? (
          <div className="mt-5 rounded-lg border border-white/10 bg-black/26 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/38">
              Município com maior concentração
            </p>
            <p className="mt-2 text-sm font-semibold text-white">
              {state.topMunicipality.municipio}
            </p>
            <p className="mt-1 text-xs text-white/44">
              {formatInteger(state.topMunicipality.count)} detecções • {state.topMunicipality.bioma}
            </p>
          </div>
        ) : null}

        <button
          className="orbitfire-investigate-button group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white"
          disabled={!state.topMunicipality}
          onClick={onInvestigate}
          type="button"
        >
          <span className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full bg-white/12 text-orange-50">
            <LocateFixed className="orbitfire-investigate-icon" size={13} />
          </span>
          <span className="relative z-10">Investigar município</span>
          <ArrowRight className="relative z-10 transition-transform duration-300 group-hover:translate-x-1" size={16} />
        </button>
      </div>
    </div>
  );
}

function TemporalReplayControls({
  active,
  complete,
  filteredHour,
  onFullDay,
  onReset,
  onToggle,
}: {
  active: boolean;
  complete: boolean;
  filteredHour: number | null;
  onFullDay: () => void;
  onReset: () => void;
  onToggle: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <button
        className="orbitfire-replay-button inline-flex items-center gap-2 rounded-full border border-orange-300/18 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-200 transition hover:border-orange-300/35"
        onClick={onToggle}
        type="button"
      >
        {active ? <Pause size={13} /> : complete ? <RotateCcw size={13} /> : <Play size={13} />}
        {active ? "Pausar" : complete ? "Reiniciar" : "Reproduzir detecções do dia"}
      </button>
      {complete ? (
        <button className="text-xs text-white/48 hover:text-orange-200" onClick={onReset} type="button">
          Reset
        </button>
      ) : null}
      {filteredHour !== null ? (
        <button className="text-xs text-orange-300" onClick={onFullDay} type="button">
          Dia completo
        </button>
      ) : null}
    </div>
  );
}

function OrbitalPlaybackControls({
  active,
  complete,
  onReset,
  onToggle,
}: {
  active: boolean;
  complete: boolean;
  onReset: () => void;
  onToggle: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <button
        className="orbitfire-replay-button inline-flex items-center gap-2 rounded-full border border-orange-300/18 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-200 transition hover:border-orange-300/35"
        onClick={onToggle}
        type="button"
      >
        {active ? <Pause size={13} /> : complete ? <RotateCcw size={13} /> : <Play size={13} />}
        {active ? "Pausar" : complete ? "Reiniciar" : "Reproduzir cobertura orbital"}
      </button>
      {complete ? (
        <button className="text-xs text-white/48 hover:text-orange-200" onClick={onReset} type="button">
          Reset
        </button>
      ) : null}
    </div>
  );
}

function MapFocusView({
  currentState,
  filters,
  mapMode,
  metrics,
  municipalities,
  onFocusSelect,
  onHourSelect,
  onMapModeChange,
  onMunicipalitySelect,
  onPrioritizeState,
  onStateFilter,
  records,
  selectedFocus,
  selectedMunicipality,
}: {
  currentState: string;
  filters: DashboardFilters;
  mapMode: MapMode;
  metrics: ReturnType<typeof createMetrics>;
  municipalities: MunicipalityAggregate[];
  onFocusSelect: (record: FireFocusRecord) => void;
  onHourSelect: (hour: number | null) => void;
  onMapModeChange: (mode: MapMode) => void;
  onMunicipalitySelect: (municipality: MunicipalityAggregate, applyAsFilter?: boolean) => void;
  onPrioritizeState: (state: string, municipality?: MunicipalityAggregate) => void;
  onStateFilter: (state: string) => void;
  records: FireFocusRecord[];
  selectedFocus: FireFocusRecord | null;
  selectedMunicipality: MunicipalityAggregate | null;
}) {
  const [temporalReplay, setTemporalReplay] = useState<"idle" | "playing" | "paused" | "complete">("idle");
  const [temporalHour, setTemporalHour] = useState<number | null>(null);
  const replayActive = temporalReplay !== "idle";
  const replayRecords = replayActive && temporalHour !== null
    ? records.filter((record) => record.horaGmt <= temporalHour)
    : records;
  const replayMetrics = useMemo(() => createMetrics(replayRecords), [replayRecords]);
  const replayMunicipalities = useMemo(
    () => aggregateMunicipalities(replayRecords),
    [replayRecords],
  );
  const replayRanking = sortMunicipalitiesByDetections(
    replayActive ? replayMunicipalities : municipalities,
  );
  const stateFocus =
    currentState !== "all"
      ? {
          averageRisk: replayMetrics.averageRisk,
          biomes: new Set(replayRecords.map((record) => record.bioma)).size,
          count: replayMetrics.total,
          maxFrp: replayMetrics.maxFrp,
          municipalities: replayMunicipalities.length,
          name: currentState,
          topMunicipality: replayRanking[0],
          uniqueCoordinates: replayMetrics.uniqueCoordinates,
        }
      : null;

  useEffect(() => {
    if (temporalReplay !== "playing") return;
    const timer = setInterval(() => {
      setTemporalHour((current) => {
        const next = current === null ? 0 : current + 1;
        if (next >= 23) {
          setTemporalReplay("complete");
          return 23;
        }
        return next;
      });
    }, 430);
    return () => clearInterval(timer);
  }, [temporalReplay]);

  const toggleTemporalReplay = () => {
    if (temporalReplay === "playing") {
      setTemporalReplay("paused");
      return;
    }
    if (temporalReplay === "complete") {
      setTemporalHour(0);
    } else if (temporalHour === null) {
      setTemporalHour(0);
    }
    setTemporalReplay("playing");
  };

  const resetTemporalReplay = () => {
    setTemporalReplay("idle");
    setTemporalHour(null);
  };

  const handleHourSelect = (hour: number | null) => {
    if (temporalReplay === "playing") setTemporalReplay("paused");
    setTemporalHour(hour);
    onHourSelect(hour);
  };

  return (
    <div className="space-y-5 orbitfire-dashboard-enter">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard icon={<Flame size={18} />} label="Detecções filtradas" value={formatInteger(replayMetrics.total)} />
        <MetricCard icon={<MapPinned size={18} />} label="Pontos distintos" value={formatInteger(replayMetrics.uniqueCoordinates)} />
        <MetricCard icon={<Gauge size={18} />} label="Risco médio" value={formatRisk(replayMetrics.averageRisk)} />
        <MetricCard icon={<Activity size={18} />} label="FRP máximo" value={`${formatDecimal(replayMetrics.maxFrp, 1)} MW`} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <OrbitMap
          activeMunicipality={selectedMunicipality}
          currentState={currentState}
          mode={mapMode}
          onFocusSelect={onFocusSelect}
          onModeChange={onMapModeChange}
          onStateSelect={onStateFilter}
          records={replayRecords}
          selectedFocus={selectedFocus}
          targetAcquisition={
            temporalReplay === "complete" && replayRanking[0]
              ? {
                  detail: `${formatInteger(replayRanking[0].count)} DETECÇÕES NO MUNICÍPIO LÍDER`,
                  subtitle: `${replayRanking[0].municipio.toUpperCase()} - ${replayRanking[0].uf}`,
                  title: "REPLAY CONCLUÍDO",
                }
              : null
          }
        />
        <Panel title={selectedFocus ? "Detalhe selecionado" : stateFocus ? "Estado selecionado" : "Ranking do recorte"}>
          {selectedFocus ? (
            <SummaryRows
              rows={[
                ["Município", `${selectedFocus.municipio} — ${selectedFocus.uf}`, MapPinned],
                ["Data/hora GMT", selectedFocus.dataHoraGmtFormatada, RadioTower],
                ["Risco OrbitFire", riskLabels[selectedFocus.riscoVisual], Gauge],
                ["FRP", selectedFocus.frp === null ? "Não disponível" : `${formatDecimal(selectedFocus.frp, 1)} MW`, Activity],
              ]}
            />
          ) : stateFocus ? (
            <StateFocusCard
              onInvestigate={() => {
                if (stateFocus.topMunicipality) {
                  onPrioritizeState(stateFocus.name, stateFocus.topMunicipality);
                }
              }}
              state={stateFocus}
            />
          ) : (
            <RankingList municipalities={replayRanking.slice(0, 8)} onSelect={(item) => onMunicipalitySelect(item, true)} />
          )}
        </Panel>
      </div>
      <Panel
        action={
          <TemporalReplayControls
            active={temporalReplay === "playing"}
            complete={temporalReplay === "complete"}
            filteredHour={filters.hour}
            onFullDay={() => handleHourSelect(null)}
            onReset={resetTemporalReplay}
            onToggle={toggleTemporalReplay}
          />
        }
        title="Linha do tempo das detecções"
      >
        {replayActive ? (
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-300/18 bg-orange-500/10 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-orange-200">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-300 shadow-[0_0_10px_rgba(251,146,60,0.9)]" />
            REPRODUÇÃO TEMPORAL ATIVA // {String(temporalHour ?? 0).padStart(2, "0")}:00 GMT
          </div>
        ) : null}
        <TimelineChart
          activeHour={filters.hour}
          data={metrics.hourly}
          onHourSelect={handleHourSelect}
          playbackHour={temporalHour}
          playbackState={temporalReplay}
        />
        <p className="mt-4 text-xs leading-6 text-white/42">
          A linha do tempo representa horários de detecção registrados pelos satélites, não a evolução confirmada de incêndios.
        </p>
      </Panel>
    </div>
  );
}

function PrioritizationView({
  municipalities,
  onMunicipalitySelect,
  selectedMunicipality,
}: {
  municipalities: MunicipalityAggregate[];
  onMunicipalitySelect: (municipality: MunicipalityAggregate, applyAsFilter?: boolean) => void;
  selectedMunicipality: MunicipalityAggregate | null;
}) {
  const active = selectedMunicipality ?? municipalities[0];

  return (
    <div className="grid gap-5 orbitfire-dashboard-enter xl:grid-cols-[minmax(0,1.15fr)_0.85fr]">
      <Panel className="xl:row-span-2" title="Índice OrbitFire de Acompanhamento">
        <p className="mb-4 text-sm leading-7 text-white/50">
          Indicador experimental do OrbitFire para organizar o acompanhamento com base nos dados disponíveis. Não representa alerta oficial do INPE.
        </p>
        <div className="orbitfire-scrollbar max-h-[620px] overflow-y-auto overflow-x-hidden">
          <table className="w-full table-fixed text-left text-xs">
            <colgroup>
              <col className="w-[7%]" />
              <col className="w-[22%]" />
              <col className="w-[6%]" />
              <col className="w-[13%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
              <col className="w-[11%]" />
              <col className="w-[8%]" />
              <col className="w-[13%]" />
            </colgroup>
            <thead className="sticky top-0 z-10 bg-[#0b0b0b] text-[10px] uppercase tracking-[0.11em] text-white/34">
              <tr>
                {["Posição", "Município", "UF", "Bioma", "Detecções", "Risco médio", "FRP máximo", "Índice", "Ação"].map((header) => (
                  <th className="px-2 py-3 font-medium" key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8">
              {municipalities.map((item, index) => (
                <tr
                  className={`border-l-2 transition hover:bg-orange-500/8 ${
                    active?.id === item.id
                      ? "border-l-orange-400 bg-orange-500/10"
                      : "border-l-transparent"
                  }`}
                  key={item.id}
                >
                  <td className="px-2 py-3 font-mono text-white/34">{String(index + 1).padStart(2, "0")}</td>
                  <td className="px-2 py-3 font-medium leading-5 text-white">{item.municipio}</td>
                  <td className="px-2 py-3 text-white/56">{item.uf}</td>
                  <td className="truncate px-2 py-3 text-white/56">{item.bioma}</td>
                  <td className="px-2 py-3 text-orange-300">{formatInteger(item.count)}</td>
                  <td className="px-2 py-3 text-white/72">{formatRisk(item.averageRisk)}</td>
                  <td className="px-2 py-3 text-white/72">{formatDecimal(item.maxFrp, 1)}</td>
                  <td className="px-2 py-3 font-semibold text-white">{item.orbitFireScore}</td>
                  <td className="px-2 py-3">
                    <button className="w-full rounded-full border border-white/10 px-2 py-1.5 text-[11px] text-orange-300 hover:border-orange-300/30" onClick={() => onMunicipalitySelect(item)} type="button">
                      Investigar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {active ? (
        <Panel title="Município selecionado">
          <h3 className="text-2xl font-medium text-white">{active.municipio} — {active.uf}</h3>
          <p className="mt-1 text-sm text-white/52">{active.bioma}</p>
          <div className="mt-5 rounded-lg border border-orange-300/18 bg-orange-500/8 p-4">
            <p className="text-sm text-white/56">Índice OrbitFire</p>
            <strong className="mt-1 block text-5xl font-medium text-orange-100">{active.orbitFireScore} / 100</strong>
            <p className="mt-2 text-orange-300">{active.priorityLabel}</p>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <MiniStat label="detecções" value={formatInteger(active.count)} />
            <MiniStat label="pontos distintos" value={formatInteger(active.uniqueCoordinates)} />
            <MiniStat label="risco médio" value={formatRisk(active.averageRisk)} />
            <MiniStat label="FRP máximo" value={`${formatDecimal(active.maxFrp, 1)} MW`} />
          </div>
          <div className="mt-5 space-y-3">
            {active.scoreParts.map((part) => (
              <div key={part.label}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-white/58">{part.label}</span>
                  <span className="text-white/72">{formatDecimal(part.contribution, 1)} pts</span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.06]">
                  <div className="h-full rounded-full bg-gradient-to-r from-orange-600 to-amber-300" style={{ width: `${Math.min(part.value, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      ) : null}

      <Panel title="Risco x detecções por município">
        <ScatterPlot data={municipalities} onSelect={onMunicipalitySelect} />
      </Panel>
    </div>
  );
}

function EnvironmentView({
  metrics,
  municipalities,
  onBiomeFilter,
  onMunicipalitySelect,
  records,
}: {
  metrics: ReturnType<typeof createMetrics>;
  municipalities: MunicipalityAggregate[];
  onBiomeFilter: (bioma: string) => void;
  onMunicipalitySelect: (municipality: MunicipalityAggregate) => void;
  records: FireFocusRecord[];
}) {
  const biomeRisk = riskDistributionByBiome(records);
  const precipitation = precipitationSummary(records);
  const environmentalRanking = municipalities
    .filter((item) => (item.averageRisk ?? 0) >= 0.75 && item.count >= 8)
    .sort(
      (a, b) =>
        (b.averageRisk ?? 0) - (a.averageRisk ?? 0) ||
        (b.averageDryDays ?? 0) - (a.averageDryDays ?? 0),
    )
    .slice(0, 8);

  return (
    <div className="space-y-5 orbitfire-dashboard-enter">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard icon={<Gauge size={18} />} label="Risco médio válido" value={formatRisk(metrics.averageRisk)} />
        <MetricCard icon={<Sun size={18} />} label="Média de dias sem chuva" value={`${formatDecimal(metrics.averageDryDays, 1)} dias`} />
        <MetricCard icon={<Droplets size={18} />} label="Precipitação zero" value={`${formatDecimal(metrics.zeroPrecipitationPercent, 1)}%`} />
        <MetricCard icon={<Activity size={18} />} label="Bioma com mais detecções" value={metrics.topBiome?.label ?? "Não disponível"} detail={metrics.topBiome ? `${formatInteger(metrics.topBiome.count)} detecções` : undefined} />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Biomas sob exposição">
          <StackedRiskByBiome data={biomeRisk} onBiomeSelect={onBiomeFilter} />
        </Panel>
        <Panel title="Dias sem chuva x risco de fogo">
          <ScatterPlot data={municipalities} mode="environment" onSelect={onMunicipalitySelect} />
        </Panel>
        <Panel title="Precipitação registrada">
          <SegmentedBar data={precipitation} />
        </Panel>
        <Panel title="Municípios para acompanhamento ambiental">
          <RankingList municipalities={environmentalRanking} onSelect={onMunicipalitySelect} />
        </Panel>
      </div>
    </div>
  );
}

function OrbitalCoverageView({
  metrics,
  onSatelliteFilter,
  records,
}: {
  metrics: ReturnType<typeof createMetrics>;
  onSatelliteFilter: (satellite: string) => void;
  records: FireFocusRecord[];
}) {
  const topSatellite = metrics.satelliteRanking[0];
  const observedTimes = useMemo(
    () =>
      records
        .map((record) => record.dataHoraGmt.slice(11, 16))
        .filter(Boolean)
        .sort(),
    [records],
  );
  const periodStart = observedTimes[0] ?? "00:00";
  const periodEnd = observedTimes.at(-1) ?? "23:52";
  const satelliteHourly = useMemo(
    () =>
      metrics.satelliteRanking.slice(0, 7).map((satellite) => ({
        satellite: satellite.label,
        hours: Array.from({ length: 24 }).map((_, hour) =>
          records.filter((record) => record.satelite === satellite.label && record.horaGmt === hour).length,
        ),
      })),
    [metrics.satelliteRanking, records],
  );
  const max = Math.max(...satelliteHourly.flatMap((item) => item.hours), 1);
  const [orbitalPlayback, setOrbitalPlayback] = useState<"idle" | "playing" | "paused" | "complete">("idle");
  const [orbitalHour, setOrbitalHour] = useState<number | null>(null);
  const playbackVisible = orbitalPlayback !== "idle";
  const activeSensors = useMemo(
    () =>
      orbitalHour === null
        ? []
        : [
            ...new Set(
              records
                .filter((record) => record.horaGmt === orbitalHour)
                .map((record) => record.satelite),
            ),
          ].sort((a, b) => a.localeCompare(b, "pt-BR")),
    [orbitalHour, records],
  );
  const processedDetections = useMemo(
    () =>
      orbitalHour === null
        ? metrics.total
        : records.filter((record) => record.horaGmt <= orbitalHour).length,
    [metrics.total, orbitalHour, records],
  );
  const activatedSensors = useMemo(
    () =>
      orbitalHour === null
        ? metrics.satelliteRanking.length
        : new Set(
            records
              .filter((record) => record.horaGmt <= orbitalHour)
              .map((record) => record.satelite),
          ).size,
    [metrics.satelliteRanking.length, orbitalHour, records],
  );
  const activeSensorLabel =
    activeSensors.length > 0
      ? activeSensors.slice(0, 2).join(", ")
      : playbackVisible
        ? "Sem atividade"
        : topSatellite?.label ?? "Não disponível";
  const activeSensorDetail =
    playbackVisible && activeSensors.length > 2
      ? `+${activeSensors.length - 2} sensores ativos`
      : playbackVisible
        ? "sensor no horário atual"
        : topSatellite
          ? `${formatInteger(topSatellite.count)} detecções`
          : undefined;
  const orbitalStatus =
    orbitalPlayback === "complete"
      ? `COBERTURA PROCESSADA // ${formatInteger(metrics.total)} DETECÇÕES`
      : playbackVisible && activeSensors.length
        ? `RECEBENDO SINAL // ${activeSensorLabel}`
        : playbackVisible
          ? "SINCRONIZANDO SENSORES ORBITAIS"
          : "OBSERVAÇÃO ESPACIAL";

  useEffect(() => {
    if (orbitalPlayback !== "playing") return;
    const timer = setInterval(() => {
      setOrbitalHour((current) => {
        const next = current === null ? 0 : current + 1;
        if (next >= 23) {
          setOrbitalPlayback("complete");
          return 23;
        }
        return next;
      });
    }, 390);
    return () => clearInterval(timer);
  }, [orbitalPlayback]);

  const toggleOrbitalPlayback = () => {
    if (orbitalPlayback === "playing") {
      setOrbitalPlayback("paused");
      return;
    }
    if (orbitalPlayback === "complete") {
      setOrbitalHour(0);
    } else if (orbitalHour === null) {
      setOrbitalHour(0);
    }
    setOrbitalPlayback("playing");
  };

  return (
    <div className="space-y-5 orbitfire-dashboard-enter">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          detail={playbackVisible ? "sensores ativados até agora" : undefined}
          icon={<Satellite size={18} />}
          label="Satélites presentes"
          value={formatInteger(playbackVisible ? activatedSensors : metrics.satelliteRanking.length)}
        />
        <MetricCard
          accent={playbackVisible && activeSensors.length > 0}
          detail={activeSensorDetail}
          icon={<RadioTower size={18} />}
          label={playbackVisible ? "Sensor ativo" : "Sensor com mais registros"}
          value={activeSensorLabel}
        />
        <MetricCard
          icon={<Activity size={18} />}
          label="Período observado"
          value={playbackVisible ? `${String(orbitalHour ?? 0).padStart(2, "0")}:00 GMT` : `${periodStart} — ${periodEnd} GMT`}
        />
        <MetricCard
          detail={orbitalPlayback === "complete" ? "Cobertura processada" : undefined}
          icon={<Flame size={18} />}
          label={playbackVisible ? "Detecções processadas" : "Total de detecções"}
          value={formatInteger(playbackVisible ? processedDetections : metrics.total)}
        />
      </div>
      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <Panel title="Detecções por satélite">
          <HorizontalBarChart
            activeLabels={activeSensors}
            data={metrics.satelliteRanking}
            dimInactive={playbackVisible}
            onClick={onSatelliteFilter}
          />
        </Panel>
        <Panel
          action={
            <OrbitalPlaybackControls
              active={orbitalPlayback === "playing"}
              complete={orbitalPlayback === "complete"}
              onReset={() => {
                setOrbitalPlayback("idle");
                setOrbitalHour(null);
              }}
              onToggle={toggleOrbitalPlayback}
            />
          }
          title="Timeline por sensor"
        >
          {orbitalPlayback !== "idle" ? (
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-300/18 bg-orange-500/10 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-orange-200">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-300 shadow-[0_0_10px_rgba(251,146,60,0.9)]" />
              SINCRONIZANDO SENSORES // {String(orbitalHour ?? 0).padStart(2, "0")}:00 GMT
            </div>
          ) : null}
          <div className="relative space-y-3">
            {orbitalHour !== null ? (
              <span
                className="pointer-events-none absolute bottom-0 top-0 z-10 w-px bg-orange-200 shadow-[0_0_16px_rgba(251,191,36,0.72)]"
                style={{ left: `calc(82px + 0.75rem + ${(orbitalHour / 23) * 100}%)` }}
              />
            ) : null}
            {satelliteHourly.map((row) => {
              const rowActive = activeSensors.includes(row.satellite);
              return (
              <div
                className={`grid grid-cols-[82px_1fr] items-center gap-3 transition ${
                  playbackVisible && !rowActive ? "opacity-45" : ""
                } ${rowActive ? "orbitfire-sensor-row-active" : ""}`}
                key={row.satellite}
              >
                <span className="truncate font-mono text-[10px] text-white/48">{row.satellite}</span>
                <div className="flex h-5 items-end gap-1">
                  {row.hours.map((count, hour) => (
                    <span
                      className={`orbitfire-orbital-block flex-1 rounded-sm bg-orange-500/70 ${
                        orbitalHour !== null && hour <= orbitalHour ? "orbitfire-orbital-block-active" : ""
                      }`}
                      key={hour}
                      style={{ height: `${Math.max((count / max) * 100, count ? 12 : 3)}%`, opacity: count ? 1 : 0.18 }}
                      title={`${row.satellite} • ${hour}:00 GMT • ${count} detecções`}
                    />
                  ))}
                </div>
              </div>
              );
            })}
          </div>
          <div className="mt-3 ml-[94px] flex justify-between font-mono text-[10px] text-white/36">
            <span>00:00</span>
            <span>04:00</span>
            <span>08:00</span>
            <span>12:00</span>
            <span>16:00</span>
            <span>20:00</span>
            <span>23:59 GMT</span>
          </div>
          <p className="mt-5 text-xs leading-6 text-white/42">
            Os registros representam detecções capturadas por diferentes sensores e horários de observação. A visualização não indica evolução contínua de um incêndio específico.
          </p>
        </Panel>
      </div>
      <Panel className={playbackVisible ? "orbitfire-orbital-observation-active" : ""} title="Observação espacial">
        <div className="flex flex-col gap-5 md:flex-row md:items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-orange-300/20 bg-orange-500/10 text-orange-300 shadow-[0_0_34px_rgba(249,115,22,0.2)]">
            <Satellite size={28} />
          </div>
          <div>
            <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-orange-300">
              {orbitalStatus}
            </p>
            <p className="max-w-3xl text-sm leading-7 text-white/56">
              Diferentes sensores orbitais ampliam a capacidade de observar focos em grandes extensões territoriais. O OrbitFire organiza esses registros em uma única interface de análise.
            </p>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function RankingList({
  municipalities,
  onSelect,
}: {
  municipalities: MunicipalityAggregate[];
  onSelect: (municipality: MunicipalityAggregate) => void;
}) {
  return (
    <div className="mt-5 space-y-2">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-orange-300">
        Ranking rápido
      </p>
      {municipalities.map((item, index) => (
        <button
          className="grid w-full grid-cols-[28px_1fr_34px_54px] items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition hover:bg-white/[0.04]"
          key={item.id}
          onClick={() => onSelect(item)}
          type="button"
        >
          <span className="font-mono text-xs text-orange-300">{String(index + 1).padStart(2, "0")}</span>
          <span className="truncate text-white/76">{item.municipio}</span>
          <span className="text-xs text-white/42">{item.uf}</span>
          <span className="text-right text-orange-300">{formatInteger(item.count)}</span>
        </button>
      ))}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <strong className="block text-lg font-medium text-orange-200">{value}</strong>
      <span className="mt-1 block text-[10px] leading-4 text-white/44">{label}</span>
    </div>
  );
}

function SummaryRows({
  rows,
}: {
  rows: Array<[string, string, ComponentType<{ size?: number; className?: string }>]>;
}) {
  return (
    <div className="space-y-3">
      {rows.map(([label, value, Icon]) => (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.025] px-3 py-3" key={label}>
          <span className="flex items-center gap-3 text-sm text-white/58">
            <Icon className="text-orange-300" size={17} />
            {label}
          </span>
          <span className="text-right text-sm font-medium text-white">{value}</span>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex min-h-[520px] items-center justify-center rounded-lg border border-white/10 bg-[#0b0b0b]/82 p-8 text-center">
      <div>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-orange-300/20 bg-orange-500/10 text-orange-300">
          <LocateFixed size={24} />
        </div>
        <h2 className="mt-6 text-2xl font-medium text-white">
          Nenhuma detecção encontrada
        </h2>
        <p className="mt-3 max-w-md text-sm leading-7 text-white/52">
          Nenhuma detecção encontrada para os filtros selecionados.
        </p>
        <button className="mt-6 rounded-full bg-orange-600 px-5 py-3 text-sm font-semibold text-white" onClick={onClear} type="button">
          Limpar filtros
        </button>
      </div>
    </div>
  );
}
