import { useEffect, useState, useRef } from "react";

export function useInView(options?: IntersectionObserverInit) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const root = options?.root ?? null;
  const rootMargin = options?.rootMargin ?? "0px";
  const threshold = options?.threshold ?? 0.1;

  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, { root, rootMargin, threshold });

    observer.observe(currentRef);

    return () => {
      observer.disconnect();
    };
  }, [root, rootMargin, threshold]);

  return { ref, isInView };
}
