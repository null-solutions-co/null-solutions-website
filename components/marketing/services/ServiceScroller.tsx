"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { onScrollFrame } from "@/lib/scroll";

export type ServiceItem = {
  code: string;
  name: string;
  description: string;
  includes: string[];
  accent: string;
  art: ReactNode;
};

type Labels = { of: string; includes: string; cta: string; jump: string };

/**
 * The services catalogue. Text on one side, one diagram panel held still on
 * the other: as each service reaches the middle of the screen it becomes the
 * "on" one, its diagram swaps in and builds itself. On phones each service
 * carries its own diagram inline.
 *
 * Which service is on is decided in the shared scroll loop and written straight
 * to data attributes, so scrolling never re-renders React.
 */
export function ServiceScroller({ items, labels }: { items: ServiceItem[]; labels: Labels }) {
  const blocks = useRef<(HTMLElement | null)[]>([]);
  const figs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    let current = -1;
    const set = (list: (HTMLElement | null)[], on: number) =>
      list.forEach((el, i) => el?.toggleAttribute("data-on", i === on));

    return onScrollFrame(() => {
      const mid = window.innerHeight * 0.5;
      let on = 0;
      blocks.current.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top < mid) on = i;
      });
      if (on === current) return;
      current = on;
      set(blocks.current, on);
      set(figs.current, on);
    });
  }, [items]);

  const n = String(items.length).padStart(2, "0");

  return (
    <section data-header="light" className="tone-light bg-ground text-fg">
      <div className="mx-auto max-w-[1400px] px-6 pb-28 pt-20 min-[900px]:px-[max(3rem,6vw)] md:pb-40">
        <nav aria-label={labels.jump} className="flex flex-wrap gap-2 border-b border-line pb-8">
          {items.map((it) => (
            <a
              key={it.code}
              href={`#${it.code.toLowerCase()}`}
              className="rounded-full border border-line bg-surface px-4 py-2 text-sm transition-colors hover:border-fg"
            >
              <span className="font-mono text-[0.7rem] tracking-[0.12em]" style={{ color: it.accent }}>
                {it.code}
              </span>
              <span className="ms-2">{it.name}</span>
            </a>
          ))}
        </nav>

        <div className="grid gap-16 pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:gap-20">
          <ol>
            {items.map((it, i) => (
              <li
                key={it.code}
                id={it.code.toLowerCase()}
                ref={(el) => {
                  blocks.current[i] = el;
                }}
                data-on={i === 0 ? "" : undefined}
                className="svc-block flex scroll-mt-28 flex-col justify-center gap-6 py-14 lg:min-h-[78vh] lg:py-0"
                style={{ "--c": it.accent } as CSSProperties}
              >
                <div
                  className="overflow-hidden rounded-3xl border border-line bg-surface p-6 lg:hidden"
                  style={{ background: `radial-gradient(120% 90% at 50% 0%, color-mix(in srgb, ${it.accent} 9%, white), white 70%)` }}
                >
                  {it.art}
                </div>
                <p className="font-mono text-xs tracking-[0.18em] text-fg-muted" dir="ltr">
                  <span style={{ color: it.accent }}>{it.code}</span> / {n}
                </p>
                <h2 className="mkt-display text-[clamp(2.2rem,4.4vw,4rem)]">{it.name}</h2>
                <p className="max-w-[46ch] text-[clamp(1.05rem,1.35vw,1.25rem)] leading-relaxed text-fg-muted">
                  {it.description}
                </p>
                <div>
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-fg-muted">{labels.includes}</p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {it.includes.map((x) => (
                      <li key={x} className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm">
                        {x}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  href="/contact"
                  className="group inline-flex w-fit items-center gap-2 border-b-2 pb-1 text-sm font-medium"
                  style={{ borderColor: it.accent }}
                >
                  {labels.cta}
                  <span className="transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1">→</span>
                </Link>
              </li>
            ))}
          </ol>

          <div className="hidden lg:block">
            <div className="sticky top-[max(14vh,calc(50vh-300px))] flex h-[min(72vh,600px)] gap-5">
              <div className="relative flex-1 overflow-hidden rounded-[32px] border border-line bg-surface shadow-[0_50px_100px_-50px_rgba(13,27,42,0.3)]">
                {items.map((it, i) => (
                  <figure
                    key={it.code}
                    ref={(el) => {
                      figs.current[i] = el;
                    }}
                    data-on={i === 0 ? "" : undefined}
                    className="svc-fig absolute inset-0 flex flex-col"
                    style={{
                      "--c": it.accent,
                      background: `radial-gradient(110% 80% at 50% 0%, color-mix(in srgb, ${it.accent} 10%, white), white 72%)`,
                    } as CSSProperties}
                    aria-hidden={true}
                  >
                    <figcaption className="flex items-center justify-between px-8 pt-7 font-mono text-xs tracking-[0.16em] text-fg-muted">
                      <span>{it.name}</span>
                      <span className="size-2.5 rounded-full" style={{ background: it.accent }} />
                    </figcaption>
                    <div className="flex flex-1 items-center justify-center px-8 pb-6">
                      <div className="w-full max-w-[560px]">{it.art}</div>
                    </div>
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
