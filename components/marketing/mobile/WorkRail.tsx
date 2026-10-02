"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";

export type RailItem = { code: string; name: string; tag: string; bg: string; fg: string; demo: ReactNode };

/**
 * Phones: the ten lines of work as a row you swipe through. Cards snap to the
 * middle and the dots below follow along. Nothing on the cards moves except the
 * swipe itself (scaling, fading or sliding them in made them judder on iPhone),
 * and all ten pictures load up front so none shows empty mid-swipe. The row slides
 * in from the side the first time it comes into view. Tapping a card (or its
 * button) opens the live demo, same as on a wide screen.
 */
export function WorkRail({
  items,
  hint,
  openLabel,
  onOpen,
}: {
  items: RailItem[];
  hint: string;
  openLabel: string;
  onOpen: (index: number, opener: HTMLElement) => void;
}) {
  const rail = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);

  // Which card sits in the middle: an observer on the row itself, so nothing
  // measures layout while the finger is moving (that made iOS judder).
  useEffect(() => {
    const r = rail.current;
    if (!r) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
      },
      { root: r, threshold: 0.6 },
    );
    cards.current.forEach((c) => c && io.observe(c));
    return () => io.disconnect();
  }, []);

  const goTo = (i: number) => cards.current[i]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });

  return (
    <div className="md:hidden">
      <div
        ref={rail}
        className="ns-rail -mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-[9vw] pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((it, i) => (
          <article
            key={it.code}
            ref={(el) => {
              cards.current[i] = el;
            }}
            data-index={i}
            className="ns-rail__card relative flex w-[82vw] max-w-[360px] shrink-0 snap-center flex-col gap-3 overflow-hidden rounded-[26px] p-5"
            style={{ background: it.bg, color: it.fg, "--i": i } as React.CSSProperties}
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] opacity-60" dir="ltr">
              {it.code} <span className="opacity-50">/ 10</span>
            </p>
            <h3 className="text-[1.75rem] font-medium leading-tight tracking-tight">{it.name}</h3>
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] opacity-60">{it.tag}</p>
            <div className="relative mt-1 overflow-hidden rounded-2xl bg-black/20">
              {/* a picture of the live demo: ten full demo pages resizing as you
                  swipe made phones drop frames; tapping still opens the real one */}
              <div className="relative aspect-[16/10] w-full">
                <Image src={`/work/${it.code}.webp`} alt="" fill sizes="82vw" unoptimized loading="eager" className="object-cover" />
              </div>
              <button
                type="button"
                tabIndex={-1}
                aria-hidden="true"
                onClick={(e) => onOpen(i, e.currentTarget)}
                className="absolute inset-0 z-10"
              />
            </div>
            <button
              type="button"
              aria-haspopup="dialog"
              aria-label={`${openLabel}: ${it.name}`}
              onClick={(e) => onOpen(i, e.currentTarget)}
              className="mt-1 inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 font-mono text-[0.68rem] uppercase tracking-[0.14em] transition-transform active:scale-95"
              style={{ background: it.fg, color: it.bg }}
            >
              {hint} <span className="inline-block rtl:rotate-180">→</span>
            </button>
          </article>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-center gap-1.5" aria-hidden="true">
        {items.map((it, i) => (
          <button
            key={it.code}
            type="button"
            tabIndex={-1}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${i === active ? "w-6 bg-fg" : "w-1.5 bg-fg/25"}`}
          />
        ))}
      </div>
    </div>
  );
}
