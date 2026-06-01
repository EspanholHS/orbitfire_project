import type {
  AvailableDailyPeriod,
  OrbitFireDailyPoint,
  OrbitFireDailyPointsResponse,
  OrbitFirePeriod,
  OrbitFirePeriodsResponse,
} from "@/types/orbitfire-api";

export const ORBITFIRE_API_BASE_URL =
  process.env.NEXT_PUBLIC_ORBITFIRE_API_URL ?? "https://api.orbitfire.lat";

const DAILY_PAGE_SIZE = 5000;

function apiUrl(path: string, params?: Record<string, string | number>) {
  const url = new URL(path, ORBITFIRE_API_BASE_URL);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
}

function proxyUrl(path: string, params?: Record<string, string | number>) {
  const url = new URL(`/api/orbitfire${path}`, "http://orbitfire.local");
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
  }
  return `${url.pathname}${url.search}`;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`OrbitFire API returned ${response.status}`);
  }
  return response.json() as Promise<T>;
}

async function fetchOrbitFireJson<T>(
  path: string,
  params?: Record<string, string | number>,
): Promise<T> {
  try {
    return await fetchJson<T>(apiUrl(path, params));
  } catch (error) {
    if (typeof window === "undefined") throw error;
    return fetchJson<T>(proxyUrl(path, params));
  }
}

function formatDateLabel(date: string) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

function periodScore(period: OrbitFirePeriod) {
  return {
    hasPeriod: period.period ? 1 : 0,
    sizeBytes: period.sizeBytes ?? 0,
    updatedAt: period.updatedAt ? Date.parse(period.updatedAt) || 0 : 0,
  };
}

function shouldReplacePeriod(current: OrbitFirePeriod, next: OrbitFirePeriod) {
  const currentScore = periodScore(current);
  const nextScore = periodScore(next);

  if (nextScore.hasPeriod !== currentScore.hasPeriod) {
    return nextScore.hasPeriod > currentScore.hasPeriod;
  }
  if (nextScore.updatedAt !== currentScore.updatedAt) {
    return nextScore.updatedAt > currentScore.updatedAt;
  }
  return nextScore.sizeBytes > currentScore.sizeBytes;
}

export async function fetchAvailablePeriods(): Promise<AvailableDailyPeriod[]> {
  const payload = await fetchOrbitFireJson<OrbitFirePeriodsResponse>("/v1/periods");

  const dailyByDate = new Map<string, OrbitFirePeriod>();
  for (const period of payload.periods) {
    if (period.mode !== "daily" || !period.date) continue;
    const current = dailyByDate.get(period.date);
    if (!current || shouldReplacePeriod(current, period)) {
      dailyByDate.set(period.date, period);
    }
  }

  return [...dailyByDate.values()]
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
    .map((period) => ({
      date: period.date as string,
      key: period.key,
      label: formatDateLabel(period.date as string),
      period: period.period,
      sizeBytes: period.sizeBytes,
      updatedAt: period.updatedAt,
    }));
}

async function fetchDailyPage(date: string, page: number) {
  return fetchOrbitFireJson<OrbitFireDailyPointsResponse>("/v1/hotspots/daily/points", {
    date,
    page,
    size: DAILY_PAGE_SIZE,
  });
}

export async function fetchDailyPoints(date: string): Promise<OrbitFireDailyPoint[]> {
  const firstPage = await fetchDailyPage(date, 0);
  const pages = [firstPage];

  if (firstPage.totalPages > 1) {
    const remaining = await Promise.all(
      Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
        fetchDailyPage(date, index + 1),
      ),
    );
    pages.push(...remaining);
  }

  const byId = new Map<string, OrbitFireDailyPoint>();
  for (const page of pages) {
    for (const item of page.content) {
      byId.set(item.id, item);
    }
  }

  return [...byId.values()];
}

export async function fetchDailySummary(_date: string) {
  void _date;
  throw new Error("Daily summary endpoint is not implemented yet.");
}

export async function fetchMonthlySummary(_month: string) {
  void _month;
  throw new Error("Monthly summary endpoint is not implemented yet.");
}
