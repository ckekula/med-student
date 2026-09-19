"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useOutsideClick } from "@/hooks/use-outside-click";

/**
 * Manages which item is expanded, plus the modal's side effects:
 * Escape to close, body scroll lock, and click-outside to close.
 */
export function useExpandedCard<T>() {
  const [active, setActive] = useState<T | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setActive(null), []);

  useEffect(() => {
    if (!active) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [active, close]);

  useOutsideClick(ref, close);

  return { active, setActive, close, ref };
}
