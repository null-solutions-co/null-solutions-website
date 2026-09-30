import type { ReactElement } from "react";

/**
 * A demo is a small app split in two:
 *   - `View` renders from state and never holds any itself, so the work cards
 *     can server-render it as a still (no JS shipped for thumbnails);
 *   - `initial` + `reduce` (+ an optional `tick`) are what the live window
 *     drives when a visitor opens it.
 * `act` is undefined in a still, which is what makes it inert.
 */
export type ViewProps<S, A> = { s: S; act?: (a: A) => void };

export type DemoModule<S, A> = {
  initial: S;
  reduce: (s: S, a: A) => S;
  View: (props: ViewProps<S, A>) => ReactElement;
  /** Periodic action for live demos (feeds, timers). Runs only while `active`. */
  tick?: { ms: number; action: A; active?: (s: S) => boolean };
};

export function defineDemo<S, A>(demo: DemoModule<S, A>): DemoModule<S, A> {
  return demo;
}

/** Click handler helper: a no-op in stills. */
export function on<A>(act: ((a: A) => void) | undefined, a: A) {
  return act ? () => act(a) : undefined;
}

export const DESIGN_W = 1280;
export const DESIGN_H = 800;
