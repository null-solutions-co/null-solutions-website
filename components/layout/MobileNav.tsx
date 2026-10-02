"use client";

import { useEffect, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { isActive } from "./NavLinks";

type Item = { href: string; label: string };

/**
 * Phone navigation: one button in the header opens a full-screen sheet. The
 * sheet grows out of the button as a circle, the links rise in one after
 * another, and the language switch and email sit at the
 * bottom. Closes on navigation and on Escape, and pauses the smooth scroll
 * and hides the tab bar while open.
 */
export function MobileNav({
  items,
  labels,
  extra,
  email,
}: {
  items: Item[];
  labels: { open: string; close: string };
  extra?: React.ReactNode;
  email?: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [seen, setSeen] = useState(pathname);

  // A route change closes the sheet (adjusting state during render, not in an effect).
  if (seen !== pathname) {
    setSeen(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const html = document.documentElement;
    if (!open) {
      delete html.dataset.menu;
      return;
    }
    html.dataset.menu = "open";
    window.dispatchEvent(new Event("lenis-stop"));
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.dispatchEvent(new Event("lenis-start"));
      delete html.dataset.menu;
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((v) => !v)}
        className={`relative z-50 flex h-10 items-center gap-2 rounded-full border border-current/25 px-4 font-mono text-[0.7rem] uppercase tracking-[0.16em] transition-transform active:scale-95 ${open ? "text-[#fafafa]" : ""}`}
      >
        {open ? labels.close : labels.open}
        <span aria-hidden="true" className="flex w-3.5 flex-col gap-[3px]">
          <span className={`h-px bg-current transition-transform duration-300 ${open ? "translate-y-[2px] rotate-45" : ""}`} />
          <span className={`h-px bg-current transition-transform duration-300 ${open ? "-translate-y-[2px] -rotate-45" : ""}`} />
        </span>
      </button>

      <div
        id="mobile-nav"
        data-open={open ? "" : undefined}
        aria-hidden={!open}
        inert={!open}
        className="ns-menu fixed inset-0 z-40 flex flex-col bg-[#0a0a0a] px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-28 text-[#fafafa]"
      >
        <ul className="flex flex-1 flex-col">
          {items.map((it, i) => {
            const on = isActive(it.href, pathname);
            return (
              <li key={it.href} className="ns-menu__item overflow-hidden border-b border-white/10" style={{ "--i": i } as React.CSSProperties}>
                <Link
                  href={it.href}
                  aria-current={on ? "page" : undefined}
                  className="flex items-center py-4"
                  onClick={() => setOpen(false)}
                >
                  <span className={`text-[2.2rem] font-medium leading-tight tracking-tight ${on ? "text-white" : "text-white/70"}`}>{it.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="ns-menu__foot flex items-center justify-between gap-4 font-mono text-xs uppercase tracking-[0.16em] text-white/70">
          {extra ? <div className="text-white normal-case tracking-normal">{extra}</div> : <span />}
          {email ? (
            <a href={`mailto:${email}`} className="normal-case tracking-normal text-white/55" dir="ltr">
              {email}
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
