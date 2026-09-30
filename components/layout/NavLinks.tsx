"use client";

import { useEffect, useRef, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Item = { href: string; label: string };

export function isActive(href: string, pathname: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * The header's section links with a marker under the page you're on: a soft
 * pill with an accent line that slides to the new section when you navigate
 * (and draws itself in on first load). Positions are measured, so it fits
 * each label in both languages.
 */
export function NavLinks({ items }: { items: Item[] }) {
  const pathname = usePathname();
  const active = items.findIndex((it) => isActive(it.href, pathname));
  const links = useRef<(HTMLAnchorElement | null)[]>([]);
  const marker = useRef<HTMLSpanElement>(null);
  const [placed, setPlaced] = useState(false);

  useEffect(() => {
    const m = marker.current;
    if (!m) return;
    const place = () => {
      const el = links.current[active];
      if (!el) {
        m.style.opacity = "0";
        return;
      }
      m.style.opacity = "1";
      m.style.width = `${el.offsetWidth}px`;
      m.style.transform = `translateX(${el.offsetLeft}px)`;
    };
    place();
    // Fonts can change label widths after first paint.
    document.fonts?.ready.then(place).catch(() => {});
    window.addEventListener("resize", place);
    const id = requestAnimationFrame(() => setPlaced(true));
    return () => {
      window.removeEventListener("resize", place);
      cancelAnimationFrame(id);
    };
  }, [active]);

  return (
    <div className="relative flex items-center gap-x-1">
      <span
        ref={marker}
        aria-hidden="true"
        data-placed={placed ? "" : undefined}
        className="ns-nav-marker pointer-events-none absolute -bottom-1 -top-1 left-0 rounded-full bg-current/[0.09] opacity-0"
      >
        <span key={active} className="ns-nav-line absolute inset-x-3 bottom-[5px] h-[2px] rounded-full bg-current" />
      </span>
      {items.map((l, i) => (
        <Link
          key={l.href}
          href={l.href}
          ref={(el) => {
            links.current[i] = el;
          }}
          aria-current={i === active ? "page" : undefined}
          className={cn(
            "relative rounded-full px-3 py-1.5 font-mono text-[0.72rem] uppercase tracking-[0.16em] transition-opacity duration-300 focus-visible:outline-offset-2",
            i === active ? "opacity-100" : "opacity-65 hover:opacity-100",
          )}
        >
          {l.label}
        </Link>
      ))}
    </div>
  );
}
