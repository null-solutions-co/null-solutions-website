"use client";

import { useState, type ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export type Offer = {
  code: string;
  name: string;
  description: string;
  includes: string[];
  art: ReactNode;
};

type Labels = { includes: string; details: string };

/**
 * What we offer, as an index you explore: the eleven services in large type on
 * one side, and a panel on the other that shows the one you point at — its
 * diagram building itself, what it is, what's in it. On phones the list opens
 * like an accordion instead.
 */
export function OfferExplorer({ items, labels }: { items: Offer[]; labels: Labels }) {
  const [on, setOn] = useState(0);
  const current = items[on];

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
      <ol className="border-t border-line">
        {items.map((it, i) => {
          const active = i === on;
          return (
            <li key={it.code} className="border-b border-line">
              <button
                type="button"
                aria-expanded={active}
                aria-controls={`offer-${it.code}`}
                onMouseEnter={() => setOn(i)}
                onFocus={() => setOn(i)}
                onClick={() => setOn(i)}
                className="group flex w-full items-center gap-5 py-4 text-start md:py-5"
              >
                <span
                  className={cn("w-10 shrink-0 font-mono text-xs tracking-[0.12em] transition-colors", active ? "text-signal-ink" : "text-fg-muted")}
                  dir="ltr"
                >
                  {it.code}
                </span>
                <span
                  className={cn(
                    "flex-1 text-[clamp(1.35rem,2.4vw,2.1rem)] font-semibold tracking-tight transition-[color,transform] duration-500",
                    active ? "translate-x-2 text-fg rtl:-translate-x-2" : "text-fg-muted group-hover:text-fg",
                  )}
                >
                  {it.name}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full border transition-all duration-500",
                    active ? "border-transparent bg-signal text-white" : "border-line text-fg-muted",
                  )}
                >
                  <span className="rtl:rotate-180">→</span>
                </span>
              </button>

              {/* phones: the details open under the row */}
              <div id={`offer-${it.code}`} className={cn("lg:hidden", active ? "block pb-8" : "hidden")} data-on={active ? "" : undefined}>
                <div className="rounded-3xl border border-line bg-surface p-5">{it.art}</div>
                <p className="mt-5 leading-relaxed text-fg-muted">{it.description}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {it.includes.map((x) => (
                    <li key={x} className="rounded-full border border-line px-3 py-1 text-sm">
                      {x}
                    </li>
                  ))}
                </ul>
                <Link href={`/services#${it.code.toLowerCase()}`} className="mt-5 inline-flex items-center gap-2 border-b-2 border-signal pb-1 text-sm font-medium">
                  {labels.details} <span className="rtl:rotate-180">→</span>
                </Link>
              </div>
            </li>
          );
        })}
      </ol>

      {/* wide screens: one panel, held in view, swapping to the service you point at */}
      <div className="hidden lg:block">
        <div className="sticky top-[14vh] overflow-hidden rounded-[32px] border border-line bg-surface">
          <div className="relative aspect-[4/3] bg-[radial-gradient(110%_80%_at_50%_0%,color-mix(in_srgb,var(--signal)_12%,white),white_72%)]">
            {items.map((it, i) => (
              <div
                key={it.code}
                data-on={i === on ? "" : undefined}
                className="svc-fig absolute inset-0 flex items-center justify-center p-10"
                style={{ "--c": "var(--signal)" } as React.CSSProperties}
                aria-hidden={i !== on}
              >
                <div className="w-full max-w-[520px]">{it.art}</div>
              </div>
            ))}
          </div>
          <div className="border-t border-line p-8">
            <p className="font-mono text-xs tracking-[0.14em] text-signal-ink" dir="ltr">
              {current.code}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{current.name}</p>
            <p className="mt-3 max-w-[52ch] leading-relaxed text-fg-muted">{current.description}</p>
            <p className="mt-5 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-fg-muted">{labels.includes}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {current.includes.map((x) => (
                <li key={x} className="rounded-full border border-line px-3 py-1 text-sm">
                  {x}
                </li>
              ))}
            </ul>
            <Link
              href={`/services#${current.code.toLowerCase()}`}
              className="mt-6 inline-flex items-center gap-2 border-b-2 border-signal pb-1 text-sm font-medium"
            >
              {labels.details} <span className="rtl:rotate-180">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
