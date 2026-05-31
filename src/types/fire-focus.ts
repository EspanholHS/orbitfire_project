export type VisualRiskLevel =
  | "baixo"
  | "moderado"
  | "alto"
  | "muito-alto"
  | "sem-classificacao";

export type DashboardView =
  | "overview"
  | "map"
  | "prioritization"
  | "environment"
  | "orbital";

export type MapMode = "concentration" | "risk" | "frp";

export type PrecipitationFilter = "all" | "zero" | "positive" | "unavailable";

export type FireFocusRecord = {
  id: string;
  lat: number;
  lon: number;
  dataHoraGmt: string;
  dataHoraGmtFormatada: string;
  horaGmt: number;
  satelite: string;
  municipio: string;
  estado: string;
  uf: string;
  pais: string;
  municipioId: number;
  estadoId: number;
  paisId: number;
  numeroDiasSemChuva: number | null;
  precipitacao: number | null;
  riscoFogo: number | null;
  riscoVisual: VisualRiskLevel;
  bioma: string;
  frp: number | null;
};

export type FireDataSummary = {
  totalDetections: number;
  uniqueCoordinates: number;
  states: number;
  municipalities: number;
  biomes: number;
  satellites: number;
  veryHighRisk: number;
  averageRisk: number | null;
  averageDryDays: number | null;
  zeroPrecipitationPercent: number | null;
  maxFrp: number | null;
  maxFrpMunicipality: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  riskDistribution: Record<VisualRiskLevel, number>;
  stateRanking: Array<{ label: string; count: number }>;
  biomeRanking: Array<{ label: string; count: number }>;
  satelliteRanking: Array<{ label: string; count: number }>;
  municipalityRanking: Array<{
    municipio: string;
    uf: string;
    bioma: string;
    count: number;
  }>;
};

export type FireDataPayload = {
  generatedAt: string;
  source: {
    label: string;
    analysisDate: string;
    csvFileName: string;
  };
  summary: FireDataSummary;
  records: FireFocusRecord[];
};

export type DashboardFilters = {
  estado: string;
  municipio: string;
  bioma: string;
  risco: VisualRiskLevel | "all";
  satelite: string;
  minDryDays: number | null;
  maxDryDays: number | null;
  precipitation: PrecipitationFilter;
  minFrp: number | null;
  maxFrp: number | null;
  hour: number | null;
};

export type MunicipalityAggregate = {
  id: string;
  municipio: string;
  estado: string;
  uf: string;
  bioma: string;
  count: number;
  uniqueCoordinates: number;
  averageRisk: number | null;
  maxRisk: number | null;
  maxFrp: number | null;
  totalFrp: number;
  averageDryDays: number | null;
  zeroPrecipitationPercent: number | null;
  lat: number;
  lon: number;
  orbitFireScore: number;
  priorityLabel: string;
  scoreParts: Array<{
    label: string;
    value: number;
    weight: number;
    contribution: number;
    available: boolean;
  }>;
};
