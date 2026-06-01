"use client";

import { Database, ShieldCheck } from "lucide-react";
import type { DataSourceKind } from "@/types/orbitfire-api";

export function DataSourceBadge({ source }: { source: DataSourceKind }) {
  const isApi = source === "api";
  const Icon = isApi ? Database : ShieldCheck;

  return (
    <span
      className={`inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-lg border px-3 text-xs font-medium transition ${
        isApi
          ? "border-orange-300/18 bg-orange-500/10 text-orange-200"
          : "border-white/10 bg-white/[0.035] text-white/62"
      }`}
      title={isApi ? "Fonte ativa: API OrbitFire" : "Fonte ativa: Snapshot local"}
    >
      <Icon className={isApi ? "text-orange-300" : "text-white/48"} size={15} />
      <span className="hidden 2xl:inline">{isApi ? "API OrbitFire" : "Snapshot local"}</span>
      <span className="2xl:hidden">{isApi ? "API" : "Local"}</span>
    </span>
  );
}
