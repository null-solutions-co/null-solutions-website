"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { clamp01, onScrollFrame, reducedMotion } from "@/lib/scroll";

type Size = { w: number; h: number };

/** One bold line from the left edge and one from the right; they sweep past each other. */
function paths({ w, h }: Size, flip: boolean): [string, string] {
  const y = (f: number) => (flip ? 1 - f : f) * h;
  const left = `M -20 ${y(0.3)} C ${w * 0.22} ${y(0.02)} ${w * 0.36} ${y(0.92)} ${w * 0.64} ${y(0.62)} S ${w * 0.86} ${y(0.2)} ${w * 0.9} ${y(0.26)}`;
  const right = `M ${w + 20} ${y(0.72)} C ${w * 0.78} ${y(0.98)} ${w * 0.62} ${y(0.08)} ${w * 0.36} ${y(0.38)} S ${w * 0.14} ${y(0.8)} ${w * 0.1} ${y(0.74)}`;
  return [left, right];
}

/**
 * Portfolio: two bold white lines that draw in from the left and right edges
 * as you scroll, cross in the middle and come to rest near the far side, each
 * led by a dot. They follow the scroll both ways, so scrolling back undraws
 * them.
 *
 * Drop into a `relative isolate` section; it spans the full screen width
 * behind the content. Only works while on screen, through the shared loop.
 */
export function EdgeLines({ className, flip = false }: { className?: string; flip?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const lines = useRef<(SVGPathElement | null)[]>([]);
  const heads = useRef<(SVGCircleElement | null)[]>([]);
  const [size, setSize] = useState<Size | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = Math.round(entry.contentRect.width);
      const h = Math.round(entry.contentRect.height);
      setSize((s) => (s && s.w === w && s.h === h ? s : { w, h }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = box.current;
    if (!el || !size) return;
    const ps = lines.current.filter((p): p is SVGPathElement => p !== null);
    const hs = heads.current;
    if (ps.length < 2) return;
    const lens = ps.map((p) => p.getTotalLength());
    ps.forEach((p, i) => {
      p.style.strokeDasharray = `${lens[i]} ${lens[i]}`;
    });

    const paint = (p: number) => {
      ps.forEach((path, i) => {
        // the right-hand line starts a beat later
        const t = clamp01((p - i * 0.06) / 0.9);
        const drawn = lens[i] * (t * t * (3 - 2 * t));
        path.style.strokeDashoffset = String(lens[i] - drawn);
        const head = hs[i];
        if (head) {
          const pt = path.getPointAtLength(drawn);
          head.setAttribute("cx", pt.x.toFixed(1));
          head.setAttribute("cy", pt.y.toFixed(1));
          head.style.opacity = drawn > 2 && drawn < lens[i] - 1 ? "1" : "0";
        }
      });
    };

    if (reducedMotion()) {
      paint(1);
      return;
    }

    let last = -1;
    return onScrollFrame(() => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom < -50 || r.top > vh + 50) return;
      // 0 as the section's top enters the bottom of the screen, 1 once its
      // middle has passed the middle of the screen
      const p = clamp01((vh - r.top) / (vh * 0.5 + r.height * 0.5));
      const q = Math.round(p * 1000) / 1000;
      if (q === last) return;
      last = q;
      paint(q);
    });
  }, [size]);

  const d = size ? paths(size, flip) : null;

  return (
    <div ref={box} aria-hidden="true" className={cn("pointer-events-none absolute left-1/2 -z-10 w-screen -translate-x-1/2", className)}>
      {size && d ? (
        <svg width={size.w} height={size.h} viewBox={`0 0 ${size.w} ${size.h}`} fill="none" className="absolute inset-0 overflow-visible">
          {d.map((path, i) => (
            <path
              key={i}
              ref={(p) => {
                lines.current[i] = p;
              }}
              d={path}
              stroke="#ffffff"
              strokeOpacity={i === 0 ? 0.5 : 0.28}
              strokeWidth={i === 0 ? 5 : 3.5}
              strokeLinecap="round"
              strokeDasharray="100000 100000"
              strokeDashoffset="100000"
            />
          ))}
          {d.map((_, i) => (
            <circle
              key={i}
              ref={(c) => {
                heads.current[i] = c;
              }}
              r={i === 0 ? 7 : 5.5}
              fill="#ffffff"
              fillOpacity={i === 0 ? 0.85 : 0.6}
              style={{ opacity: 0 }}
            />
          ))}
        </svg>
      ) : null}
    </div>
  );
}
