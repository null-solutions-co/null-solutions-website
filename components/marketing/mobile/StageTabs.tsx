"use client";

import { useRef, useState } from "react";
import type { Stage } from "../MethodJourney";

/**
 * Phones: the ten stages without the pinned scroll. A row of chips you can
 * swipe (S0 … S9); tapping one, or swiping the card sideways, moves to it. The
 * card underneath swaps with a short slide in the direction you moved, and a
 * bar fills to show how far along the journey that stage is.
 */
export function StageTabs({ eyebrow, title, body, stages }: { eyebrow: string; title: string; body: string; stages: Stage[] }) {
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const chips = useRef<(HTMLButtonElement | null)[]>([]);
  const touch = useRef<number | null>(null);
  const s = stages[active];

  const go = (i: number) => {
    const next = Math.max(0, Math.min(stages.length - 1, i));
    if (next === active) return;
    setDir(next > active ? 1 : -1);
    setActive(next);
    chips.current[next]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  return (
    <section className="bg-ground py-20 text-fg md:hidden">
      <div className="flex flex-col gap-4 px-6">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-fg-muted">
          <span className="text-signal-ink">/</span>&nbsp; {eyebrow}
        </p>
        <h2 className="mkt-display text-[2.2rem] leading-tight">{title}</h2>
        <p className="text-fg-muted">{body}</p>
      </div>

      <div className="mt-8 flex snap-x gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist">
        {stages.map((st, i) => (
          <button
            key={st.code}
            ref={(el) => {
              chips.current[i] = el;
            }}
            type="button"
            role="tab"
            aria-selected={i === active}
            onClick={() => go(i)}
            className={`flex shrink-0 snap-start items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-[background-color,color,border-color,transform] duration-300 active:scale-95 ${
              i === active ? "border-transparent bg-white text-black" : i < active ? "border-white/25 text-white/80" : "border-white/12 text-white/60"
            }`}
          >
            <span className="font-mono text-[11px] opacity-70" dir="ltr">
              {st.label}
            </span>
            {st.name}
          </button>
        ))}
      </div>

      <div className="px-6">
        <div className="mt-5 h-[2px] overflow-hidden rounded-full bg-white/10" aria-hidden="true">
          <div className="h-full origin-left rounded-full bg-white transition-transform duration-700 ease-out rtl:origin-right" style={{ transform: `scaleX(${(active + 1) / stages.length})` }} />
        </div>

        <div
          className="relative mt-5 overflow-hidden rounded-3xl border border-line bg-surface"
          onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touch.current == null) return;
            const dx = e.changedTouches[0].clientX - touch.current;
            touch.current = null;
            if (Math.abs(dx) < 50) return;
            const rtl = document.documentElement.dir === "rtl";
            go(active + ((dx < 0) !== rtl ? 1 : -1));
          }}
        >
          <div key={s.code} className="ns-stage-card flex min-h-[250px] flex-col justify-between gap-6 p-7" data-dir={dir}>
            <span className="mkt-display text-[5rem] leading-none" dir="ltr">
              {s.label}
            </span>
            <div className="flex flex-col gap-2">
              <p className="text-xl font-semibold">{s.name}</p>
              <p className="leading-relaxed text-fg-muted">{s.line}</p>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-line px-5 py-3">
            <button type="button" onClick={() => go(active - 1)} disabled={active === 0} aria-label="Previous stage" className="flex size-10 items-center justify-center rounded-full border border-line transition-transform active:scale-90 disabled:opacity-30">
              <span className="rtl:rotate-180">←</span>
            </button>
            <span className="font-mono text-xs text-fg-muted" dir="ltr">
              {String(active + 1).padStart(2, "0")} / {stages.length}
            </span>
            <button type="button" onClick={() => go(active + 1)} disabled={active === stages.length - 1} aria-label="Next stage" className="flex size-10 items-center justify-center rounded-full bg-white text-black transition-transform active:scale-90 disabled:opacity-30">
              <span className="rtl:rotate-180">→</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
