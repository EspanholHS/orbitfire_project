"use client";

import { memo } from "react";
import type { CSSProperties } from "react";
import type { DashboardView } from "@/types/fire-focus";

const orbitPaths = [
  {
    begin: "0s",
    d: "M 36 566 C 164 402, 344 318, 554 298 C 710 284, 848 318, 972 428",
    duration: "20s",
    opacity: 0.28,
    signal: 1.8,
    width: 1.1,
  },
  {
    begin: "3s",
    d: "M -22 412 C 166 286, 418 240, 694 254 C 834 262, 944 288, 1076 352",
    duration: "24s",
    opacity: 0.18,
    signal: 1.4,
    width: 0.95,
  },
  {
    begin: "7s",
    d: "M 154 664 C 248 502, 428 404, 646 390 C 804 380, 946 432, 1128 542",
    duration: "28s",
    opacity: 0.16,
    signal: 1.3,
    width: 0.9,
  },
  {
    begin: "5.2s",
    d: "M 742 18 C 650 134, 580 256, 556 386 C 532 520, 562 626, 690 748",
    duration: "26s",
    opacity: 0.14,
    signal: 1.1,
    width: 0.85,
  },
];

const telemetryPoints = [
  { delay: "0s", left: "12%", size: "2px", strength: 0.84, top: "18%" },
  { delay: "1.8s", left: "28%", size: "2px", strength: 0.82, top: "28%" },
  { delay: "3.6s", left: "42%", size: "2px", strength: 0.78, top: "16%" },
  { delay: "5.4s", left: "58%", size: "2px", strength: 0.8, top: "22%" },
  { delay: "7.2s", left: "73%", size: "2px", strength: 0.84, top: "18%" },
  { delay: "9s", left: "86%", size: "2px", strength: 0.78, top: "31%" },
  { delay: "2.7s", left: "18%", size: "3px", strength: 1, top: "62%" },
  { delay: "3.9s", left: "24%", size: "2px", strength: 0.88, top: "56%" },
  { delay: "4.9s", left: "36%", size: "3px", strength: 0.98, top: "72%" },
  { delay: "5.7s", left: "44%", size: "2px", strength: 0.88, top: "64%" },
  { delay: "6.5s", left: "62%", size: "3px", strength: 0.94, top: "68%" },
  { delay: "7.1s", left: "68%", size: "2px", strength: 0.84, top: "58%" },
  { delay: "7.9s", left: "74%", size: "3px", strength: 1, top: "66%" },
  { delay: "8.8s", left: "82%", size: "3px", strength: 0.94, top: "74%" },
  { delay: "9.7s", left: "88%", size: "2px", strength: 0.8, top: "62%" },
  { delay: "10.4s", left: "31%", size: "2px", strength: 0.76, top: "81%" },
  { delay: "11.2s", left: "52%", size: "2px", strength: 0.82, top: "78%" },
  { delay: "12s", left: "71%", size: "2px", strength: 0.76, top: "83%" },
];

const horizonLights = [
  { delay: "0s", left: "18%", top: "54%" },
  { delay: "1.6s", left: "31%", top: "62%" },
  { delay: "3.1s", left: "42%", top: "58%" },
  { delay: "4.5s", left: "57%", top: "60%" },
  { delay: "6.2s", left: "68%", top: "56%" },
  { delay: "8.4s", left: "82%", top: "63%" },
];

const dataBeams = [
  { delay: "1s", left: "8%", rotation: "-18deg", duration: "18s", width: "18%" },
  { delay: "7s", left: "46%", rotation: "-12deg", duration: "20s", width: "15%" },
  { delay: "12s", left: "78%", rotation: "-20deg", duration: "16s", width: "14%" },
];

const hudMarks = [
  { delay: "0.6s", left: "8%", top: "24%", label: "ORBITAL LINK" },
  { delay: "3.8s", left: "72%", top: "18%", label: "SCAN VECTOR" },
  { delay: "6.4s", left: "18%", top: "82%", label: "DATA STREAM" },
  { delay: "8.8s", left: "78%", top: "76%", label: "SIGNAL" },
];

export const OrbitalDashboardBackground = memo(function OrbitalDashboardBackground({
  intensified = false,
  view,
}: {
  intensified?: boolean;
  view: DashboardView;
}) {
  return (
    <div
      aria-hidden="true"
      className={`orbitfire-live-background orbitfire-live-background-${view} ${
        intensified ? "orbitfire-live-background-intense" : ""
      }`}
    >
      <span className="orbitfire-live-space" />
      <span className="orbitfire-live-vignette" />
      <span className="orbitfire-live-atmosphere" />
      <span className="orbitfire-live-grid" />
      <span className="orbitfire-live-diagonals" />
      <span className="orbitfire-live-scan" />

      <div className="orbitfire-live-horizon">
        <span className="orbitfire-live-horizon-surface" />
        <span className="orbitfire-live-horizon-rim" />
        <span className="orbitfire-live-horizon-atmosphere" />
        {horizonLights.map((light, index) => (
          <span
            className="orbitfire-live-surface-light"
            key={`${light.left}-${light.top}-${index}`}
            style={
              {
                "--delay": light.delay,
                "--left": light.left,
                "--top": light.top,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <svg
        className="orbitfire-live-orbits"
        preserveAspectRatio="none"
        viewBox="0 0 1000 700"
      >
        <defs>
          {orbitPaths.map((orbit, index) => (
            <path d={orbit.d} id={`orbitfire-live-orbit-${index}`} key={`path-${index}`} />
          ))}
        </defs>

        {orbitPaths.map((orbit, index) => (
          <g key={`orbit-${index}`}>
            <path
              className="orbitfire-live-orbit-path"
              d={orbit.d}
              style={
                {
                  "--orbit-opacity": orbit.opacity,
                  "--orbit-width": orbit.width,
                } as CSSProperties
              }
            />
            <circle
              className="orbitfire-live-orbit-signal"
              r={orbit.signal}
              style={{ "--signal-delay": orbit.begin } as CSSProperties}
            >
              <animateMotion
                begin={orbit.begin}
                dur={orbit.duration}
                repeatCount="indefinite"
                rotate="auto"
              >
                <mpath href={`#orbitfire-live-orbit-${index}`} />
              </animateMotion>
            </circle>
          </g>
        ))}
      </svg>

      {dataBeams.map((beam, index) => (
        <span
          className="orbitfire-live-beam"
          key={`${beam.left}-${beam.delay}-${index}`}
          style={
            {
              "--beam-delay": beam.delay,
              "--beam-duration": beam.duration,
              "--beam-left": beam.left,
              "--beam-rotation": beam.rotation,
              "--beam-width": beam.width,
            } as CSSProperties
          }
        />
      ))}

      {telemetryPoints.map((signal, index) => (
        <span
          className="orbitfire-live-telemetry"
          key={`${signal.left}-${signal.top}-${index}`}
          style={
            {
                "--delay": signal.delay,
                "--left": signal.left,
                "--size": signal.size,
                "--strength": signal.strength,
                "--top": signal.top,
              } as CSSProperties
            }
        />
      ))}

      <span className="orbitfire-live-reticle orbitfire-live-reticle-a" />
      <span className="orbitfire-live-reticle orbitfire-live-reticle-b" />
      <span className="orbitfire-live-halo orbitfire-live-halo-a" />
      <span className="orbitfire-live-halo orbitfire-live-halo-b" />

      {hudMarks.map((mark, index) => (
        <span
          className="orbitfire-live-hud-mark"
          key={`${mark.label}-${index}`}
          style={
            {
              "--delay": mark.delay,
              "--left": mark.left,
              "--top": mark.top,
            } as CSSProperties
          }
        >
          {mark.label}
        </span>
      ))}

      <span className="orbitfire-live-noise" />
    </div>
  );
});
