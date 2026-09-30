"use client";

import { useEffect, useRef } from "react";
import { clamp01, compactMotion, onScrollFrame, ramp, reducedMotion } from "@/lib/scroll";
import { cn } from "@/lib/utils";

type Step = { title: string; body: string };

/** Shared stroke props for a line that draws itself in (see `draw`). */
const D = { pathLength: 1, strokeDasharray: "1", "data-draw": "" } as const;

/** Plan: a schedule, bars laid out one after another up to a milestone. */
function PlanArt() {
  return (
    <>
      <rect {...D} x="40" y="40" width="320" height="220" rx="14" />
      <path {...D} d="M40 82 H360" />
      <path {...D} d="M110 82 V260 M180 82 V260 M250 82 V260" strokeOpacity="0.25" />
      <path {...D} d="M62 62 h56" strokeOpacity="0.6" />
      <path {...D} d="M70 112 H176" strokeWidth="10" />
      <path {...D} d="M128 146 H262" strokeWidth="10" />
      <path {...D} d="M196 180 H300" strokeWidth="10" />
      <path {...D} d="M246 214 H318" strokeWidth="10" />
      <path {...D} d="M334 200 l12 14 -12 14 -12 -14 Z" />
    </>
  );
}

/** Build: a browser window and a phone, filling with lines of code. */
function BuildArt() {
  return (
    <>
      <rect {...D} x="28" y="46" width="262" height="200" rx="12" />
      <path {...D} d="M28 76 H290" />
      <path {...D} d="M48 61 h1 M60 61 h1 M72 61 h1" strokeWidth="6" />
      <path {...D} d="M58 104 l-12 10 12 10" />
      <path {...D} d="M76 114 H170" />
      <path {...D} d="M92 138 H226" strokeOpacity="0.6" />
      <path {...D} d="M92 160 H196" strokeOpacity="0.6" />
      <path {...D} d="M92 182 H246" strokeOpacity="0.6" />
      <path {...D} d="M76 206 H150" />
      <path {...D} d="M232 196 l12 10 -12 10" />
      <rect {...D} x="302" y="104" width="74" height="148" rx="14" />
      <path {...D} d="M326 118 h26" />
      <path {...D} d="M316 146 h46 M316 164 h34 M316 182 h40" strokeOpacity="0.6" />
      <path {...D} d="M316 222 h46" strokeWidth="10" />
    </>
  );
}

/** Secure: a shield around a lock, rings scanning out from it. */
function SecureArt() {
  return (
    <>
      <circle {...D} cx="200" cy="152" r="128" strokeOpacity="0.25" strokeDasharray="0.01 0.03" />
      <circle {...D} cx="200" cy="152" r="104" strokeOpacity="0.4" />
      <path {...D} d="M200 64 L266 90 V150 C266 196 238 224 200 242 C162 224 134 196 134 150 V90 Z" />
      <path {...D} d="M184 144 V128 a16 16 0 0 1 32 0 V144" />
      <rect {...D} x="172" y="144" width="56" height="44" rx="8" />
      <path {...D} d="M200 160 v12" strokeWidth="5" />
    </>
  );
}

/** Support: a steady pulse, and a conversation that keeps going. */
function SupportArt() {
  return (
    <>
      <path {...D} d="M20 172 H118 L138 132 L162 224 L188 112 L210 192 L228 172 H380" />
      <path {...D} d="M52 46 H196 a14 14 0 0 1 14 14 V88 a14 14 0 0 1 -14 14 H84 L64 118 V102 H52 a14 14 0 0 1 -14 -14 V60 a14 14 0 0 1 14 -14 Z" />
      <path {...D} d="M58 66 h110 M58 84 h70" strokeOpacity="0.6" />
      <path {...D} d="M348 206 H232 a14 14 0 0 0 -14 14 V246 a14 14 0 0 0 14 14 H320 L340 274 V260 H348 a14 14 0 0 0 14 -14 V220 a14 14 0 0 0 -14 -14 Z" />
      <path {...D} d="M238 226 h96 M238 242 h58" strokeOpacity="0.6" />
    </>
  );
}

const ARTS = [PlanArt, BuildArt, SecureArt, SupportArt];

function Art({ index, className }: { index: number; className?: string }) {
  const Drawing = ARTS[index % ARTS.length];
  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      stroke="#ffffff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ direction: "ltr" }}
      aria-hidden="true"
    >
      <Drawing />
    </svg>
  );
}

/** Draws an art's lines in, one after another, as `p` goes 0 → 1. */
function draw(paths: SVGElement[], p: number) {
  const n = paths.length;
  paths.forEach((el, j) => {
    const from = (j / n) * 0.55;
    el.style.strokeDashoffset = String(1 - ramp(p, from, from + 0.45));
  });
}

/**
 * The four steps as one pinned scroll (after 21st.dev "Scroll Reveal Content
 * A"). On a wide screen the list and a navy panel stay on screen while the
 * track scrolls past: each step's line fills in turn, its text lights up, and
 * the panel crossfades to that step's drawing, which draws itself in.
 * Phones and tablets: no pin; each step carries its own drawing and fills as
 * it comes up the screen. Reduced motion: everything drawn, all lit.
 */
export function WhoSteps({ steps }: { steps: Step[] }) {
  const track = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLLIElement | null)[]>([]);
  const bars = useRef<(HTMLSpanElement | null)[]>([]);
  const panels = useRef<(HTMLDivElement | null)[]>([]);
  const inline = useRef<(HTMLDivElement | null)[]>([]);
  const glow = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = track.current;
    if (!root) return;
    const lines = (el: Element | null) => (el ? Array.from(el.querySelectorAll<SVGElement>("[data-draw]")) : []);
    const panelLines = panels.current.map(lines);
    const inlineLines = inline.current.map(lines);

    const light = (i: number, p: number) => {
      const bar = bars.current[i];
      if (bar) bar.style.transform = `scaleY(${p.toFixed(3)})`;
      items.current[i]?.toggleAttribute("data-on", p > 0);
    };

    if (reducedMotion()) {
      steps.forEach((_, i) => {
        light(i, 1);
        draw(panelLines[i], 1);
        draw(inlineLines[i], 1);
        panels.current[i]?.toggleAttribute("data-on", i === 0);
      });
      return;
    }

    let last = "";
    return onScrollFrame(() => {
      const r = root.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom < -80 || r.top > vh + 80) return;

      if (compactMotion() || window.innerWidth < 1024) {
        // unpinned: each step fills from its own position on screen
        const key = items.current.map((li, i) => {
          if (!li) return 0;
          const b = li.getBoundingClientRect();
          const p = Math.round(clamp01((vh * 0.88 - b.top) / (b.height * 0.9)) * 500) / 500;
          light(i, p);
          draw(inlineLines[i], p);
          return p;
        }).join();
        last = key;
        return;
      }

      // pinned: t runs 0 → 1 across the track; each step owns a quarter
      const t = Math.round(clamp01(-r.top / Math.max(1, r.height - vh)) * 2000) / 2000;
      const key = String(t);
      if (key === last) return;
      last = key;
      const n = steps.length;
      const at = Math.min(n - 1, Math.floor(t * n));
      steps.forEach((_, i) => {
        const p = clamp01(t * n - i);
        light(i, p);
        panels.current[i]?.toggleAttribute("data-on", i === at);
        draw(panelLines[i], i === at ? clamp01(p * 1.6) : i < at ? 1 : 0);
      });
      if (glow.current) glow.current.style.transform = `translate3d(0, ${((t - 0.5) * -60).toFixed(1)}px, 0)`;
    });
  }, [steps]);

  return (
    <div ref={track} className="relative lg:h-[380vh]">
      <div className="mx-auto max-w-[1600px] px-6 py-20 min-[900px]:px-[max(3rem,6vw)] md:py-28 lg:sticky lg:top-0 lg:flex lg:h-screen lg:items-center lg:py-0">
        <div className="grid w-full gap-16 lg:grid-cols-2 lg:items-center lg:gap-[clamp(3rem,6vw,8rem)]">
          <ol className="flex flex-col gap-12 lg:gap-[clamp(1.5rem,4vh,3rem)]">
            {steps.map((s, i) => (
              <li
                key={s.title}
                ref={(el) => {
                  items.current[i] = el;
                }}
                className="who-step group flex flex-col gap-4"
              >
                <span className="w-fit font-mono text-sm text-fg-muted transition-colors duration-500 group-data-[on]:text-fg" dir="ltr">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex gap-6">
                  <span aria-hidden="true" className="relative w-[2px] shrink-0 overflow-hidden rounded-full bg-white/12">
                    <span
                      ref={(el) => {
                        bars.current[i] = el;
                      }}
                      className="absolute inset-0 origin-top bg-white"
                      style={{ transform: "scaleY(0)" }}
                    />
                  </span>
                  <div className="flex flex-col gap-2 py-1 opacity-40 transition-opacity duration-500 group-data-[on]:opacity-100">
                    <h3 className="text-[clamp(1.5rem,2.4vw,2.1rem)] font-semibold tracking-tight">{s.title}</h3>
                    <p className="max-w-[40ch] text-[clamp(1rem,1.2vw,1.125rem)] leading-relaxed text-fg-muted">{s.body}</p>
                  </div>
                </div>
                <div
                  ref={(el) => {
                    inline.current[i] = el;
                  }}
                  className="mt-4 overflow-hidden rounded-3xl border border-white/10 bg-signal lg:hidden"
                >
                  <Art index={i} className="h-auto w-full p-6" />
                </div>
              </li>
            ))}
          </ol>

          <div aria-hidden="true" className="relative hidden aspect-[4/3] w-full overflow-hidden rounded-[2rem] border border-white/10 bg-signal lg:block">
            <div
              ref={glow}
              className="pointer-events-none absolute inset-[-20%] opacity-60"
              style={{
                backgroundImage: "radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1px)",
                backgroundSize: "26px 26px",
                maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
              }}
            />
            {steps.map((s, i) => (
              <div
                key={s.title}
                ref={(el) => {
                  panels.current[i] = el;
                }}
                className={cn(
                  "absolute inset-0 flex items-center justify-center p-[8%] opacity-0 transition-[opacity,transform] duration-700 ease-out",
                  "scale-[0.97] data-[on]:scale-100 data-[on]:opacity-100",
                )}
              >
                <Art index={i} className="h-full w-full" />
                <span className="absolute bottom-6 start-7 font-mono text-xs uppercase tracking-[0.2em] text-white/60">{s.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
