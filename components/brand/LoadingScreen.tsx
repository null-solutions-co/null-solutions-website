"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/** Long enough for the mark to draw itself once, even on a fast connection. */
const MIN_MS = 1500;
/** If something never finishes loading, don't hold the visitor hostage. */
const MAX_MS = 9000;

/**
 * Set once the cover has been shown. The module outlives client navigations,
 * so switching language (which re-renders the root layout and mounts this
 * again) doesn't bring the cover back.
 */
let shown = false;

function pageLoaded(): Promise<void> {
  const load = new Promise<void>((resolve) => {
    if (document.readyState === "complete") resolve();
    else window.addEventListener("load", () => resolve(), { once: true });
  });
  const fonts = document.fonts?.ready.then(() => undefined) ?? Promise.resolve();
  return Promise.all([load, fonts]).then(() => undefined);
}

/**
 * The first thing a visitor sees: the NULL mark drawing itself on black — the
 * ring, then the slash through it, then the name — until every image, font and
 * script on the page has loaded. Then it lifts and the site is there, at the
 * top, ready.
 *
 * Rendered on the server so it covers the page before any JavaScript runs.
 * It shows once per full page load; moving between pages inside the site
 * doesn't bring it back, and neither does switching language. A CSS failsafe (globals.css) hides it even if the
 * script never runs.
 */
export function LoadingScreen() {
  const ref = useRef<HTMLDivElement>(null);
  // Read once per mount: true only when an earlier mount already showed the cover.
  const [again] = useState(() => shown);

  useEffect(() => {
    const el = ref.current;
    if (again || !el || el.dataset.state === "out") return;
    shown = true;
    const html = document.documentElement;
    html.classList.add("ns-loading");
    window.dispatchEvent(new Event("lenis-stop"));

    const started = performance.now();
    let finished = false;
    let hideTimer = 0;
    let revealTimer = 0;

    const finish = () => {
      if (finished) return;
      finished = true;
      revealTimer = window.setTimeout(() => {
        window.scrollTo(0, 0);
        html.classList.remove("ns-loading");
        window.dispatchEvent(new Event("lenis-start"));
        el.dataset.state = "out";
        hideTimer = window.setTimeout(() => {
          el.hidden = true;
        }, 800);
      }, Math.max(0, MIN_MS - (performance.now() - started)));
    };

    pageLoaded().then(finish);
    const failsafe = window.setTimeout(finish, MAX_MS);

    return () => {
      window.clearTimeout(failsafe);
      window.clearTimeout(revealTimer);
      window.clearTimeout(hideTimer);
    };
  }, [again]);

  if (again) return null;

  return (
    <div ref={ref} className="ns-loader" role="status" aria-live="polite" aria-label="Loading NULL Solutions">
      <div className="ns-loader__lockup" dir="ltr">
        <svg viewBox="0 0 100 100" className="ns-loader__mark" aria-hidden="true">
          <circle className="ns-loader__ring" cx="50" cy="50" r="33" pathLength={1} />
          <line className="ns-loader__slash" x1="12" y1="88" x2="88" y2="12" pathLength={1} />
        </svg>
        {/* the logo's own lettering (cropped from the logo artwork), so the
            loader reads exactly like the logo in the header */}
        <span className="ns-loader__word" aria-hidden="true">
          <Image src="/brand/logo.png" alt="" width={707} height={220} priority className="ns-loader__letters" />
        </span>
      </div>
    </div>
  );
}
