import type { ComponentPropsWithoutRef } from "react";

type PanelProps = ComponentPropsWithoutRef<"div">;

export function Panel({ className = "", ...props }: PanelProps) {
  return (
    <div
      className={`orbitfire-panel rounded-lg ${className}`}
      {...props}
    />
  );
}
