"use client";

import { useEffect, useRef } from "react";

/** How quickly the dot catches up with the pointer (higher = tighter). */
const FOLLOW = 9;
const INTERACTIVE = "a, button, [role='button'], [role='tab'], summary, label[for], select";
const TEXT_INPUT = "input:not([type='checkbox']):not([type='radio']):not([type='submit']), textarea, [contenteditable='true']";

/**
 * A soft dot that trails the mouse, after arkantechjo.com (the user's
 * reference): it eases after the pointer instead of sticking to it, swells over
 * anything clickable, and inverts whatever is under it, so it reads on black and
 * on white alike. The native cursor stays; this rides alongside it.
 *
 * Mouse and trackpad only (pointer: fine); nothing on touch screens or under
 * reduced motion. The loop sleeps once the dot has caught up.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = dot.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let x = -100;
    let y = -100;
    let tx = x;
    let ty = y;
    let raf = 0;
    let last = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const k = 1 - Math.exp(-FOLLOW * dt);
      x += (tx - x) * k;
      y += (ty - y) * k;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.1 ? requestAnimationFrame(tick) : 0;
    };
    const wake = () => {
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      tx = e.clientX;
      ty = e.clientY;
      if (el.dataset.hidden !== undefined) {
        // first move after entering: start at the pointer, don't fly in from a corner
        x = tx;
        y = ty;
        delete el.dataset.hidden;
      }
      const target = e.target instanceof Element ? e.target : null;
      el.dataset.state = target?.closest(TEXT_INPUT) ? "text" : target?.closest(INTERACTIVE) ? "link" : "";
      wake();
    };
    const onLeave = () => {
      el.dataset.hidden = "";
    };
    const onDown = () => {
      el.dataset.down = "";
    };
    const onUp = () => {
      delete el.dataset.down;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <div ref={dot} aria-hidden="true" data-hidden="" className="ns-cursor">
      <span className="ns-cursor__dot" />
    </div>
  );
}
