"use client";

import { useEffect, useState } from "react";
import { useInView } from "@/hooks/use-in-view";

export function AnimatedNumber({
  value,
  duration = 2000,
  formatOptions,
}: {
  value: number;
  duration?: number;
  formatOptions?: Intl.NumberFormatOptions;
}) {
  const [currentValue, setCurrentValue] = useState(0);
  const { ref, isInView } = useInView({ threshold: 0.5 });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      // Easing function (easeOutExpo)
      const easeOut = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
      
      setCurrentValue(value * easeOut);

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCurrentValue(value);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, value, duration]);

  return (
    <span ref={ref as React.RefObject<HTMLSpanElement>}>
      {new Intl.NumberFormat("pt-BR", formatOptions).format(currentValue)}
    </span>
  );
}
