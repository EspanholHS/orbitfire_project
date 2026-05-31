import type { CSSProperties } from "react";
import { TargetLock } from "@/components/transitions/target-lock";

const detectionPoints = [
  { left: 54, top: 37, delay: 0.05, size: 7, primary: true },
  { left: 57, top: 41, delay: 0.12, size: 6, primary: true },
  { left: 52, top: 45, delay: 0.18, size: 5, primary: true },
  { left: 60, top: 46, delay: 0.24, size: 4, primary: true },
  { left: 49, top: 51, delay: 0.31, size: 4, primary: true },
  { left: 63, top: 55, delay: 0.39, size: 4, primary: true },
  { left: 47, top: 58, delay: 0.46, size: 3 },
  { left: 55, top: 61, delay: 0.53, size: 3 },
  { left: 66, top: 35, delay: 0.2, size: 3 },
  { left: 70, top: 44, delay: 0.34, size: 3 },
  { left: 73, top: 51, delay: 0.42, size: 2.5 },
  { left: 42, top: 42, delay: 0.5, size: 2.5 },
  { left: 39, top: 55, delay: 0.62, size: 2.5 },
  { left: 44, top: 68, delay: 0.71, size: 2.5 },
  { left: 58, top: 72, delay: 0.8, size: 2.5 },
  { left: 76, top: 63, delay: 0.86, size: 2.5 },
  { left: 61, top: 27, delay: 0.25, size: 2 },
  { left: 50, top: 30, delay: 0.32, size: 2 },
  { left: 36, top: 38, delay: 0.56, size: 2 },
  { left: 32, top: 48, delay: 0.68, size: 2 },
  { left: 34, top: 63, delay: 0.78, size: 2 },
  { left: 42, top: 77, delay: 0.93, size: 2 },
  { left: 52, top: 82, delay: 1.02, size: 2 },
  { left: 68, top: 76, delay: 1.08, size: 2 },
  { left: 81, top: 57, delay: 0.92, size: 2 },
  { left: 79, top: 39, delay: 0.74, size: 2 },
  { left: 72, top: 27, delay: 0.45, size: 2 },
  { left: 47, top: 22, delay: 0.39, size: 2 },
  { left: 28, top: 32, delay: 0.83, size: 1.5 },
  { left: 25, top: 52, delay: 0.96, size: 1.5 },
  { left: 30, top: 72, delay: 1.13, size: 1.5 },
  { left: 62, top: 88, delay: 1.18, size: 1.5 },
  { left: 84, top: 69, delay: 1.06, size: 1.5 },
  { left: 86, top: 45, delay: 0.88, size: 1.5 },
  { left: 65, top: 19, delay: 0.41, size: 1.5 },
  { left: 40, top: 25, delay: 0.52, size: 1.5 },
];

export function OrbitalMapScan() {
  return (
    <div className="orbitfire-map-stage">
      <div className="absolute inset-0 rounded-full bg-orange-500/10 blur-3xl" />
      <div className="relative mx-auto aspect-[0.88] w-[min(72vw,520px)] max-w-[520px]">
        <svg
          aria-hidden="true"
          className="absolute inset-0 h-full w-full drop-shadow-[0_0_46px_rgba(249,115,22,0.18)]"
          viewBox="0 0 220 260"
        >
          <defs>
            <pattern
              height="9"
              id="orbitfire-map-grid"
              patternUnits="userSpaceOnUse"
              width="9"
              x="0"
              y="0"
            >
              <path d="M 9 0 L 0 0 0 9" fill="none" stroke="rgba(249,115,22,0.13)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <path
            className="orbitfire-brazil-fill"
            d="M78 12 L112 18 L138 32 L165 48 L180 75 L200 95 L208 120 L195 155 L175 190 L150 215 L125 240 L105 250 L85 240 L65 210 L50 180 L35 150 L25 110 L35 80 L55 50 Z"
            fill="rgba(249,115,22,0.045)"
          />
          <path
            className="orbitfire-brazil-grid"
            d="M78 12 L112 18 L138 32 L165 48 L180 75 L200 95 L208 120 L195 155 L175 190 L150 215 L125 240 L105 250 L85 240 L65 210 L50 180 L35 150 L25 110 L35 80 L55 50 Z"
            fill="url(#orbitfire-map-grid)"
          />
          <path
            className="orbitfire-brazil-outline"
            d="M78 12 L112 18 L138 32 L165 48 L180 75 L200 95 L208 120 L195 155 L175 190 L150 215 L125 240 L105 250 L85 240 L65 210 L50 180 L35 150 L25 110 L35 80 L55 50 Z"
            fill="none"
            stroke="rgba(251,146,60,0.62)"
            strokeWidth="1.2"
          />
          <path
            className="orbitfire-brazil-inner"
            d="M71 61 108 77 142 65 166 91 158 124 177 148 150 179 124 191 99 224 79 184 51 167 51 132 41 105Z"
            fill="none"
            stroke="rgba(251,191,36,0.18)"
            strokeDasharray="5 7"
          />
        </svg>

        <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
          <line className="orbitfire-map-connection" x1="54%" x2="70%" y1="37%" y2="44%" />
          <line className="orbitfire-map-connection" x1="57%" x2="49%" y1="41%" y2="51%" />
          <line className="orbitfire-map-connection" x1="52%" x2="63%" y1="45%" y2="55%" />
          <line className="orbitfire-map-connection" x1="47%" x2="58%" y1="58%" y2="72%" />
        </svg>

        <span className="orbitfire-map-scanner" />

        {detectionPoints.map((point) => (
          <span
            className={`orbitfire-detection-point ${
              point.primary ? "orbitfire-detection-point-primary" : "hidden sm:block"
            }`}
            key={`${point.left}-${point.top}`}
            style={
              {
                "--point-delay": `${1.55 + point.delay}s`,
                height: `${point.size}px`,
                left: `${point.left}%`,
                top: `${point.top}%`,
                width: `${point.size}px`,
              } as CSSProperties
            }
          >
            {point.primary ? <span className="orbitfire-detection-halo" /> : null}
          </span>
        ))}

        <TargetLock />
      </div>
    </div>
  );
}
