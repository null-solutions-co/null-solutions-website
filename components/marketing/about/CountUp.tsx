"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A number that counts up from zero the first time it scrolls into view.
 * Server-renders the final value, so it reads right without JS and under
 * reduced motion.
 */
export function CountUp({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const dur = 1400;
        const step = (now: number) => {
          const t = Math.min((now - start) / dur, 1);
          setShown(Math.round(value * (1 - Math.pow(1 - t, 3))));
          if (t < 1) raf = requestAnimationFrame(step);
        };
        setShown(0);
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);

  return (
    <span ref={ref} className={className} dir="ltr">
      {String(shown).padStart(2, "0")}
    </span>
  );
}
