export type OrbitFirePeriodMode = "daily" | "monthly";

export type OrbitFirePeriod = {
  mode: OrbitFirePeriodMode;
  period: string | null;
  date: string | null;
  month?: string | null;
  key?: string | null;
  sizeBytes?: number | null;
  updatedAt?: string | null;
};

export type OrbitFirePeriodsResponse = {
  updatedAt: string;
  periods: OrbitFirePeriod[];
};

export type OrbitFireDailyPoint = {
  id: string;
  latitude: number | null;
  longitude: number | null;
  dateTimeGmt: string;
  satellite: string | null;
  municipality: string | null;
  state: string | null;
  uf: string | null;
  country: string | null;
  municipalityId: string | number | null;
  stateId: string | number | null;
  countryId: string | number | null;
  daysWithoutRain: number | null;
  precipitation: number | null;
  fireRisk: number | null;
  biome: string | null;
  frp: number | null;
};

export type OrbitFireDailyPointsResponse = {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  content: OrbitFireDailyPoint[];
};

export type AvailableDailyPeriod = {
  date: string;
  label: string;
  period: string | null;
  key?: string | null;
  sizeBytes?: number | null;
  updatedAt?: string | null;
};

export type DataSourceKind = "api" | "local";

export type DataCoverage = {
  risk: number;
  dryDays: number;
  precipitation: number;
  frp: number;
  hasEnvironmentalGap: boolean;
};
