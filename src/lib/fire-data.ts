import rawData from "@/data/focos-processados.json";
import type { FireDataPayload } from "@/types/fire-focus";

export const fireData = rawData as FireDataPayload;

export const fireRecords = fireData.records;

export const fireSource = fireData.source;

export const fireSummary = fireData.summary;
