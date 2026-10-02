"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { DEMO_LOADERS, type AnyDemo } from "./demos/registry";
import { DESIGN_W, DESIGN_H } from "./demos/kit";

/** Smallest scale we'll shrink a demo to; below this the stage pans instead. */
const MIN_SCALE = 0.55;

function Live({ mod }: { mod: AnyDemo }) {
  const [s, dispatch] = useReducer(mod.reduce, mod.initial);
  const tick = mod.tick;
  const running = !!tick && (!tick.active || tick.active(s));

  useEffect(() => {
    if (!tick || !running) return;
    const id = window.setInterval(() => dispatch(tick.action), tick.ms);
    return () => window.clearInterval(id);
  }, [tick, running]);

  const View = mod.View;
  return <View s={s} act={dispatch} />;
}

export type DemoLabels = {
  live: string;
  close: string;
  ctaLine: string;
  cta: string;
  loading: string;
};

/**
 * Full-screen, working version of a work-card demo. Native <dialog> gives us
 * the top layer, focus containment, Esc-to-close and an inert page behind it;
 * the page's smooth scroll is paused while it's open.
 */
export function DemoDialog({
  code,
  name,
  labels,
  onClose,
}: {
  code: string;
  name: string;
  labels: DemoLabels;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [mod, setMod] = useState<AnyDemo | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    d.showModal();
    window.dispatchEvent(new Event("lenis-stop"));
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
      window.dispatchEvent(new Event("lenis-start"));
    };
  }, []);

  useEffect(() => {
    let live = true;
    DEMO_LOADERS[code]?.().then((m) => {
      if (live) setMod(() => m);
    });
    return () => {
      live = false;
    };
  }, [code]);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const fit = () => setScale(Math.min(el.clientWidth / DESIGN_W, el.clientHeight / DESIGN_H) * 0.97);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const s = Math.max(scale, MIN_SCALE);
  const pans = scale < MIN_SCALE;

  return (
    <dialog
      ref={dialog}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-label={`${code} · ${name}`}
      className="ns-dialog-in fixed inset-0 m-0 flex h-dvh max-h-none w-screen max-w-none flex-col bg-[#08080a] p-0 text-[#fafafa] backdrop:bg-black/70"
    >
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-white/10 px-4 md:px-6">
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-white/50">{code}</span>
        <span className="truncate font-medium">{name}</span>
        <span className="hidden rounded-full border border-white/15 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-white/55 sm:inline">
          {labels.live}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="ms-auto flex size-9 items-center justify-center rounded-full border border-white/20 transition hover:bg-white hover:text-black"
          aria-label={labels.close}
          autoFocus
        >
          <X className="size-4" />
        </button>
      </header>

      <div ref={stage} dir="ltr" className={`relative min-h-0 flex-1 ${pans ? "overflow-auto" : "overflow-hidden"}`}>
        <div
          dir="ltr"
          className={pans ? "relative" : "absolute left-1/2 top-1/2"}
          style={{
            width: DESIGN_W * s,
            height: DESIGN_H * s,
            transform: pans ? undefined : "translate(-50%, -50%)",
          }}
        >
          <div
            className="overflow-hidden rounded-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/10"
            style={{ width: DESIGN_W, height: DESIGN_H, transform: `scale(${s})`, transformOrigin: "top left" }}
          >
            {mod ? (
              <Live key={code} mod={mod} />
            ) : (
              <div className="flex h-full items-center justify-center gap-3 bg-[#111] text-white/50">
                <Loader2 className="size-5 animate-spin" /> {labels.loading}
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="flex h-14 shrink-0 items-center justify-center gap-4 border-t border-white/10 px-4 text-sm">
        <span className="hidden text-white/60 sm:inline">{labels.ctaLine}</span>
        <Link
          href="/contact"
          onClick={onClose}
          className="rounded-full bg-white px-5 py-2 font-mono text-xs uppercase tracking-[0.14em] text-black transition hover:bg-[#2a2a2a] hover:text-white"
        >
          {labels.cta}
        </Link>
      </footer>
    </dialog>
  );
}
