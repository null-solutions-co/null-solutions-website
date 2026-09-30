"use client";

import { useEffect, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { isActive } from "./NavLinks";

type Item = { href: string; label: string };

/**
 * Phone navigation: one button in the header, a full-screen sheet of links.
 * Closes on navigation and on Escape, and pauses the smooth scroll while open.
 */
export function MobileNav({ items, labels, extra }: { items: Item[]; labels: { open: string; close: string }; extra?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [seen, setSeen] = useState(pathname);

  // A route change closes the sheet (adjusting state during render, not in an effect).
  if (seen !== pathname) {
    setSeen(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    window.dispatchEvent(new Event("lenis-stop"));
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.dispatchEvent(new Event("lenis-start"));
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((v) => !v)}
        className={`relative z-50 flex h-10 items-center gap-2 rounded-full border border-current/25 px-4 font-mono text-[0.7rem] uppercase tracking-[0.16em] ${open ? "text-[#fafafa]" : ""}`}
      >
        {open ? labels.close : labels.open}
        <span aria-hidden="true" className="flex w-3.5 flex-col gap-[3px]">
          <span className={`h-px bg-current transition-transform ${open ? "translate-y-[2px] rotate-45" : ""}`} />
          <span className={`h-px bg-current transition-transform ${open ? "-translate-y-[2px] -rotate-45" : ""}`} />
        </span>
      </button>

      <div
        id="mobile-nav"
        hidden={!open}
        className="fixed inset-0 z-40 flex flex-col justify-end bg-[#0a0a0a] px-6 pb-10 pt-24 text-[#fafafa]"
      >
        <ul className="flex flex-col">
          {items.map((it) => (
            <li key={it.href} className="border-b border-white/10">
              <Link
                href={it.href}
                aria-current={isActive(it.href, pathname) ? "page" : undefined}
                className="flex items-center gap-3 py-4 text-3xl font-semibold tracking-tight aria-[current=page]:text-white"
                onClick={() => setOpen(false)}
              >
                {isActive(it.href, pathname) ? <span className="font-mono text-2xl text-signal-ink">/</span> : null}
                <span className={isActive(it.href, pathname) ? "" : "text-white/70"}>{it.label}</span>
              </Link>
            </li>
          ))}
        </ul>
        {extra ? <div className="mt-8 flex items-center gap-6 font-mono text-xs uppercase tracking-[0.16em] text-white/70">{extra}</div> : null}
      </div>
    </div>
  );
}
