"use client";

import { Crosshair, Layers, Maximize2, Minus, Plus } from "lucide-react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { riskColors, riskLabels } from "@/lib/fire-filters";
import type {
  FireFocusRecord,
  MapMode,
  MunicipalityAggregate,
  VisualRiskLevel,
} from "@/types/fire-focus";

type Point = { x: number; y: number };
type Bounds = { minX: number; minY: number; maxX: number; maxY: number };
type ViewBox = { x: number; y: number; width: number; height: number };
type CanvasSize = { width: number; height: number; dpr: number };

type GeoGeometry =
  | { type: "Polygon"; coordinates: number[][][] }
  | { type: "MultiPolygon"; coordinates: number[][][][] };

type GeoFeature = {
  type: "Feature";
  properties: { codarea: string };
  geometry: GeoGeometry;
};

type GeoCollection = {
  type: "FeatureCollection";
  features: GeoFeature[];
};

type RenderedState = {
  bounds: Bounds;
  centroid: Point;
  code: string;
  d: string;
  detections: number;
  name: string;
  uf: string;
};

const stateInfoByCode: Record<string, { name: string; uf: string }> = {
  "11": { name: "Rondônia", uf: "RO" },
  "12": { name: "Acre", uf: "AC" },
  "13": { name: "Amazonas", uf: "AM" },
  "14": { name: "Roraima", uf: "RR" },
  "15": { name: "Pará", uf: "PA" },
  "16": { name: "Amapá", uf: "AP" },
  "17": { name: "Tocantins", uf: "TO" },
  "21": { name: "Maranhão", uf: "MA" },
  "22": { name: "Piauí", uf: "PI" },
  "23": { name: "Ceará", uf: "CE" },
  "24": { name: "Rio Grande do Norte", uf: "RN" },
  "25": { name: "Paraíba", uf: "PB" },
  "26": { name: "Pernambuco", uf: "PE" },
  "27": { name: "Alagoas", uf: "AL" },
  "28": { name: "Sergipe", uf: "SE" },
  "29": { name: "Bahia", uf: "BA" },
  "31": { name: "Minas Gerais", uf: "MG" },
  "32": { name: "Espírito Santo", uf: "ES" },
  "33": { name: "Rio de Janeiro", uf: "RJ" },
  "35": { name: "São Paulo", uf: "SP" },
  "41": { name: "Paraná", uf: "PR" },
  "42": { name: "Santa Catarina", uf: "SC" },
  "43": { name: "Rio Grande do Sul", uf: "RS" },
  "50": { name: "Mato Grosso do Sul", uf: "MS" },
  "51": { name: "Mato Grosso", uf: "MT" },
  "52": { name: "Goiás", uf: "GO" },
  "53": { name: "Distrito Federal", uf: "DF" },
};

const riskLegend: VisualRiskLevel[] = [
  "muito-alto",
  "alto",
  "moderado",
  "baixo",
  "sem-classificacao",
];

export function OrbitMap({
  activeMunicipality,
  currentState,
  mode,
  onFocusSelect,
  onModeChange,
  onStateSelect,
  records,
  selectedFocus,
  targetAcquisition,
}: {
  activeMunicipality?: MunicipalityAggregate | null;
  currentState?: string;
  mode: MapMode;
  onFocusSelect: (record: FireFocusRecord) => void;
  onModeChange: (mode: MapMode) => void;
  onStateSelect?: (state: string) => void;
  records: FireFocusRecord[];
  selectedFocus: FireFocusRecord | null;
  targetAcquisition?: { detail: string; subtitle: string; title: string } | null;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragRef = useRef<{
    moved: boolean;
    startX: number;
    startY: number;
    viewBox: ViewBox;
  } | null>(null);
  const statePressRef = useRef<{
    code: string;
    startX: number;
    startY: number;
  } | null>(null);
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({
    dpr: 1,
    height: 1,
    width: 1,
  });
  const [geoJson, setGeoJson] = useState<GeoCollection | null>(null);
  const [hoveredState, setHoveredState] = useState<RenderedState | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [viewBox, setViewBox] = useState<ViewBox | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/geo/brasil-estados.geojson")
      .then((response) => response.json())
      .then((data: GeoCollection) => {
        if (active) setGeoJson(data);
      })
      .catch(() => {
        if (active) setGeoJson(null);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      const rect = entry.contentRect;
      setCanvasSize({
        dpr: window.devicePixelRatio || 1,
        height: Math.max(rect.height, 1),
        width: Math.max(rect.width, 1),
      });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const stateCounts = useMemo(() => {
    const counts = new Map<string, number>();
    records.forEach((record) => counts.set(record.estado, (counts.get(record.estado) ?? 0) + 1));
    return counts;
  }, [records]);

  const renderedStates = useMemo(() => {
    if (!geoJson) return [];
    return geoJson.features
      .map((feature) => {
        const info = stateInfoByCode[feature.properties.codarea];
        if (!info) return null;
        const d = geometryToPath(feature.geometry);
        const bounds = geometryBounds(feature.geometry);
        return {
          bounds,
          centroid: boundsCenter(bounds),
          code: feature.properties.codarea,
          d,
          detections: stateCounts.get(info.name) ?? 0,
          name: info.name,
          uf: info.uf,
        };
      })
      .filter((feature): feature is RenderedState => feature !== null);
  }, [geoJson, stateCounts]);

  const brazilBounds = useMemo(() => {
    if (!renderedStates.length) return null;
    return combineBounds(renderedStates.map((state) => state.bounds));
  }, [renderedStates]);

  const baseViewBox = useMemo(() => {
    if (!brazilBounds) return null;
    return boundsToViewBox(brazilBounds, 0.11);
  }, [brazilBounds]);

  const effectiveViewBox = viewBox ?? baseViewBox;

  const projectedRecords = useMemo(
    () =>
      records.map((record) => ({
        point: projectLonLat(record.lon, record.lat),
        record,
      })),
    [records],
  );

  const clusters = useMemo(() => {
    if (mode !== "concentration") return [];
    const buckets = new Map<string, { count: number; x: number; y: number }>();
    const cellSize = 1.15;
    projectedRecords.forEach(({ point }) => {
      const key = `${Math.round(point.x / cellSize)},${Math.round(point.y / cellSize)}`;
      const bucket = buckets.get(key) ?? { count: 0, x: 0, y: 0 };
      bucket.count += 1;
      bucket.x += point.x;
      bucket.y += point.y;
      buckets.set(key, bucket);
    });
    return [...buckets.values()]
      .filter((bucket) => bucket.count >= 5)
      .map((bucket) => ({
        count: bucket.count,
        x: bucket.x / bucket.count,
        y: bucket.y / bucket.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 90);
  }, [mode, projectedRecords]);

  const maxFrp = useMemo(
    () => Math.max(...records.map((record) => record.frp ?? 0), 1),
    [records],
  );

  const focusPoint = selectedFocus ? projectLonLat(selectedFocus.lon, selectedFocus.lat) : null;
  const activePoint = activeMunicipality
    ? projectLonLat(activeMunicipality.lon, activeMunicipality.lat)
    : null;
  const selectedState = renderedStates.find((state) => state.name === currentState) ?? null;

  const zoomBy = useCallback(
    (factor: number) => {
      setViewBox((current) => {
        const source = current ?? baseViewBox;
        return source ? zoomViewBox(source, factor) : current;
      });
    },
    [baseViewBox],
  );

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      zoomBy(event.deltaY < 0 ? 0.86 : 1.16);
    };
    element.addEventListener("wheel", handleWheel, { passive: false });
    return () => element.removeEventListener("wheel", handleWheel);
  }, [zoomBy]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !effectiveViewBox) return;
    const { dpr, height, width } = canvasSize;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const context = canvas.getContext("2d");
    if (!context) return;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, width, height);

    if (mode === "concentration") {
      for (const cluster of clusters) {
        const screen = viewToScreen(cluster, effectiveViewBox, canvasSize);
        const radius = Math.min(14 + Math.sqrt(cluster.count) * 3.1, 54);
        const gradient = context.createRadialGradient(
          screen.x,
          screen.y,
          1,
          screen.x,
          screen.y,
          radius,
        );
        gradient.addColorStop(0, "rgba(249,115,22,0.33)");
        gradient.addColorStop(0.55, "rgba(249,115,22,0.13)");
        gradient.addColorStop(1, "rgba(249,115,22,0)");
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
        context.fill();
      }
    }

    for (const { point, record } of projectedRecords) {
      const screen = viewToScreen(point, effectiveViewBox, canvasSize);
      if (screen.x < -20 || screen.x > width + 20 || screen.y < -20 || screen.y > height + 20) {
        continue;
      }
      const active =
        activeMunicipality &&
        activeMunicipality.municipio === record.municipio &&
        activeMunicipality.uf === record.uf;
      const radius =
        mode === "frp"
          ? 1.1 + Math.min(Math.sqrt((record.frp ?? 0) / maxFrp) * 8, 8)
          : active
            ? 3.1
            : mode === "concentration"
              ? 1.35
              : 2.1;
      const color =
        mode === "risk"
          ? riskColors[record.riscoVisual]
          : mode === "frp"
            ? record.frp === null
              ? "#737373"
              : "#fbbf24"
            : "#f97316";

      context.globalAlpha = active
        ? 1
        : targetAcquisition
          ? 0.22
          : mode === "concentration"
            ? 0.55
            : 0.82;
      context.fillStyle = color;
      context.beginPath();
      context.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = 1;
  }, [
    activeMunicipality,
    canvasSize,
    clusters,
    effectiveViewBox,
    maxFrp,
    mode,
    projectedRecords,
    targetAcquisition,
  ]);

  const resetView = () => {
    setViewBox(null);
  };

  const focusState = (state: RenderedState, force = false) => {
    if (!force && dragRef.current?.moved) return;
    setViewBox(boundsToViewBox(state.bounds, 0.22));
    onStateSelect?.(state.name);
  };

  const moveStateTooltip = (event: ReactMouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.min(Math.max(event.clientX - rect.left + 14, 10), rect.width - 170);
    const y = Math.min(Math.max(event.clientY - rect.top + 14, 10), rect.height - 78);
    setTooltipPosition({ x, y });
  };

  const selectNearestFocus = (event: ReactMouseEvent<SVGSVGElement>) => {
    if (!effectiveViewBox || dragRef.current?.moved) return false;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return false;
    const pointer = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    let best: { distance: number; record: FireFocusRecord } | null = null;
    for (const { point, record } of projectedRecords) {
      const screen = viewToScreen(point, effectiveViewBox, canvasSize);
      const distance = Math.hypot(screen.x - pointer.x, screen.y - pointer.y);
      if (distance <= 9 && (!best || distance < best.distance)) {
        best = { distance, record };
      }
    }
    if (!best) return false;
    event.stopPropagation();
    onFocusSelect(best.record);
    return true;
  };

  return (
    <div
      className="group/map relative min-h-[420px] overflow-hidden rounded-lg border border-white/10 bg-[#080808] shadow-[0_30px_110px_rgba(0,0,0,0.56)] md:min-h-[520px]"
      ref={containerRef}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.1),transparent_56%)]" />
      <div className="absolute inset-0 opacity-[0.2] [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:44px_44px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_55%,rgba(249,115,22,0.12),transparent_28%),radial-gradient(circle_at_35%_82%,rgba(251,191,36,0.06),transparent_32%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.032)_48%,transparent_49%)] opacity-40" />

      <div className="absolute left-4 top-4 z-40 flex overflow-hidden rounded-lg border border-white/10 bg-black/62 p-1 backdrop-blur-xl">
        {[
          ["concentration", "Concentração"],
          ["risk", "Risco"],
          ["frp", "FRP"],
        ].map(([id, label]) => (
          <button
            className={`rounded-md px-4 py-2 text-xs font-semibold transition ${
              mode === id
                ? "bg-orange-500/20 text-orange-200"
                : "text-white/56 hover:bg-white/[0.045] hover:text-white"
            }`}
            key={id}
            onClick={() => onModeChange(id as MapMode)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      <div className="absolute right-4 top-4 z-40 grid overflow-hidden rounded-lg border border-white/10 bg-black/62 backdrop-blur-xl">
        <button
          aria-label="Aproximar mapa"
          className="flex h-10 w-10 items-center justify-center border-b border-white/10 text-white/72 hover:bg-white/[0.045]"
          onClick={() => zoomBy(0.72)}
          type="button"
        >
          <Plus size={16} />
        </button>
        <button
          aria-label="Afastar mapa"
          className="flex h-10 w-10 items-center justify-center border-b border-white/10 text-white/72 hover:bg-white/[0.045]"
          onClick={() => zoomBy(1.28)}
          type="button"
        >
          <Minus size={16} />
        </button>
        <button
          aria-label="Enquadrar Brasil"
          className="flex h-10 w-10 items-center justify-center border-b border-white/10 text-white/72 hover:bg-white/[0.045]"
          onClick={resetView}
          type="button"
        >
          <Crosshair size={16} />
        </button>
        <button
          aria-label="Camada de estados"
          className="flex h-10 w-10 items-center justify-center text-white/72 hover:bg-white/[0.045]"
          type="button"
        >
          <Layers size={16} />
        </button>
      </div>

      {effectiveViewBox ? (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-24 bg-gradient-to-b from-transparent via-orange-300/12 to-transparent opacity-0 group-hover/map:opacity-100 orbitfire-map-idle-scan" />
          <svg
            className="absolute inset-0 z-10 h-full w-full touch-none"
            onClickCapture={(event) => {
              const target = event.target as Element | null;
              if (target?.closest("[data-orbitfire-state]")) return;
              if (selectNearestFocus(event)) return;
            }}
            onPointerDown={(event) => {
              if (event.button !== 0) return;
              dragRef.current = {
                moved: false,
                startX: event.clientX,
                startY: event.clientY,
                viewBox: effectiveViewBox,
              };
              svgRef.current?.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              const drag = dragRef.current;
              const rect = svgRef.current?.getBoundingClientRect();
              if (!drag || !rect) return;
              const dx = ((event.clientX - drag.startX) / rect.width) * drag.viewBox.width;
              const dy = ((event.clientY - drag.startY) / rect.height) * drag.viewBox.height;
              if (
                Math.abs(event.clientX - drag.startX) > 3 ||
                Math.abs(event.clientY - drag.startY) > 3
              ) {
                drag.moved = true;
              }
              setViewBox({ ...drag.viewBox, x: drag.viewBox.x - dx, y: drag.viewBox.y - dy });
            }}
            onPointerUp={(event) => {
              svgRef.current?.releasePointerCapture(event.pointerId);
              window.setTimeout(() => {
                dragRef.current = null;
              }, 0);
            }}
            ref={svgRef}
            viewBox={`${effectiveViewBox.x} ${effectiveViewBox.y} ${effectiveViewBox.width} ${effectiveViewBox.height}`}
          >
            <g>
              {renderedStates.map((state) => {
                const selected = currentState === state.name;
                return (
                  <path
                    aria-label={`${state.name}: ${state.detections.toLocaleString("pt-BR")} detecções`}
                    className="transition duration-200"
                    data-orbitfire-state
                    d={state.d}
                    fill={selected ? "rgba(249,115,22,0.18)" : "rgba(28,20,16,0.95)"}
                    key={state.code}
                    onClick={(event) => {
                      event.stopPropagation();
                      focusState(state, true);
                    }}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter" && event.key !== " ") return;
                      event.preventDefault();
                      focusState(state, true);
                    }}
                    onMouseEnter={() => setHoveredState(state)}
                    onMouseLeave={() => setHoveredState(null)}
                    onMouseMove={moveStateTooltip}
                    onPointerDown={(event) => {
                      if (event.button !== 0) return;
                      event.stopPropagation();
                      statePressRef.current = {
                        code: state.code,
                        startX: event.clientX,
                        startY: event.clientY,
                      };
                      event.currentTarget.setPointerCapture(event.pointerId);
                    }}
                    onPointerUp={(event) => {
                      event.stopPropagation();
                      const press = statePressRef.current;
                      statePressRef.current = null;
                      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                        event.currentTarget.releasePointerCapture(event.pointerId);
                      }
                      if (!press || press.code !== state.code) return;
                      const distance = Math.hypot(
                        event.clientX - press.startX,
                        event.clientY - press.startY,
                      );
                      if (distance <= 8) focusState(state, true);
                    }}
                    role="button"
                    stroke={
                      selected || hoveredState?.code === state.code
                        ? "rgba(249,115,22,0.68)"
                        : "rgba(255,255,255,0.15)"
                    }
                    strokeLinejoin="round"
                    strokeWidth={selected ? 0.18 : 0.09}
                    tabIndex={0}
                  />
                );
              })}
            </g>
          </svg>

          <canvas className="pointer-events-none absolute inset-0 z-20 h-full w-full" ref={canvasRef} />

          <svg
            className="pointer-events-none absolute inset-0 z-30 h-full w-full"
            viewBox={`${effectiveViewBox.x} ${effectiveViewBox.y} ${effectiveViewBox.width} ${effectiveViewBox.height}`}
          >
            {selectedState ? <StateTargetLock state={selectedState} /> : null}

            <g>
              {renderedStates.map((state) => (
                <text
                  fill="rgba(255,255,255,0.48)"
                  fontSize="0.85"
                  fontWeight="600"
                  key={`label-${state.code}`}
                  textAnchor="middle"
                  x={state.centroid.x}
                  y={state.centroid.y}
                >
                  {state.uf}
                </text>
              ))}
            </g>

            {activePoint ? (
              <g>
                <circle
                  cx={activePoint.x}
                  cy={activePoint.y}
                  fill="none"
                  r="2.7"
                  stroke="rgba(249,115,22,0.64)"
                  strokeWidth="0.12"
                />
                <circle
                  cx={activePoint.x}
                  cy={activePoint.y}
                  fill="none"
                  r="4.8"
                  stroke="rgba(251,191,36,0.28)"
                  strokeDasharray="0.35 0.42"
                  strokeWidth="0.1"
                />
              </g>
            ) : null}

            {focusPoint ? (
              <g>
                <circle
                  cx={focusPoint.x}
                  cy={focusPoint.y}
                  fill="none"
                  r="1.8"
                  stroke="rgba(255,255,255,0.88)"
                  strokeWidth="0.12"
                />
                <path
                  d={`M ${focusPoint.x - 3} ${focusPoint.y} L ${focusPoint.x - 1.4} ${focusPoint.y} M ${focusPoint.x + 1.4} ${focusPoint.y} L ${focusPoint.x + 3} ${focusPoint.y} M ${focusPoint.x} ${focusPoint.y - 3} L ${focusPoint.x} ${focusPoint.y - 1.4} M ${focusPoint.x} ${focusPoint.y + 1.4} L ${focusPoint.x} ${focusPoint.y + 3}`}
                  stroke="rgba(249,115,22,0.85)"
                  strokeLinecap="round"
                  strokeWidth="0.1"
                />
              </g>
            ) : null}
          </svg>
        </>
      ) : (
        <div className="absolute inset-0 z-10 grid place-items-center text-sm text-white/46">
          Carregando malha geográfica do Brasil...
        </div>
      )}

      <div className="pointer-events-none absolute left-1/2 top-16 z-40 -translate-x-1/2 rounded-full border border-white/10 bg-black/62 px-3 py-1.5 text-[11px] text-white/54 opacity-0 backdrop-blur-xl transition group-hover/map:opacity-100">
        Use a roda do mouse para ampliar o mapa
      </div>

      {hoveredState ? (
        <div
          className="pointer-events-none absolute z-50 rounded-lg border border-orange-300/20 bg-black/82 px-3 py-2 text-xs shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl"
          style={{ left: tooltipPosition.x, top: tooltipPosition.y }}
        >
          <strong className="block text-white">{hoveredState.name}</strong>
          <span className="mt-1 block text-orange-200">
            {hoveredState.detections.toLocaleString("pt-BR")} detecções
          </span>
        </div>
      ) : null}

      {targetAcquisition ? (
        <div className="pointer-events-none absolute right-6 top-24 z-50 max-w-[310px] rounded-lg border border-orange-300/24 bg-black/78 p-4 shadow-[0_0_48px_rgba(249,115,22,0.22)] backdrop-blur-xl orbitfire-target-hud">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-orange-300">
            {targetAcquisition.title}
          </p>
          <p className="mt-3 text-sm font-semibold text-white">{targetAcquisition.subtitle}</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white/48">
            {targetAcquisition.detail}
          </p>
        </div>
      ) : null}

      <div className="absolute bottom-5 left-5 z-40 rounded-lg border border-white/10 bg-black/64 p-4 text-xs backdrop-blur-xl">
        {mode === "frp" ? (
          <>
            <p className="mb-3 font-medium text-white">Potência radiativa observada (MW)</p>
            <div className="flex items-end gap-3 text-white/58">
              <span className="h-2 w-2 rounded-full bg-neutral-500" />
              <span className="h-3 w-3 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.55)]" />
              <span className="h-5 w-5 rounded-full bg-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.65)]" />
              <span>FRP baixo a alto</span>
            </div>
          </>
        ) : mode === "concentration" ? (
          <>
            <p className="mb-2 font-medium text-white">Concentração</p>
            <p className="max-w-[210px] leading-5 text-white/56">
              Concentração de detecções registradas no período analisado.
            </p>
          </>
        ) : (
          <>
            <p className="mb-3 font-medium text-white">Faixa de risco (OrbitFire)</p>
            <div className="grid gap-2">
              {riskLegend.map((risk) => (
                <div className="flex items-center gap-2 text-white/64" key={risk}>
                  <span
                    className="h-3 w-3 rounded-sm"
                    style={{ backgroundColor: riskColors[risk] }}
                  />
                  {riskLabels[risk]}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="absolute bottom-5 right-5 z-40 flex items-end gap-4 text-xs text-white/64">
        <span className="hidden rounded-lg border border-white/10 bg-black/56 px-3 py-2 backdrop-blur-xl md:inline">
          {records.length.toLocaleString("pt-BR")} detecções visíveis
        </span>
        <button
          aria-label="Expandir mapa"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-black/62 text-white/70 backdrop-blur-xl"
          type="button"
        >
          <Maximize2 size={16} />
        </button>
      </div>
    </div>
  );
}

function StateTargetLock({ state }: { state: RenderedState }) {
  const width = state.bounds.maxX - state.bounds.minX;
  const height = state.bounds.maxY - state.bounds.minY;
  const pad = Math.max(width, height) * 0.11;
  const x = state.bounds.minX - pad;
  const y = state.bounds.minY - pad;
  const w = width + pad * 2;
  const h = height + pad * 2;
  const corner = Math.min(w, h) * 0.18;

  return (
    <g className="orbitfire-state-lock">
      <rect
        fill="rgba(249,115,22,0.035)"
        height={h}
        rx={Math.min(w, h) * 0.035}
        stroke="rgba(251,191,36,0.48)"
        strokeDasharray="0.55 0.38"
        strokeWidth="0.12"
        width={w}
        x={x}
        y={y}
      />
      <path
        d={[
          `M ${x} ${y + corner} L ${x} ${y} L ${x + corner} ${y}`,
          `M ${x + w - corner} ${y} L ${x + w} ${y} L ${x + w} ${y + corner}`,
          `M ${x + w} ${y + h - corner} L ${x + w} ${y + h} L ${x + w - corner} ${y + h}`,
          `M ${x + corner} ${y + h} L ${x} ${y + h} L ${x} ${y + h - corner}`,
        ].join(" ")}
        fill="none"
        stroke="rgba(251,191,36,0.92)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="0.18"
      />
      <circle
        cx={state.centroid.x}
        cy={state.centroid.y}
        fill="none"
        r={Math.max(width, height) * 0.18}
        stroke="rgba(249,115,22,0.35)"
        strokeDasharray="0.35 0.42"
        strokeWidth="0.1"
      />
    </g>
  );
}

function projectLonLat(lon: number, lat: number): Point {
  const maxLat = 85.05112878;
  const limitedLat = Math.max(Math.min(lat, maxLat), -maxLat);
  const rad = (limitedLat * Math.PI) / 180;
  return {
    x: lon,
    y: (-Math.log(Math.tan(Math.PI / 4 + rad / 2)) * 180) / Math.PI,
  };
}

function viewToScreen(point: Point, viewBox: ViewBox, canvas: CanvasSize): Point {
  const scale = Math.min(canvas.width / viewBox.width, canvas.height / viewBox.height);
  const renderedWidth = viewBox.width * scale;
  const renderedHeight = viewBox.height * scale;
  const offsetX = (canvas.width - renderedWidth) / 2;
  const offsetY = (canvas.height - renderedHeight) / 2;
  return {
    x: (point.x - viewBox.x) * scale + offsetX,
    y: (point.y - viewBox.y) * scale + offsetY,
  };
}

function geometryToPath(geometry: GeoGeometry) {
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  return polygons
    .map((polygon) =>
      polygon
        .map((ring) =>
          ring
            .map(([lon, lat], index) => {
              const point = projectLonLat(lon, lat);
              return `${index === 0 ? "M" : "L"} ${point.x.toFixed(4)} ${point.y.toFixed(4)}`;
            })
            .join(" ")
            .concat(" Z"),
        )
        .join(" "),
    )
    .join(" ");
}

function geometryBounds(geometry: GeoGeometry) {
  const points = collectGeometryPoints(geometry);
  return points.reduce<Bounds>(
    (bounds, point) => ({
      minX: Math.min(bounds.minX, point.x),
      minY: Math.min(bounds.minY, point.y),
      maxX: Math.max(bounds.maxX, point.x),
      maxY: Math.max(bounds.maxY, point.y),
    }),
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
  );
}

function collectGeometryPoints(geometry: GeoGeometry) {
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  return polygons.flatMap((polygon) =>
    polygon.flatMap((ring) => ring.map(([lon, lat]) => projectLonLat(lon, lat))),
  );
}

function combineBounds(boundsList: Bounds[]) {
  return boundsList.reduce<Bounds>(
    (bounds, item) => ({
      minX: Math.min(bounds.minX, item.minX),
      minY: Math.min(bounds.minY, item.minY),
      maxX: Math.max(bounds.maxX, item.maxX),
      maxY: Math.max(bounds.maxY, item.maxY),
    }),
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
  );
}

function boundsCenter(bounds: Bounds) {
  return {
    x: (bounds.minX + bounds.maxX) / 2,
    y: (bounds.minY + bounds.maxY) / 2,
  };
}

function boundsToViewBox(bounds: Bounds, paddingRatio: number): ViewBox {
  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;
  const pad = Math.max(width, height) * paddingRatio;
  return {
    x: bounds.minX - pad,
    y: bounds.minY - pad,
    width: width + pad * 2,
    height: height + pad * 2,
  };
}

function zoomViewBox(viewBox: ViewBox, factor: number) {
  const nextWidth = viewBox.width * factor;
  const nextHeight = viewBox.height * factor;
  return {
    x: viewBox.x + (viewBox.width - nextWidth) / 2,
    y: viewBox.y + (viewBox.height - nextHeight) / 2,
    width: nextWidth,
    height: nextHeight,
  };
}
