"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { onScrollFrame, reducedMotion } from "@/lib/scroll";

/**
 * Gives every `[data-parallax]` inside it a `--p` from -1 (entering at the
 * bottom) to 1 (leaving at the top). CSS turns that into a small drift of the
 * logo against its cover. Reads rects first, writes after; off-screen covers
 * are skipped. Reduced motion: nothing moves.
 */
export function Parallax({ children, className }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || reducedMotion()) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>("[data-parallax]"));
    return onScrollFrame(() => {
      const vh = window.innerHeight;
      const rects = items.map((it) => it.getBoundingClientRect());
      rects.forEach((r, i) => {
        if (r.bottom < -100 || r.top > vh + 100) return;
        const p = ((r.top + r.height / 2) / vh) * -2 + 1;
        items[i].style.setProperty("--p", Math.max(-1, Math.min(1, p)).toFixed(3));
      });
    });
  }, []);

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
