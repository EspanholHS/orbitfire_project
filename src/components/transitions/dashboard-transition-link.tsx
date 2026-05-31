"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { OrbitButton } from "@/components/ui/orbit-button";
import { useOrbitalLockTransition } from "@/components/transitions/orbital-lock-transition";

type DashboardTransitionLinkProps = Omit<
  ComponentPropsWithoutRef<typeof OrbitButton>,
  "href" | "children" | "onClick"
> & {
  children: ReactNode;
};

export function DashboardTransitionLink({
  children,
  className = "",
  ...props
}: DashboardTransitionLinkProps) {
  const { isTransitioning, startDashboardTransition } =
    useOrbitalLockTransition();

  return (
    <OrbitButton
      active={isTransitioning}
      aria-disabled={isTransitioning}
      className={`orbitfire-dashboard-cta ${className}`}
      href="/dashboard"
      icon={
        isTransitioning ? (
          <LoaderCircle
            aria-hidden="true"
            className="animate-spin"
            size={15}
            strokeWidth={2.4}
          />
        ) : undefined
      }
      onClick={(event) => {
        if (isTransitioning) {
          event.preventDefault();
          return;
        }
        startDashboardTransition(event);
      }}
      {...props}
    >
      {isTransitioning ? "Iniciando varredura" : children}
    </OrbitButton>
  );
}
