import type { ReactNode } from "react";

type MetricCardProps = {
  label: string;
  value: string;
  detail?: string;
  tone?: "fire" | "neutral" | "satellite" | "environment";
  icon?: ReactNode;
};

const toneClassNames = {
  fire: "text-orange-300 shadow-orange-500/20",
  neutral: "text-white shadow-white/10",
  satellite: "text-sky-200 shadow-sky-400/10",
  environment: "text-emerald-200 shadow-emerald-400/10",
};

export function MetricCard({
  detail,
  icon,
  label,
  tone = "neutral",
  value,
}: MetricCardProps) {
  return (
    <article className="orbitfire-panel rounded-lg p-5 transition duration-300 hover:-translate-y-0.5 hover:border-white/14">
      <div className="flex items-start justify-between gap-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/42">
          {label}
        </p>
        {icon ? (
          <span
            className={`inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5 ${toneClassNames[tone]}`}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <strong className={`mt-5 block text-4xl font-medium tracking-tight ${toneClassNames[tone]}`}>
        {value}
      </strong>
      {detail ? <p className="mt-2 text-sm text-white/50">{detail}</p> : null}
    </article>
  );
}
