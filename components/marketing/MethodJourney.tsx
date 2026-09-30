"use client";

import { useEffect, useRef } from "react";
import { onTrackFrame, ramp } from "@/lib/scroll";

export type Stage = { code: string; label: string; name: string; line: string };

const CARD = 320;
const GAP = 20;

/**
 * The ten stages as a journey. The section pins and the row of stages slides
 * past as you scroll; the stage you're on lifts and lights, the ones behind you
 * stay filled, the ones ahead stay outlined. Scroll-driven only.
 */
export function MethodJourney({
  eyebrow,
  title,
  body,
  stages,
}: {
  eyebrow: string;
  title: string;
  body: string;
  stages: Stage[];
}) {
  const track = useRef<HTMLElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const t = track.current;
    const r = rail.current;
    if (!t || !r) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      t.dataset.still = "";
      return;
    }
    const n = stages.length;
    let last = -1;
    let target = 0;
    let shown = 0;
    let raf = 0;

    const render = (pos: number) => {
      const rtl = document.documentElement.dir === "rtl";
      r.style.transform = `translate3d(${(rtl ? 1 : -1) * pos * (CARD + GAP)}px, 0, 0)`;
      const active = Math.round(pos);
      if (active === last) return;
      last = active;
      cards.current.forEach((c, i) => {
        if (c) c.dataset.state = i < active ? "done" : i === active ? "now" : "next";
      });
    };

    // The rail glides toward where the scroll says it should be instead of
    // snapping there, so a flick of the wheel reads as one smooth swing.
    const glide = () => {
      shown += (target - shown) * 0.12;
      if (Math.abs(target - shown) < 0.001) shown = target;
      render(shown);
      raf = shown === target ? 0 : requestAnimationFrame(glide);
    };

    const stop = onTrackFrame(t, (p) => {
      const raw = p * (n - 1); // continuous 0…9
      // A short rest on each stage, then a long, eased move to the next.
      const base = Math.floor(raw);
      target = Math.min(n - 1, base + ramp(raw - base, 0.18, 0.82));
      if (!raf) raf = requestAnimationFrame(glide);
    });
    return () => {
      stop();
      cancelAnimationFrame(raf);
    };
  }, [stages]);

  return (
    <section ref={track} className="ns-pin-track relative h-[420vh] bg-ground text-fg">
      <div className="ns-pin-stage sticky top-0 flex h-screen flex-col justify-center gap-10 overflow-hidden py-20">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-end justify-between gap-6 px-6">
          <div className="flex max-w-2xl flex-col gap-4">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-fg-muted">
              <span className="text-signal-ink">/</span>&nbsp; {eyebrow}
            </p>
            <h2 className="mkt-display text-[clamp(2rem,5vw,4rem)]">{title}</h2>
            <p className="max-w-[52ch] text-fg-muted">{body}</p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-6xl px-6">
          <div ref={rail} className="ns-journey flex gap-5 will-change-transform" style={{ gap: GAP }}>
            {stages.map((s, i) => (
              <div
                key={s.code}
                ref={(el) => {
                  cards.current[i] = el;
                }}
                data-state={i === 0 ? "now" : "next"}
                className="ns-stage flex shrink-0 flex-col justify-between rounded-3xl border border-line p-7"
                style={{ width: CARD, height: 340 }}
              >
                <span className="ns-stage-num mkt-display text-[5.5rem] leading-none" dir="ltr">
                  {s.label}
                </span>
                <div className="flex flex-col gap-2">
                  <p className="text-xl font-semibold">{s.name}</p>
                  <p className="text-sm leading-relaxed text-fg-muted">{s.line}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
