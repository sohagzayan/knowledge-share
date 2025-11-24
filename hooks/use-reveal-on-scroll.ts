"use client";

import { useEffect, useRef, useState } from "react";

export function useRevealOnScroll<T extends HTMLElement>(
  options?: IntersectionObserverInit
) {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            obs.disconnect();
          }
        });
      },
      { threshold: 0.2, ...options }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [options]);

  return { ref, isVisible };
}


