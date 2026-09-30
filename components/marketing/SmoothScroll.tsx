"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { runScrollFrame, setScrollDriver } from "@/lib/scroll";

/** Send the page to the very top, instantly (no glide), and repaint the scroll-linked sections. */
function toTop(lenis: Lenis | null) {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  window.scrollTo(0, 0);
  runScrollFrame();
}

/** Momentum smooth-scroll for the marketing surface. RAF-based, no WebGL.
 *  Lerp mode: each frame closes a fixed share of the gap to the target, so the
 *  page glides and settles instead of following a fixed-length curve. Skipped
 *  entirely on touch screens and under prefers-reduced-motion.
 *
 *  Every page opens at the top: on first load (the browser's own "restore my
 *  old position" is switched off) and on every move to another page. A link to
 *  an anchor (`/services#s11`) is the one exception — it goes to that anchor.
 *  A link to the page you're already on (the logo, in the header or the
 *  footer, while on Home) also sends you back to its top. */
export function SmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (!window.location.hash) toTop(null);

    // Touch screens keep their own native scroll: no extra loop running every frame.
    if (window.matchMedia("(prefers-reduced-motion: reduce), (hover: none) and (pointer: coarse)").matches) return;

    // Lenis at its own defaults (lerp 0.1, wheel 1:1), the same feel as
    // arkantechjo.com, which the user picked as the reference.
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1,
    });
    lenisRef.current = lenis;

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // scroll-linked sections paint inside this same frame (lib/scroll.ts)
    setScrollDriver(true);
    lenis.on("scroll", runScrollFrame);

    // modal overlays (the live demo window, the loading screen) pause the page scroll
    const stop = () => lenis.stop();
    const start = () => lenis.start();
    window.addEventListener("lenis-stop", stop);
    window.addEventListener("lenis-start", start);

    return () => {
      cancelAnimationFrame(raf);
      setScrollDriver(false);
      window.removeEventListener("lenis-stop", stop);
      window.removeEventListener("lenis-start", start);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // A link to this same page (the logo while on Home): back to its top.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank") return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.hash) return;
      const here = window.location.pathname.replace(/\/$/, "") || "/";
      const there = url.pathname.replace(/\/$/, "") || "/";
      if (here === there) toTop(lenisRef.current);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // A different page: start it from the top.
  useEffect(() => {
    if (window.location.hash) return;
    toTop(lenisRef.current);
  }, [pathname]);

  return null;
}
