"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Clip-up reveal on scroll-in. 1.2s failsafe + first-scroll fallback so
 *  content can never stay hidden; prefers-reduced-motion shows it immediately. */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !el) {
      const id = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(id);
    }
    const reveal = () => {
      setShown(true);
      io.disconnect();
      clearTimeout(fs);
      window.removeEventListener("scroll", reveal);
    };
    const fs = window.setTimeout(reveal, 1200);
    window.addEventListener("scroll", reveal, { passive: true, once: true });
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && reveal(),
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(fs);
      window.removeEventListener("scroll", reveal);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn("ns-reveal", shown && "in", className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
