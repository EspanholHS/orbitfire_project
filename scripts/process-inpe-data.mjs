import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const INPUT = resolve("data/raw/focos_diario_br_20260529.csv");
const PUBLIC_OUTPUT = resolve("public/data/focos-processados.json");
const SRC_OUTPUT = resolve("src/data/focos-processados.json");

const stateUf = {
  Acre: "AC",
  Alagoas: "AL",
  Amapá: "AP",
  Amazonas: "AM",
  Bahia: "BA",
  Ceará: "CE",
  "Distrito Federal": "DF",
  "Espírito Santo": "ES",
  Goiás: "GO",
  Maranhão: "MA",
  "Mato Grosso": "MT",
  "Mato Grosso Do Sul": "MS",
  "Minas Gerais": "MG",
  Pará: "PA",
  Paraíba: "PB",
  Paraná: "PR",
  Pernambuco: "PE",
  Piauí: "PI",
  "Rio De Janeiro": "RJ",
  "Rio Grande Do Norte": "RN",
  "Rio Grande Do Sul": "RS",
  Rondônia: "RO",
  Roraima: "RR",
  "Santa Catarina": "SC",
  "São Paulo": "SP",
  Sergipe: "SE",
  Tocantins: "TO",
};

const lowerWords = new Set(["da", "das", "de", "do", "dos", "e"]);

function parseCsv(text) {
  const rows = [];
  let current = "";
  let row = [];
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (quoted && next === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (char === "," && !quoted) {
      row.push(current.trim());
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(current.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      current = "";
      continue;
    }

    current += char;
  }

  if (current.length || row.length) {
    row.push(current.trim());
    if (row.some(Boolean)) rows.push(row);
  }

  return rows;
}

function titleCase(value) {
  return value
    .trim()
    .toLocaleLowerCase("pt-BR")
    .split(/\s+/)
    .map((word, index) => {
      if (index > 0 && lowerWords.has(word)) return word;
      return word.charAt(0).toLocaleUpperCase("pt-BR") + word.slice(1);
    })
    .join(" ");
}

function numberOrNull(value) {
  if (value === undefined || value === null || value.trim() === "") return null;
  const parsed = Number(value.replace(",", "."));
  if (!Number.isFinite(parsed) || parsed === -999) return null;
  return parsed;
}

function riskLevel(value) {
  if (value === null || value < 0 || value > 1) return "sem-classificacao";
  if (value <= 0.25) return "baixo";
  if (value <= 0.5) return "moderado";
  if (value <= 0.75) return "alto";
  return "muito-alto";
}

function formatDateGmt(value) {
  const [date, time = "00:00:00"] = value.split(" ");
  const [year, month, day] = date.split("-");
  const [hour, minute] = time.split(":");
  return `${day}/${month}/${year} • ${hour}:${minute} GMT`;
}

function hourFromGmt(value) {
  return Number(value.split(" ")[1]?.split(":")[0] ?? 0);
}

function aggregateCount(records, key) {
  const map = new Map();
  for (const record of records) {
    const value = key(record);
    map.set(value, (map.get(value) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "pt-BR"));
}

function average(values) {
  const valid = values.filter((value) => value !== null && Number.isFinite(value));
  if (!valid.length) return null;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function round(value, digits = 1) {
  if (value === null) return null;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

const csv = readFileSync(INPUT, "utf8");
const [headers, ...lines] = parseCsv(csv);
const headerIndex = Object.fromEntries(headers.map((header, index) => [header, index]));

const records = lines.map((line) => {
  const get = (column) => line[headerIndex[column]] ?? "";
  const estado = titleCase(get("estado"));
  const municipio = titleCase(get("municipio"));
  const bioma = titleCase(get("bioma"));
  const riscoFogo = numberOrNull(get("risco_fogo"));
  const numeroDiasSemChuva = numberOrNull(get("numero_dias_sem_chuva"));
  const precipitacao = numberOrNull(get("precipitacao"));
  const frp = numberOrNull(get("frp"));
  const dataHoraGmt = get("data_hora_gmt");

  return {
    id: get("id"),
    lat: Number(get("lat")),
    lon: Number(get("lon")),
    dataHoraGmt,
    dataHoraGmtFormatada: formatDateGmt(dataHoraGmt),
    horaGmt: hourFromGmt(dataHoraGmt),
    satelite: get("satelite"),
    municipio,
    estado,
    uf: stateUf[estado] ?? estado.slice(0, 2).toLocaleUpperCase("pt-BR"),
    pais: titleCase(get("pais")),
    municipioId: Number(get("municipio_id")),
    estadoId: Number(get("estado_id")),
    paisId: Number(get("pais_id")),
    numeroDiasSemChuva,
    precipitacao,
    riscoFogo,
    riscoVisual: riskLevel(riscoFogo),
    bioma,
    frp,
  };
});

const uniqueCoordinates = new Set(records.map((record) => `${record.lat.toFixed(6)},${record.lon.toFixed(6)}`));
const riskDistribution = aggregateCount(records, (record) => record.riscoVisual);
const stateRanking = aggregateCount(records, (record) => record.estado);
const biomeRanking = aggregateCount(records, (record) => record.bioma);
const satelliteRanking = aggregateCount(records, (record) => record.satelite);
const municipalityRanking = aggregateCount(records, (record) => `${record.municipio}|${record.uf}|${record.bioma}`).map((item) => {
  const [municipio, uf, bioma] = item.label.split("|");
  return { municipio, uf, bioma, count: item.count };
});

const validRiskAverage = average(records.map((record) => record.riscoFogo));
const validDryDaysAverage = average(records.map((record) => record.numeroDiasSemChuva));
const validPrecipitation = records.filter((record) => record.precipitacao !== null);
const zeroPrecipitationPercent =
  validPrecipitation.length > 0
    ? (validPrecipitation.filter((record) => record.precipitacao === 0).length / validPrecipitation.length) * 100
    : null;
const maxFrpRecord = records.reduce((best, record) => {
  if (record.frp === null) return best;
  if (!best || record.frp > best.frp) return record;
  return best;
}, null);

const summary = {
  totalDetections: records.length,
  uniqueCoordinates: uniqueCoordinates.size,
  states: stateRanking.length,
  municipalities: new Set(records.map((record) => `${record.municipio}|${record.uf}`)).size,
  biomes: biomeRanking.length,
  satellites: satelliteRanking.length,
  veryHighRisk: records.filter((record) => record.riscoFogo !== null && record.riscoFogo > 0.75).length,
  averageRisk: round(validRiskAverage, 3),
  averageDryDays: round(validDryDaysAverage, 1),
  zeroPrecipitationPercent: round(zeroPrecipitationPercent, 1),
  maxFrp: round(maxFrpRecord?.frp ?? null, 1),
  maxFrpMunicipality: maxFrpRecord ? maxFrpRecord.municipio : null,
  periodStart: records[0]?.dataHoraGmtFormatada ?? null,
  periodEnd: records.at(-1)?.dataHoraGmtFormatada ?? null,
  riskDistribution: Object.fromEntries(riskDistribution.map((item) => [item.label, item.count])),
  stateRanking: stateRanking.slice(0, 10),
  biomeRanking,
  satelliteRanking,
  municipalityRanking: municipalityRanking.slice(0, 20),
};

const payload = {
  generatedAt: new Date().toISOString(),
  source: {
    label: "Programa Queimadas - INPE",
    analysisDate: "2026-05-29",
    csvFileName: "focos_diario_br_20260529.csv",
  },
  summary,
  records,
};

for (const output of [PUBLIC_OUTPUT, SRC_OUTPUT]) {
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, `${JSON.stringify(payload)}\n`, "utf8");
}

console.log("OrbitFire INPE data processed");
console.table({
  totalDetections: summary.totalDetections,
  uniqueCoordinates: summary.uniqueCoordinates,
  states: summary.states,
  municipalities: summary.municipalities,
  biomes: summary.biomes,
  satellites: summary.satellites,
  veryHighRisk: summary.veryHighRisk,
  averageRisk: summary.averageRisk,
  averageDryDays: summary.averageDryDays,
  zeroPrecipitationPercent: summary.zeroPrecipitationPercent,
  maxFrp: summary.maxFrp,
});
console.log("Top states:", summary.stateRanking.slice(0, 5));
console.log("Top biomes:", summary.biomeRanking);
console.log("Top satellites:", summary.satelliteRanking);
console.log("Top municipalities:", summary.municipalityRanking.slice(0, 8));
