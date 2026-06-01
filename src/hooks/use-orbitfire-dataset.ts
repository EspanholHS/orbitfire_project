"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { adaptOrbitFireDailyPoints, calculateDataCoverage } from "@/adapters/orbitfire-data-adapter";
import { fetchAvailablePeriods, fetchDailyPoints } from "@/services/orbitfire-api";
import type { FireDataPayload } from "@/types/fire-focus";
import type { AvailableDailyPeriod, DataCoverage, DataSourceKind } from "@/types/orbitfire-api";

export const REFERENCE_ANALYSIS_DATE = "2026-05-29";

type CachedDataset = {
  data: FireDataPayload;
  source: DataSourceKind;
};

type DatasetError = {
  date: string;
  message: string;
} | null;

const datasetCache = new Map<string, CachedDataset>();

function formatDateLabel(date: string) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

function fallbackPeriod(date: string): AvailableDailyPeriod {
  return {
    date,
    label: formatDateLabel(date),
    period: date,
  };
}

export function useOrbitFireDataset(fallbackData: FireDataPayload) {
  const fallbackCoverage = useMemo(
    () => calculateDataCoverage(fallbackData.records),
    [fallbackData.records],
  );
  const [data, setData] = useState<FireDataPayload>(fallbackData);
  const [source, setSource] = useState<DataSourceKind>("local");
  const [coverage, setCoverage] = useState<DataCoverage>(fallbackCoverage);
  const [periods, setPeriods] = useState<AvailableDailyPeriod[]>([
    fallbackPeriod(fallbackData.source.analysisDate),
  ]);
  const [selectedDate, setSelectedDate] = useState(fallbackData.source.analysisDate);
  const [loading, setLoading] = useState(true);
  const [loadingDate, setLoadingDate] = useState<string | null>(fallbackData.source.analysisDate);
  const [error, setError] = useState<DatasetError>(null);
  const requestId = useRef(0);

  const applyDataset = useCallback((next: CachedDataset, date: string) => {
    setData(next.data);
    setSource(next.source);
    setCoverage(calculateDataCoverage(next.data.records));
    setSelectedDate(date);
    setError(null);
  }, []);

  const loadDate = useCallback(
    async (date: string) => {
      const currentRequest = requestId.current + 1;
      requestId.current = currentRequest;
      setLoading(true);
      setLoadingDate(date);

      const cached = datasetCache.get(date);
      if (cached) {
        applyDataset(cached, date);
        setLoading(false);
        setLoadingDate(null);
        return true;
      }

      try {
        const points = await fetchDailyPoints(date);
        const apiData = adaptOrbitFireDailyPoints(points, date);
        const next: CachedDataset = { data: apiData, source: "api" };
        datasetCache.set(date, next);
        if (requestId.current === currentRequest) {
          applyDataset(next, date);
          setLoading(false);
          setLoadingDate(null);
        }
        return true;
      } catch {
        if (date === REFERENCE_ANALYSIS_DATE) {
          const fallback: CachedDataset = { data: fallbackData, source: "local" };
          datasetCache.set(date, fallback);
          if (requestId.current === currentRequest) {
            applyDataset(fallback, date);
            setLoading(false);
            setLoadingDate(null);
          }
          return true;
        }

        if (requestId.current === currentRequest) {
          setError({
            date,
            message:
              "Nao foi possivel carregar os dados desta data pela API. Selecione outro periodo ou retorne a analise de referencia.",
          });
          setLoading(false);
          setLoadingDate(null);
        }
        return false;
      }
    },
    [applyDataset, fallbackData],
  );

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      let availablePeriods: AvailableDailyPeriod[] = [fallbackPeriod(REFERENCE_ANALYSIS_DATE)];

      try {
        const fetchedPeriods = await fetchAvailablePeriods();
        if (fetchedPeriods.length > 0) availablePeriods = fetchedPeriods;
      } catch {
        availablePeriods = [fallbackPeriod(REFERENCE_ANALYSIS_DATE)];
      }

      if (cancelled) return;
      setPeriods(availablePeriods);

      const initialDate = availablePeriods.some((period) => period.date === REFERENCE_ANALYSIS_DATE)
        ? REFERENCE_ANALYSIS_DATE
        : availablePeriods[0]?.date ?? REFERENCE_ANALYSIS_DATE;

      await loadDate(initialDate);
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [loadDate]);

  const selectedPeriod = periods.find((period) => period.date === selectedDate) ?? fallbackPeriod(selectedDate);

  return {
    coverage,
    data,
    error,
    loading,
    loadingDate,
    periods,
    resetToReference: () => loadDate(REFERENCE_ANALYSIS_DATE),
    selectDate: loadDate,
    selectedDate,
    selectedPeriod,
    source,
  };
}
