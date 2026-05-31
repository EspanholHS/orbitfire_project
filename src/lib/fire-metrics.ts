import {
  riskLabels,
  riskOrder,
} from "@/lib/fire-filters";
import type {
  FireFocusRecord,
  MunicipalityAggregate,
  VisualRiskLevel,
} from "@/types/fire-focus";

export function formatInteger(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

export function formatDecimal(value: number | null, digits = 1) {
  if (value === null || !Number.isFinite(value)) return "Não disponível";
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

export function formatRisk(value: number | null) {
  if (value === null) return "Não disponível";
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value);
}

export function uniqueCoordinateCount(records: FireFocusRecord[]) {
  return new Set(records.map((record) => `${record.lat.toFixed(6)},${record.lon.toFixed(6)}`)).size;
}

export function average(values: Array<number | null>) {
  const valid = values.filter((value): value is number => value !== null && Number.isFinite(value));
  if (!valid.length) return null;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

export function maxValue(values: Array<number | null>) {
  const valid = values.filter((value): value is number => value !== null && Number.isFinite(value));
  if (!valid.length) return null;
  return Math.max(...valid);
}

export function sumValue(values: Array<number | null>) {
  return values.reduce<number>((sum, value) => sum + (value ?? 0), 0);
}

export function groupCount<T extends string>(
  records: FireFocusRecord[],
  key: (record: FireFocusRecord) => T,
) {
  const map = new Map<T, number>();
  records.forEach((record) => map.set(key(record), (map.get(key(record)) ?? 0) + 1));
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || String(a.label).localeCompare(String(b.label), "pt-BR"));
}

export function createMetrics(records: FireFocusRecord[]) {
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
  const topBiome = groupCount(records, (record) => record.bioma)[0] ?? null;

  return {
    total: records.length,
    uniqueCoordinates: uniqueCoordinateCount(records),
    veryHighRisk: records.filter(
      (record) => record.riscoFogo !== null && record.riscoFogo > 0.75,
    ).length,
    averageRisk: average(records.map((record) => record.riscoFogo)),
    averageDryDays: average(records.map((record) => record.numeroDiasSemChuva)),
    zeroPrecipitationPercent,
    maxFrp: maxFrpRecord?.frp ?? null,
    maxFrpRecord,
    topBiome,
    stateRanking: groupCount(records, (record) => record.estado),
    biomeRanking: groupCount(records, (record) => record.bioma),
    satelliteRanking: groupCount(records, (record) => record.satelite),
    riskDistribution: riskOrder.map((risk) => ({
      label: riskLabels[risk],
      key: risk,
      count: records.filter((record) => record.riscoVisual === risk).length,
    })),
    hourly: Array.from({ length: 24 }).map((_, hour) => ({
      hour,
      count: records.filter((record) => record.horaGmt === hour).length,
    })),
  };
}

function percentile(value: number | null, values: number[]) {
  if (value === null || !values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const lowerOrEqual = sorted.filter((item) => item <= value).length;
  return lowerOrEqual / sorted.length;
}

function priorityLabel(score: number) {
  if (score >= 75) return "Prioridade muito alta";
  if (score >= 50) return "Alta prioridade";
  if (score >= 25) return "Atenção";
  return "Observação";
}

export function aggregateMunicipalities(records: FireFocusRecord[]) {
  const map = new Map<string, FireFocusRecord[]>();
  for (const record of records) {
    const key = `${record.municipio}|${record.uf}|${record.bioma}`;
    const list = map.get(key) ?? [];
    list.push(record);
    map.set(key, list);
  }

  const base = [...map.entries()].map(([key, list]) => {
    const [municipio, uf, bioma] = key.split("|");
    const first = list[0];
    const averageRisk = average(list.map((record) => record.riscoFogo));
    const averageDryDays = average(list.map((record) => record.numeroDiasSemChuva));
    const maxFrp = maxValue(list.map((record) => record.frp));
    const validPrecipitation = list.filter((record) => record.precipitacao !== null);
    const zeroPrecipitationPercent =
      validPrecipitation.length > 0
        ? (validPrecipitation.filter((record) => record.precipitacao === 0).length /
            validPrecipitation.length) *
          100
        : null;

    return {
      id: key,
      municipio,
      estado: first.estado,
      uf,
      bioma,
      count: list.length,
      uniqueCoordinates: uniqueCoordinateCount(list),
      averageRisk,
      maxRisk: maxValue(list.map((record) => record.riscoFogo)),
      maxFrp,
      totalFrp: sumValue(list.map((record) => record.frp)),
      averageDryDays,
      zeroPrecipitationPercent,
      lat: average(list.map((record) => record.lat)) ?? first.lat,
      lon: average(list.map((record) => record.lon)) ?? first.lon,
    };
  });

  const countValues = base.map((item) => item.count);
  const frpValues = base
    .map((item) => item.maxFrp)
    .filter((value): value is number => value !== null);
  const dryValues = base
    .map((item) => item.averageDryDays)
    .filter((value): value is number => value !== null);

  return base
    .map((item): MunicipalityAggregate => {
      const parts = [
        {
          label: "Concentração de detecções",
          value: (percentile(item.count, countValues) ?? 0) * 100,
          weight: 35,
          available: true,
        },
        {
          label: "Risco de fogo",
          value: item.averageRisk === null ? 0 : item.averageRisk * 100,
          weight: 30,
          available: item.averageRisk !== null,
        },
        {
          label: "FRP máximo observado",
          value: (percentile(item.maxFrp, frpValues) ?? 0) * 100,
          weight: 20,
          available: item.maxFrp !== null,
        },
        {
          label: "Dias sem chuva",
          value: (percentile(item.averageDryDays, dryValues) ?? 0) * 100,
          weight: 15,
          available: item.averageDryDays !== null,
        },
      ];
      const availableWeight = parts
        .filter((part) => part.available)
        .reduce((sum, part) => sum + part.weight, 0);
      const scoredParts = parts.map((part) => ({
        ...part,
        contribution:
          part.available && availableWeight > 0
            ? (part.value * part.weight) / availableWeight
            : 0,
      }));
      const score = scoredParts.reduce((sum, part) => sum + part.contribution, 0);

      return {
        ...item,
        orbitFireScore: Math.round(score),
        priorityLabel: priorityLabel(score),
        scoreParts: scoredParts,
      };
    })
    .sort(
      (a, b) =>
        b.orbitFireScore - a.orbitFireScore ||
        b.count - a.count ||
        a.municipio.localeCompare(b.municipio, "pt-BR"),
    );
}

export function riskDistributionByBiome(records: FireFocusRecord[]) {
  const biomes = groupCount(records, (record) => record.bioma).map((item) => item.label);
  return biomes.map((biome) => {
    const biomeRecords = records.filter((record) => record.bioma === biome);
    const risks = Object.fromEntries(
      riskOrder.map((risk) => [
        risk,
        biomeRecords.filter((record) => record.riscoVisual === risk).length,
      ]),
    ) as Record<VisualRiskLevel, number>;
    return {
      biome,
      total: biomeRecords.length,
      risks,
    };
  });
}

export function precipitationSummary(records: FireFocusRecord[]) {
  const zero = records.filter((record) => record.precipitacao === 0).length;
  const positive = records.filter(
    (record) => record.precipitacao !== null && record.precipitacao > 0,
  ).length;
  const unavailable = records.filter((record) => record.precipitacao === null).length;
  return [
    { label: "Sem precipitação registrada", count: zero },
    { label: "Com precipitação registrada", count: positive },
    { label: "Dado indisponível", count: unavailable },
  ];
}
