/**
 * One scroll loop for the whole page.
 *
 * Every scroll-driven section used to bind its own listener + rAF, so a page
 * with five of them ran five layout passes per frame. Subscribers here share a
 * single tick — which is what keeps the marketing surface smooth on the
 * integrated-GPU target machine.
 *
 * With smooth scroll on, Lenis drives the tick: it calls `runScrollFrame()`
 * from inside its own animation frame, right after it moves the page, so every
 * scroll-linked animation paints in the same frame as the scroll itself. A
 * separate rAF would land one frame late and read as judder.
 */

type Frame = () => void;

const subscribers = new Set<Frame>();
let frame = 0;
let bound = false;
let driven = false;

function flush() {
  frame = 0;
  for (const run of subscribers) run();
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(flush);
}

function onNativeScroll() {
  if (!driven) schedule();
}

/** Runs every subscriber now. Called by the smooth-scroll loop in its frame. */
export function runScrollFrame() {
  if (frame) {
    cancelAnimationFrame(frame);
    frame = 0;
  }
  flush();
}

/** While true, native scroll events are ignored: the smooth-scroll loop owns the tick. */
export function setScrollDriver(on: boolean) {
  driven = on;
}

/** Runs `onFrame` at most once per animation frame while the page scrolls. */
export function onScrollFrame(onFrame: Frame): () => void {
  subscribers.add(onFrame);

  if (!bound) {
    bound = true;
    window.addEventListener("scroll", onNativeScroll, { passive: true });
    window.addEventListener("resize", schedule);
  }

  schedule();

  return () => {
    subscribers.delete(onFrame);
  };
}

/** The visitor asked for less motion: every camera move shows its opening frame. */
export function reducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Phones and tablets run the same camera moves, lighter: smaller zooms, fewer
 * layers alive at once. A phone GPU can't hold a 1280px layer blown up 3×
 * (iOS Safari drops frames, then kills the tab), so each section caps its
 * scale and releases layers it has finished with.
 */
export function compactMotion(): boolean {
  return window.matchMedia("(max-width: 899px), (hover: none) and (pointer: coarse)").matches;
}

export const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/** Eased 0→1 ramp between two thresholds — smooth handoffs, no hard cuts. */
export function ramp(value: number, from: number, to: number): number {
  const t = clamp01((value - from) / (to - from || 1));
  return t * t * (3 - 2 * t);
}

/** How far a pinned section has travelled through its own scroll track, 0→1. */
export function trackProgress(el: HTMLElement): number {
  const r = el.getBoundingClientRect();
  const travel = r.height - window.innerHeight;
  return travel > 0 ? clamp01(-r.top / travel) : 0;
}

/**
 * `onScrollFrame` for a pinned track: hands `paint` the track's progress, and
 * skips the frame when neither it nor the viewport changed. Off-screen tracks
 * sit clamped at 0 or 1, so they cost one rect read a frame and nothing else.
 */
export function onTrackFrame(el: HTMLElement, paint: (p: number) => void): () => void {
  let last = "";
  return onScrollFrame(() => {
    const p = trackProgress(el);
    const key = `${p}|${window.innerWidth}|${window.innerHeight}`;
    if (key === last) return;
    last = key;
    paint(p);
  });
}
