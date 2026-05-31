import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

type SectionHeadingProps = {
  eyebrow: string;
  title: ReactNode;
  text?: string;
  align?: "left" | "center";
};

export function SectionHeading({
  align = "left",
  eyebrow,
  text,
  title,
}: SectionHeadingProps) {
  const isCenter = align === "center";

  return (
    <div className={isCenter ? "mx-auto max-w-4xl text-center" : "max-w-4xl"}>
      <Badge className={isCenter ? "justify-center" : ""}>
        <span className="h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_14px_rgba(249,115,22,0.9)]" />
        {eyebrow}
      </Badge>
      <h2 className="mt-6 text-4xl font-medium leading-[1.02] tracking-tight text-white md:text-6xl">
        {title}
      </h2>
      {text ? (
        <p
          className={`mt-6 text-base font-medium leading-8 text-white/60 md:text-lg ${
            isCenter ? "mx-auto max-w-3xl" : "max-w-3xl"
          }`}
        >
          {text}
        </p>
      ) : null}
    </div>
  );
}
