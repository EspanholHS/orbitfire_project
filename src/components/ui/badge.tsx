import type { ComponentPropsWithoutRef } from "react";

type BadgeProps = ComponentPropsWithoutRef<"span"> & {
  tone?: "fire" | "neutral" | "satellite" | "environment";
};

const toneClassNames = {
  fire: "border-orange-400/20 bg-orange-500/10 text-orange-300",
  neutral: "border-white/10 bg-white/5 text-white/70",
  satellite: "border-sky-300/20 bg-sky-400/10 text-sky-200",
  environment: "border-emerald-300/20 bg-emerald-400/10 text-emerald-200",
};

export function Badge({
  className = "",
  tone = "fire",
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${toneClassNames[tone]} ${className}`}
      {...props}
    />
  );
}
