import type {
  DashboardFilters,
  FireFocusRecord,
  PrecipitationFilter,
  VisualRiskLevel,
} from "@/types/fire-focus";

export const defaultFilters: DashboardFilters = {
  estado: "all",
  municipio: "all",
  bioma: "all",
  risco: "all",
  satelite: "all",
  minDryDays: null,
  maxDryDays: null,
  precipitation: "all",
  minFrp: null,
  maxFrp: null,
  hour: null,
};

export const riskOrder: VisualRiskLevel[] = [
  "baixo",
  "moderado",
  "alto",
  "muito-alto",
  "sem-classificacao",
];

export const precipitationLabels: Record<PrecipitationFilter, string> = {
  all: "Todas",
  zero: "Sem precipitação registrada",
  positive: "Com precipitação registrada",
  unavailable: "Dado indisponível",
};

export const riskLabels: Record<VisualRiskLevel, string> = {
  baixo: "Baixo",
  moderado: "Moderado",
  alto: "Alto",
  "muito-alto": "Muito alto",
  "sem-classificacao": "Sem classificação",
};

export const riskColors: Record<VisualRiskLevel, string> = {
  baixo: "#eab308",
  moderado: "#f59e0b",
  alto: "#f97316",
  "muito-alto": "#ef3b1d",
  "sem-classificacao": "#737373",
};

export function filterRecords(
  records: FireFocusRecord[],
  filters: DashboardFilters,
) {
  return records.filter((record) => {
    if (filters.estado !== "all" && record.estado !== filters.estado) return false;
    if (filters.municipio !== "all" && record.municipio !== filters.municipio) {
      return false;
    }
    if (filters.bioma !== "all" && record.bioma !== filters.bioma) return false;
    if (filters.risco !== "all" && record.riscoVisual !== filters.risco) return false;
    if (filters.satelite !== "all" && record.satelite !== filters.satelite) return false;
    if (filters.hour !== null && record.horaGmt !== filters.hour) return false;

    if (
      filters.minDryDays !== null &&
      (record.numeroDiasSemChuva === null ||
        record.numeroDiasSemChuva < filters.minDryDays)
    ) {
      return false;
    }

    if (
      filters.maxDryDays !== null &&
      (record.numeroDiasSemChuva === null ||
        record.numeroDiasSemChuva > filters.maxDryDays)
    ) {
      return false;
    }

    if (
      filters.minFrp !== null &&
      (record.frp === null || record.frp < filters.minFrp)
    ) {
      return false;
    }

    if (
      filters.maxFrp !== null &&
      (record.frp === null || record.frp > filters.maxFrp)
    ) {
      return false;
    }

    if (filters.precipitation === "zero" && record.precipitacao !== 0) return false;
    if (
      filters.precipitation === "positive" &&
      (record.precipitacao === null || record.precipitacao <= 0)
    ) {
      return false;
    }
    if (filters.precipitation === "unavailable" && record.precipitacao !== null) {
      return false;
    }

    return true;
  });
}

export function uniqueSorted(values: string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export function getFilterOptions(records: FireFocusRecord[], filters: DashboardFilters) {
  const states = uniqueSorted(records.map((record) => record.estado));
  const municipalities = uniqueSorted(
    records
      .filter((record) => filters.estado === "all" || record.estado === filters.estado)
      .map((record) => record.municipio),
  );
  const biomes = uniqueSorted(records.map((record) => record.bioma));
  const satellites = uniqueSorted(records.map((record) => record.satelite));

  return { states, municipalities, biomes, satellites };
}

export function getActiveFilterChips(filters: DashboardFilters) {
  const chips: Array<{ key: keyof DashboardFilters; label: string }> = [];
  if (filters.estado !== "all") chips.push({ key: "estado", label: filters.estado });
  if (filters.municipio !== "all") {
    chips.push({ key: "municipio", label: filters.municipio });
  }
  if (filters.bioma !== "all") chips.push({ key: "bioma", label: filters.bioma });
  if (filters.risco !== "all") {
    chips.push({ key: "risco", label: riskLabels[filters.risco] });
  }
  if (filters.satelite !== "all") chips.push({ key: "satelite", label: filters.satelite });
  if (filters.hour !== null) chips.push({ key: "hour", label: `${filters.hour}h GMT` });
  if (filters.minDryDays !== null) {
    chips.push({ key: "minDryDays", label: `Sem chuva ≥ ${filters.minDryDays} dias` });
  }
  if (filters.maxDryDays !== null) {
    chips.push({ key: "maxDryDays", label: `Sem chuva ≤ ${filters.maxDryDays} dias` });
  }
  if (filters.precipitation !== "all") {
    chips.push({ key: "precipitation", label: precipitationLabels[filters.precipitation] });
  }
  if (filters.minFrp !== null) chips.push({ key: "minFrp", label: `FRP ≥ ${filters.minFrp} MW` });
  if (filters.maxFrp !== null) chips.push({ key: "maxFrp", label: `FRP ≤ ${filters.maxFrp} MW` });
  return chips;
}

export function clearFilter(filters: DashboardFilters, key: keyof DashboardFilters) {
  if (key === "risco") return { ...filters, risco: "all" as const };
  if (key === "precipitation") return { ...filters, precipitation: "all" as const };
  if (key === "hour" || key === "minDryDays" || key === "maxDryDays" || key === "minFrp" || key === "maxFrp") {
    return { ...filters, [key]: null };
  }
  return { ...filters, [key]: "all" };
}
