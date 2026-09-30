"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { compactMotion, onScrollFrame, reducedMotion } from "@/lib/scroll";

const TAU = Math.PI * 2;

/**
 * A ribbon of fine white lines that twists as you scroll: every line follows
 * the same wave, and the spacing between them swells and pinches, so the
 * bundle reads like a strip of silk turning in the light. Brighter at the
 * centre, fading at both ends.
 *
 * Drop it in a `relative isolate` section on navy; it spans the full screen
 * width and sits behind the content. Only redrawn while on screen, through the
 * shared scroll loop. Phones get fewer lines and points.
 */
export function SilkRibbon({
  className,
  seed = 0,
  tilt = 0,
}: {
  className?: string;
  /** Shifts the wave so two ribbons on a page don't match. */
  seed?: number;
  /** Rise across the width, as a fraction of the ribbon's height (-0.5…0.5). */
  tilt?: number;
}) {
  const box = useRef<HTMLDivElement>(null);
  const paths = useRef<(SVGPathElement | null)[]>([]);
  const [size, setSize] = useState<{ w: number; h: number; lines: number } | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = Math.round(entry.contentRect.width);
      const h = Math.round(entry.contentRect.height);
      const lines = compactMotion() ? 12 : 18;
      setSize((s) => (s && s.w === w && s.h === h && s.lines === lines ? s : { w, h, lines }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = box.current;
    if (!el || !size) return;
    const { w, h, lines } = size;
    const points = Math.max(24, Math.min(72, Math.round(w / 22)));
    // Tied to the width as well, so a tall, narrow box (a phone) gets a
    // gentle wave instead of steep arches.
    const amp = Math.min(h * 0.2, w * 0.1);
    const spread = Math.min(h * 0.42, w * 0.2);

    const draw = (phase: number) => {
      for (let i = 0; i < lines; i++) {
        const p = paths.current[i];
        if (!p) continue;
        const u = i / (lines - 1) - 0.5;
        let d = "";
        for (let j = 0; j <= points; j++) {
          const f = j / points;
          const x = f * w;
          const y =
            h / 2 +
            tilt * Math.min(h, w * 0.6) * (0.5 - f) +
            amp * Math.sin(TAU * (f * 0.85 + seed) + phase) +
            u * spread * (0.18 + 0.82 * Math.cos(TAU * (f * 0.55 - seed) - phase * 0.8));
          d += `${j ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
        }
        p.setAttribute("d", d);
      }
    };

    if (reducedMotion()) {
      draw(0.8);
      el.dataset.in = "";
      return;
    }

    let last = Infinity;
    return onScrollFrame(() => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom < -50 || r.top > vh + 50) return;
      if (!("in" in el.dataset) && r.top < vh * 0.85) el.dataset.in = "";
      // The ribbon turns about a third of a wave per screen of scroll.
      const phase = ((vh - r.top) / vh) * 2.1;
      if (Math.abs(phase - last) < 0.0015) return;
      last = phase;
      draw(phase);
    });
  }, [size, seed, tilt]);

  return (
    <div
      ref={box}
      aria-hidden="true"
      className={cn("silk pointer-events-none absolute left-1/2 -z-10 w-screen -translate-x-1/2", className)}
    >
      {size ? (
        <svg width={size.w} height={size.h} viewBox={`0 0 ${size.w} ${size.h}`} fill="none" className="absolute inset-0">
          {Array.from({ length: size.lines }, (_, i) => {
            const u = Math.abs(i / (size.lines - 1) - 0.5) * 2;
            return (
              <path
                key={i}
                ref={(p) => {
                  paths.current[i] = p;
                }}
                stroke="#ffffff"
                strokeOpacity={(0.08 + 0.34 * (1 - u)).toFixed(2)}
                strokeWidth={1}
              />
            );
          })}
        </svg>
      ) : null}
    </div>
  );
}
