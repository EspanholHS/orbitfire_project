"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

type OrbitalBackgroundProps = {
  intensity?: "cinematic" | "subtle";
};

const beamClassNames = [
  "left-0 h-52 delay-0",
  "left-1/2 h-80 delay-[1400ms]",
  "right-0 h-64 delay-[2600ms]",
];

const diagonalStreaks = [
  { delay: "-1.2s", duration: "8.5s", left: "-10%", top: "2%", width: "18rem" },
  { delay: "-4.8s", duration: "10s", left: "4%", top: "-6%", width: "24rem" },
  { delay: "-7.4s", duration: "9.2s", left: "18%", top: "4%", width: "16rem" },
  { delay: "-2.6s", duration: "11s", left: "-14%", top: "18%", width: "22rem" },
  { delay: "-6.1s", duration: "8.8s", left: "12%", top: "24%", width: "14rem" },
  { delay: "-8.9s", duration: "10.5s", left: "28%", top: "-2%", width: "20rem" },
  { delay: "-3.7s", duration: "9.6s", left: "-4%", top: "38%", width: "17rem" },
];

export function OrbitalBackground({
  intensity = "cinematic",
}: OrbitalBackgroundProps) {
  const isCinematic = intensity === "cinematic";
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-background transition-transform duration-1000 ease-out"
      style={{
        transform: `translate(${mousePos.x}px, ${mousePos.y}px) scale(1.02)`,
      }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-75"
        style={{ backgroundImage: "url('/orbitfire-lumina-landscape.webp')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/62 via-[#050505]/34 to-[#050505]/88" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.18),transparent_62%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(249,115,22,0.16),transparent_48%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_82%_42%,rgba(56,189,248,0.08),transparent_35%)]" />
      <div className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:96px_96px]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,5,5,0.06),rgba(5,5,5,0.34)_72%,#050505)]" />
      <div
        className={`orbitfire-diagonal-rain absolute -left-32 -top-40 h-[135vh] w-[145vw] ${
          isCinematic ? "opacity-80" : "opacity-25"
        } [animation:orbitfire-rain_20s_linear_infinite]`}
      />
      {diagonalStreaks.map((streak) => (
        <span
          className={`orbitfire-diagonal-streak absolute h-px rounded-full ${
            isCinematic ? "opacity-70" : "opacity-20"
          }`}
          key={`${streak.left}-${streak.top}`}
          style={{
            animationDelay: streak.delay,
            left: streak.left,
            top: streak.top,
            width: streak.width,
            "--streak-duration": streak.duration,
          } as CSSProperties}
        />
      ))}

      <div
        className={`mx-auto flex h-full max-w-7xl border-r border-white/5 ${
          isCinematic ? "opacity-70" : "opacity-35"
        }`}
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            className="relative h-full flex-1 border-l border-white/5"
            key={index}
          >
            {beamClassNames[index % beamClassNames.length] ? (
              <span
                className={`absolute top-0 w-px bg-gradient-to-b from-transparent via-orange-500/80 to-transparent [animation:orbitfire-beam-fall_7s_linear_infinite] ${
                  beamClassNames[index % beamClassNames.length]
                }`}
              />
            ) : null}
            {/* Dots appearing occasionally */}
            {index % 2 === 0 && (
               <span 
                 className="absolute left-0 w-1 h-1 bg-orange-400 rounded-full shadow-[0_0_12px_rgba(249,115,22,0.8)] opacity-0 [animation:orbitfire-ping_12s_ease-in-out_infinite]"
                 style={{ top: `${20 + index * 10}%`, animationDelay: `${index * 1.5}s` }}
               />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
