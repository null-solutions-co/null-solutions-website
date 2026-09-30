/**
 * Line icons for the About page. Each path is drawn in when its card reveals
 * (`.ns-reveal.in .ab-draw` in globals.css): stroke only, currentColor, with
 * one accent stroke in the brand blue.
 */

const base = {
  viewBox: "0 0 64 64",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function Path({ d, accent, i = 0 }: { d: string; accent?: boolean; i?: number }) {
  return (
    <path
      d={d}
      pathLength={1}
      className="ab-draw"
      style={{ stroke: accent ? "var(--signal-ink)" : undefined, animationDelay: `${0.15 + i * 0.18}s` }}
    />
  );
}

export const PRINCIPLE_ICONS = [
  // 01 · always know where it stands: steps climbing to a marked point
  () => (
    <svg {...base} className="size-14">
      <Path d="M8 52h12V42h12V32h12V22h12" i={0} />
      <Path d="M50 16a6 6 0 1 0 0.01 0" accent i={1} />
      <Path d="M8 58h48" i={2} />
    </svg>
  ),
  // 02 · security from the first line: a shield with a check
  () => (
    <svg {...base} className="size-14">
      <Path d="M32 8l18 7v13c0 13-8 22-18 27-10-5-18-14-18-27V15z" i={0} />
      <Path d="M24 33l6 6 11-12" accent i={1} />
    </svg>
  ),
  // 03 · Arabic and English: two lines of text running opposite ways
  () => (
    <svg {...base} className="size-14">
      <Path d="M10 22h34M36 16l8 6-8 6" i={0} />
      <Path d="M54 42H20M28 36l-8 6 8 6" accent i={1} />
    </svg>
  ),
  // 04 · we stay after launch: a loop that keeps going
  () => (
    <svg {...base} className="size-14">
      <Path d="M50 32a18 18 0 1 1-6-13.4" i={0} />
      <Path d="M46 10v9h-9" accent i={1} />
      <Path d="M26 32l4 4 8-8" i={2} />
    </svg>
  ),
];

export const ROLE_ICONS: Record<string, () => React.ReactNode> = {
  // delivery lead: a compass
  lead: () => (
    <svg {...base} className="size-10">
      <Path d="M32 8a24 24 0 1 0 0.01 0" i={0} />
      <Path d="M40 24l-5 11-11 5 5-11z" accent i={1} />
    </svg>
  ),
  // backend & data: stacked database discs
  backend: () => (
    <svg {...base} className="size-10">
      <Path d="M14 16c0-4 8-6 18-6s18 2 18 6-8 6-18 6-18-2-18-6z" i={0} />
      <Path d="M14 16v32c0 4 8 6 18 6s18-2 18-6V16" i={1} />
      <Path d="M14 32c0 4 8 6 18 6s18-2 18-6" accent i={2} />
    </svg>
  ),
  // frontend: a screen with a layout on it
  frontend: () => (
    <svg {...base} className="size-10">
      <Path d="M8 12h48v32H8zM24 54h16M32 44v10" i={0} />
      <Path d="M16 22h20M16 30h12" accent i={1} />
    </svg>
  ),
  // security: a lock
  security: () => (
    <svg {...base} className="size-10">
      <Path d="M14 28h36v26H14z" i={0} />
      <Path d="M22 28v-8a10 10 0 0 1 20 0v8" i={1} />
      <Path d="M32 38v8" accent i={2} />
    </svg>
  ),
  // AI engineering: a spark
  ai: () => (
    <svg {...base} className="size-10">
      <Path d="M32 8c2 12 6 16 18 18-12 2-16 6-18 18-2-12-6-16-18-18 12-2 16-6 18-18z" i={0} />
      <Path d="M50 44c1 5 3 7 8 8-5 1-7 3-8 8-1-5-3-7-8-8 5-1 7-3 8-8z" accent i={1} />
    </svg>
  ),
};

