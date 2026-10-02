"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { Reveal } from "./Reveal";
import { compactMotion, onScrollFrame, ramp, reducedMotion } from "@/lib/scroll";
import type { Camera } from "./demos/Scenes";
import { DemoDialog, type DemoLabels } from "./DemoDialog";
import { WorkRail } from "./mobile/WorkRail";

/** Demos and scenes are both authored at this size, then scaled to the stage. */
const DESIGN_W = 1280;
const DESIGN_H = 800;
/** Where the first card pins, and how much each later card steps down. */
const PIN_TOP_VH = 10;
const STEP_PX = 14;

export type WorkItem = {
  code: string;
  name: string;
  tag: string;
  description?: string;
  /** Card colours — each line has its own. */
  bg: string;
  fg: string;
  /** The wide shot the card opens on — a lens, a phone, a browser on a desk. */
  scene: ReactNode;
  /** Where the camera pushes in, and how far. */
  camera: Camera;
  /** The interface this line of work actually ships. */
  demo: ReactNode;
};

type Layers = { wrap: HTMLElement; card: HTMLElement; shade: HTMLElement; scene: HTMLElement; inner: HTMLElement; camera: Camera };

/**
 * The ten lines as a stack. Each card rises and pins just below the one before;
 * while it rises, the camera pushes from its scene into the live product, and
 * the card underneath steps back and dims. Scroll-driven only; one shared loop.
 */
export function WorkGrid({
  eyebrow,
  title,
  intro,
  link,
  note,
  labels,
  items,
}: {
  /** Omit the heading when the page already opens with a PageIntro. */
  eyebrow?: string;
  title?: string;
  intro?: string;
  link?: string;
  /** Honest label: these are concept builds, not client work (Gate 0 #4). */
  note: string;
  labels: DemoLabels & { open: string; hint: string };
  items: WorkItem[];
}) {
  const layers = useRef<(Layers | null)[]>([]);
  const [open, setOpen] = useState<WorkItem | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const all = layers.current.filter((l): l is Layers => l !== null);
    // Reduced motion: the product itself, no camera push.
    if (reducedMotion()) {
      for (const l of all) {
        l.scene.hidden = true;
        l.inner.style.opacity = "1";
      }
      return;
    }

    // Phones and tablets: no camera push at all — the scene fades into the
    // product instead, cards don't scale, and a card with two more pinned over
    // it stops being painted. Even a capped zoom of 1280px layers, times ten
    // stacked cards, was enough for iOS Safari to run out of memory.
    const compact = compactMotion();
    const last = all.map(() => ({ p: -1, cover: -1, buried: false }));
    // Only what is moving right now gets its own GPU layer, so a frame moves
    // layers instead of repainting whole cards; it drops back once settled
    // (a layer kept forever costs memory, and ten of them add up).
    const layer = (el: HTMLElement, what: string, on: boolean) => {
      const v = on ? what : "auto";
      if (el.style.willChange !== v) el.style.willChange = v;
    };

    return onScrollFrame(() => {
      const vh = window.innerHeight;
      // Read every rect first, then write: interleaving the two forces a
      // style recalc per card per frame.
      const tops = all.map((l) => l.wrap.getBoundingClientRect().top);
      all.forEach((l, i) => {
        const pin = (vh * PIN_TOP_VH) / 100 + i * STEP_PX;
        const top = tops[i];
        if (top > vh + 50) return;

        // Rising: 0 as it enters at the bottom, 1 once pinned. The sticky
        // offset is in CSS vh, which on phones isn't always innerHeight, so
        // "almost pinned" counts as pinned.
        const rise = Math.min(Math.max((vh - top) / (vh - pin), 0), 1);
        // 1/1000 steps: finer than a pixel of movement, and it lets
        // unchanged frames skip their writes
        const p = rise > 0.97 ? 1 : Math.round(rise * 1000) / 1000;
        if (p !== last[i].p) {
          last[i].p = p;
          const push = ramp(p, 0.2, 0.92);
          const cross = ramp(p, 0.78, 1);
          const { focal, land, zoom } = l.camera;
          // Only what's on screen stays painted: the scene until the demo has
          // fully faded in, the demo from the moment it starts to.
          l.scene.style.visibility = cross >= 1 ? "hidden" : "visible";
          l.inner.style.visibility = cross <= 0 ? "hidden" : "visible";
          layer(l.inner, "opacity", cross > 0 && cross < 1);
          layer(l.scene, "transform, opacity", !compact && push > 0 && cross < 1);
          if (cross < 1) {
            l.scene.style.setProperty("--e", push.toFixed(3));
            l.scene.style.transform =
              push > 0 && !compact
                ? `translate(${(land[0] - focal[0]) * push}px, ${(land[1] - focal[1]) * push}px) scale(${1 + (zoom - 1) * push})`
                : "none";
            l.scene.style.opacity = String(1 - cross);
          }
          l.inner.style.opacity = String(cross);
        }

        // Covered: the next card sliding over this one.
        let cover = 0;
        if (i + 1 < all.length) {
          const nPin = pin + STEP_PX;
          cover = Math.round(Math.min(Math.max((vh - tops[i + 1]) / (vh - nPin), 0), 1) * 1000) / 1000;
        }
        if (cover !== last[i].cover) {
          last[i].cover = cover;
          if (!compact) {
            layer(l.card, "transform", cover > 0 && cover < 1);
            l.card.style.transform = cover > 0 ? `scale(${(1 - cover * 0.06).toFixed(4)})` : "none";
          }
          layer(l.shade, "opacity", cover > 0 && cover < 1);
          l.shade.style.opacity = (cover * 0.55).toFixed(3);
        }

        if (compact && i + 2 < all.length) {
          // pinned cards sit STEP_PX apart, so "two cards down is pinned too"
          // is simply: it's within two steps of this one
          const buried = tops[i + 2] <= tops[i] + 2 * STEP_PX + 2;
          if (buried !== last[i].buried) {
            last[i].buried = buried;
            l.card.style.visibility = buried ? "hidden" : "visible";
          }
        }
      });
    });
  }, []);

  const openDemo = (it: WorkItem, from: HTMLElement) => {
    opener.current = from;
    setOpen(it);
  };

  return (
    <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      {title ? (
        <Reveal className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div className="flex max-w-3xl flex-col gap-4">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-fg-muted">
              <span className="text-signal-ink">/</span>&nbsp; {eyebrow}
            </p>
            <h2 className="mkt-display text-[clamp(2rem,6vw,4rem)]">{title}</h2>
            {intro ? <p className="max-w-[60ch] text-lg text-fg-muted">{intro}</p> : null}
          </div>
          {link ? (
            <Link
              href="/services"
              className="font-mono text-xs uppercase tracking-[0.14em] text-fg-muted transition-colors hover:text-fg"
            >
              {link} <span className="inline-block rtl:rotate-180">→</span>
            </Link>
          ) : null}
        </Reveal>
      ) : null}

      <WorkRail
        items={items}
        hint={labels.hint}
        openLabel={labels.open}
        onOpen={(i, from) => openDemo(items[i], from)}
      />

      {/* wide screens: the pinned stack (phones get the rail above) */}
      <div className="relative max-md:hidden">
        {items.map((it, i) => (
          <div
            key={it.code}
            ref={(wrap) => {
              if (!wrap) {
                layers.current[i] = null;
                return;
              }
              const card = wrap.querySelector<HTMLElement>("[data-card]");
              const shade = wrap.querySelector<HTMLElement>("[data-shade]");
              const scene = wrap.querySelector<HTMLElement>("[data-scene]");
              const inner = wrap.querySelector<HTMLElement>("[data-inner]");
              layers.current[i] = card && shade && scene && inner ? { wrap, card, shade, scene, inner, camera: it.camera } : null;
            }}
            className="sticky mb-[14vh] last:mb-0"
            style={{ top: `calc(${PIN_TOP_VH}vh + ${i * STEP_PX}px)` }}
          >
            <article
              data-card
              className="relative grid h-[min(80vh,700px)] origin-top max-md:h-auto grid-rows-[auto_1fr] overflow-hidden rounded-[28px] shadow-[0_-30px_60px_-30px_rgba(0,0,0,0.6)] md:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] md:grid-rows-1"
              style={{ background: it.bg, color: it.fg }}
            >
              <div className="flex flex-col gap-4 p-6 md:justify-between md:p-10">
                <p className="font-mono text-xs uppercase tracking-[0.2em] opacity-60">
                  {it.code} <span className="opacity-50">/ 10</span>
                </p>
                <div className="flex flex-col gap-3 md:gap-4">
                  <h3 className="mkt-display text-[clamp(1.9rem,3.6vw,3.4rem)]">{it.name}</h3>
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] opacity-60">{it.tag}</p>
                  {it.description ? <p className="max-w-[40ch] opacity-75 max-md:hidden">{it.description}</p> : null}
                </div>
                <div className="flex items-center gap-4 max-md:hidden">
                  <button
                    type="button"
                    aria-haspopup="dialog"
                    aria-label={`${labels.open}: ${it.name}`}
                    onClick={(e) => openDemo(it, e.currentTarget)}
                    className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-mono text-xs uppercase tracking-[0.14em] transition-transform hover:-translate-y-0.5"
                    style={{ background: it.fg, color: it.bg }}
                  >
                    {labels.hint} <span className="rtl:rotate-180">→</span>
                  </button>
                </div>
              </div>

              <div className="relative m-3 overflow-hidden rounded-[20px] bg-black/20 [contain:paint] max-md:aspect-[16/10] md:m-4 md:ms-0">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2" style={{ containerType: "inline-size" }}>
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    {/* Decorative: the card's heading and button carry the meaning.
                        Demos are English product UI, so they stay LTR. */}
                    <div
                      aria-hidden="true"
                      inert
                      dir="ltr"
                      className="pointer-events-none absolute left-0 top-0 overflow-hidden"
                      style={{
                        width: DESIGN_W,
                        height: DESIGN_H,
                        transformOrigin: "top left",
                        transform: `scale(calc(100cqw / ${DESIGN_W}px))`,
                      }}
                    >
                      <div
                        data-scene
                        className="absolute inset-0"
                        style={{ transformOrigin: `${it.camera.focal[0]}px ${it.camera.focal[1]}px` }}
                      >
                        {it.scene}
                      </div>
                      <div data-inner className="absolute inset-0" style={{ opacity: 0 }}>
                        {it.demo}
                      </div>
                    </div>
                  </div>
                </div>
                {/* The whole stage opens the demo too — for pointers; keyboard uses the button. */}
                <button
                  type="button"
                  tabIndex={-1}
                  aria-hidden="true"
                  onClick={(e) => openDemo(it, e.currentTarget)}
                  className="absolute inset-0 z-10 cursor-pointer"
                />
                <button
                  type="button"
                  aria-haspopup="dialog"
                  aria-label={`${labels.open}: ${it.name}`}
                  onClick={(e) => openDemo(it, e.currentTarget)}
                  className="absolute bottom-4 end-4 z-20 rounded-full bg-white px-5 py-2.5 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-black md:hidden"
                >
                  {labels.hint} <span className="inline-block rtl:rotate-180">→</span>
                </button>
              </div>

              <div data-shade aria-hidden="true" className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: 0 }} />
            </article>
          </div>
        ))}
      </div>

      <p className="mt-16 text-center font-mono text-[0.62rem] uppercase tracking-[0.16em] text-fg-muted">{note}</p>

      {open ? (
        <DemoDialog
          code={open.code}
          name={open.name}
          labels={labels}
          onClose={() => {
            setOpen(null);
            opener.current?.focus();
          }}
        />
      ) : null}
    </section>
  );
}
