import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { ArrowRight } from "lucide-react";

type OrbitButtonProps = ComponentPropsWithoutRef<"a"> & {
  active?: boolean;
  icon?: ReactNode;
};

export function OrbitButton({
  active = false,
  children,
  className = "",
  icon,
  ...props
}: OrbitButtonProps) {
  return (
    <a
      className={`group relative isolate inline-flex items-center overflow-hidden rounded-full bg-gradient-to-b from-white/20 via-white/0 to-white/5 p-px text-sm font-medium text-white shadow-[0_0_25px_rgba(249,115,22,0.28),0_8px_40px_rgba(249,115,22,0.14)] transition duration-300 hover:scale-[1.025] hover:shadow-[0_0_50px_8px_rgba(249,115,22,0.32)] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/70 ${
        active ? "scale-[0.985] shadow-[0_0_70px_12px_rgba(249,115,22,0.4)]" : ""
      } ${className}`}
      {...props}
    >
      <span className="absolute inset-0 overflow-hidden rounded-full">
        <span className="absolute -inset-full animate-[orbitfire-border-spin_3s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_80deg,rgba(253,186,116,0.8)_180deg,transparent_280deg,transparent_360deg)]" />
      </span>
      <span className="absolute inset-px rounded-full bg-neutral-950/90 backdrop-blur-xl" />
      {active ? (
        <span className="pointer-events-none absolute inset-[-18px] rounded-full bg-orange-500/20 blur-xl [animation:orbitfire-button-activation_700ms_ease-out_both]" />
      ) : null}
      <span className="relative z-10 inline-flex items-center gap-3 rounded-full px-4 py-3">
        <span
          className={`inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-b from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/30 ring-1 ring-white/20 transition duration-300 group-hover:scale-110 ${
            active ? "shadow-[0_0_26px_rgba(249,115,22,0.9)]" : ""
          }`}
        >
          {icon ?? (
            <ArrowRight
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-[2px]"
              size={15}
              strokeWidth={2.4}
            />
          )}
        </span>
        <span className="whitespace-nowrap text-base tracking-tight text-white/95 transition group-hover:text-white">
          {children}
        </span>
      </span>
    </a>
  );
}
