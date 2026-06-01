import {
  groupCount,
  average,
  uniqueCoordinateCount,
} from "@/lib/fire-metrics";
import type {
  FireDataPayload,
  FireDataSummary,
  FireFocusRecord,
  VisualRiskLevel,
} from "@/types/fire-focus";
import type { DataCoverage, OrbitFireDailyPoint } from "@/types/orbitfire-api";

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed === -999) return null;
  return parsed;
}

function toInteger(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function visualRisk(value: number | null): VisualRiskLevel {
  if (value === null || value < 0 || value > 1) return "sem-classificacao";
  if (value <= 0.25) return "baixo";
  if (value <= 0.5) return "moderado";
  if (value <= 0.75) return "alto";
  return "muito-alto";
}

function titleCase(value: string | null | undefined) {
  if (!value) return "Nao disponivel";
  return value
    .toLocaleLowerCase("pt-BR")
    .split(" ")
    .filter(Boolean)
    .map((word) => {
      if (["de", "da", "do", "das", "dos", "e"].includes(word)) return word;
      return word.charAt(0).toLocaleUpperCase("pt-BR") + word.slice(1);
    })
    .join(" ");
}

function normalizeBiome(value: string | null | undefined) {
  return titleCase(value);
}

function formatDateTimeGmt(value: string) {
  const [datePart, timePart = "00:00:00"] = value.split(" ");
  const [year, month, day] = datePart.split("-");
  const hourMinute = timePart.slice(0, 5);
  return {
    formatted: `${day}/${month}/${year} • ${hourMinute} GMT`,
    hour: Number(timePart.slice(0, 2)) || 0,
  };
}

function formatDateLabel(date: string) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

function mapApiPoint(item: OrbitFireDailyPoint): FireFocusRecord | null {
  const lat = toNumber(item.latitude);
  const lon = toNumber(item.longitude);
  if (lat === null || lon === null || !item.dateTimeGmt) return null;

  const riscoFogo = toNumber(item.fireRisk);
  const { formatted, hour } = formatDateTimeGmt(item.dateTimeGmt);

  return {
    bioma: normalizeBiome(item.biome),
    dataHoraGmt: item.dateTimeGmt,
    dataHoraGmtFormatada: formatted,
    estado: titleCase(item.state),
    estadoId: toInteger(item.stateId),
    frp: toNumber(item.frp),
    horaGmt: hour,
    id: item.id,
    lat,
    lon,
    municipio: titleCase(item.municipality),
    municipioId: toInteger(item.municipalityId),
    numeroDiasSemChuva: toNumber(item.daysWithoutRain),
    pais: item.country ?? "Brasil",
    paisId: toInteger(item.countryId),
    precipitacao: toNumber(item.precipitation),
    riscoFogo,
    riscoVisual: visualRisk(riscoFogo),
    satelite: item.satellite ?? "Nao disponivel",
    uf: item.uf ?? "",
  };
}

export function calculateDataCoverage(records: FireFocusRecord[]): DataCoverage {
  const total = records.length || 1;
  const ratio = (count: number) => (count / total) * 100;
  const coverage = {
    dryDays: ratio(records.filter((record) => record.numeroDiasSemChuva !== null).length),
    frp: ratio(records.filter((record) => record.frp !== null).length),
    precipitation: ratio(records.filter((record) => record.precipitacao !== null).length),
    risk: ratio(records.filter((record) => record.riscoFogo !== null).length),
  };

  return {
    ...coverage,
    hasEnvironmentalGap:
      coverage.risk < 80 || coverage.dryDays < 80 || coverage.precipitation < 80,
  };
}

function createSummary(records: FireFocusRecord[], analysisDate: string): FireDataSummary {
  const validPrecipitation = records.filter((record) => record.precipitacao !== null);
  const zeroPrecipitationPercent =
    validPrecipitation.length > 0
      ? (validPrecipitation.filter((record) => record.precipitacao === 0).length /
          validPrecipitation.length) *
        100
      : null;
  const maxFrpRecord = records.reduce<FireFocusRecord | null>((best, record) => {
    if (record.frp === null) return best;
    if (!best || record.frp > (best.frp ?? 0)) return record;
    return best;
  }, null);
  const periodTimes = records
    .map((record) => ({
      formatted: record.dataHoraGmtFormatada,
      raw: record.dataHoraGmt,
    }))
    .filter((record) => Boolean(record.formatted && record.raw))
    .sort((a, b) => a.raw.localeCompare(b.raw));
  const riskDistribution = records.reduce(
    (acc, record) => ({
      ...acc,
      [record.riscoVisual]: acc[record.riscoVisual] + 1,
    }),
    {
      alto: 0,
      baixo: 0,
      moderado: 0,
      "muito-alto": 0,
      "sem-classificacao": 0,
    } as Record<VisualRiskLevel, number>,
  );

  return {
    averageDryDays: average(records.map((record) => record.numeroDiasSemChuva)),
    averageRisk: average(records.map((record) => record.riscoFogo)),
    biomeRanking: groupCount(records, (record) => record.bioma),
    biomes: new Set(records.map((record) => record.bioma)).size,
    maxFrp: maxFrpRecord?.frp ?? null,
    maxFrpMunicipality: maxFrpRecord?.municipio ?? null,
    municipalities: new Set(records.map((record) => `${record.municipio}|${record.uf}`)).size,
    municipalityRanking: groupCount(records, (record) => `${record.municipio}|${record.uf}|${record.bioma}`)
      .map((item) => {
        const [municipio, uf, bioma] = item.label.split("|");
        return { bioma, count: item.count, municipio, uf };
      }),
    periodEnd: periodTimes.at(-1)?.formatted ?? `${formatDateLabel(analysisDate)} • 00:00 GMT`,
    periodStart: periodTimes[0]?.formatted ?? `${formatDateLabel(analysisDate)} • 00:00 GMT`,
    riskDistribution,
    satelliteRanking: groupCount(records, (record) => record.satelite),
    satellites: new Set(records.map((record) => record.satelite)).size,
    stateRanking: groupCount(records, (record) => record.estado),
    states: new Set(records.map((record) => record.estado)).size,
    totalDetections: records.length,
    uniqueCoordinates: uniqueCoordinateCount(records),
    veryHighRisk: records.filter(
      (record) => record.riscoFogo !== null && record.riscoFogo > 0.75,
    ).length,
    zeroPrecipitationPercent,
  };
}

export function adaptOrbitFireDailyPoints(
  points: OrbitFireDailyPoint[],
  date: string,
): FireDataPayload {
  const records = points
    .map(mapApiPoint)
    .filter((record): record is FireFocusRecord => record !== null);

  return {
    generatedAt: new Date().toISOString(),
    records,
    source: {
      analysisDate: date,
      csvFileName: `api-orbitfire-${date}.json`,
      label: "API OrbitFire",
    },
    summary: createSummary(records, date),
  };
}
