import type { ReactNode } from "react";

/**
 * Wide shots a work card opens on before the scroll carries you inside.
 *
 * Everything here is authored in the same 1280×800 design space as the demos,
 * so one scale factor fits the whole card. `--e` (0→1, set by WorkGrid on
 * scroll) straightens the camera angle as it pushes in.
 *
 * Each scene exports its `focal` point — where the zoom converges — as a
 * transform-origin in design-space percentages.
 */

const FLATTEN = "calc(1 - var(--e, 0))";

function Studio({ tone = "dark" }: { tone?: "dark" | "warm" }) {
  return tone === "warm" ? (
    <>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#ece7de_0%,#ddd6ca_62%,#cfc7b9_100%)]" />
      <div className="absolute left-1/2 top-[30%] h-[640px] w-[1100px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.75),transparent_72%)]" />
    </>
  ) : (
    <>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#1b1b1e_0%,#111113_60%,#0a0a0b_100%)]" />
      <div className="absolute left-1/2 top-[28%] h-[620px] w-[1100px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.10),transparent_72%)]" />
      <div className="absolute inset-x-0 top-[78%] h-px bg-white/[0.07]" />
    </>
  );
}

/* ---------- browser on a desk ---------- */

/**
 * Camera moves, in design-space px. `focal` is the point the camera pushes into,
 * `land` is where that point ends up in the card, `zoom` is the push. They are
 * solved so the scene's screen content lands exactly on the full-card demo —
 * that's what makes the crossfade seamless instead of a double exposure.
 */
export type Camera = { focal: [number, number]; land: [number, number]; zoom: number };

/** Screen content: 880×550 at 0.6875, top-left (200, 162) → centre (640, 437). */
export const BROWSER_CAMERA: Camera = { focal: [640, 437], land: [640, 400], zoom: 1 / 0.6875 };

export function BrowserScene({ url, children }: { url: string; children: ReactNode }) {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ perspective: "1800px" }}>
      <Studio />
      <div
        className="absolute left-[200px] top-[118px] w-[880px]"
        style={{
          transform: `rotateY(calc(-16deg * ${FLATTEN})) rotateX(calc(7deg * ${FLATTEN}))`,
          transformOrigin: "50% 50%",
        }}
      >
        <div className="overflow-hidden rounded-[14px] border border-white/15 bg-[#0e0e10] shadow-[0_60px_120px_-30px_rgba(0,0,0,0.9)]">
          <div className="flex items-center gap-3 border-b border-white/[0.08] bg-[#19191c] px-4 py-2.5">
            <span className="flex gap-1.5">
              <span className="size-3 rounded-full bg-[#ff5f57]/80" />
              <span className="size-3 rounded-full bg-[#febc2e]/80" />
              <span className="size-3 rounded-full bg-[#28c840]/80" />
            </span>
            <span className="mx-auto rounded-md bg-white/[0.07] px-5 py-1 font-mono text-[13px] text-white/50">
              {url}
            </span>
          </div>
          <div className="relative h-[550px] overflow-hidden">
            <div className="absolute left-0 top-0 h-[800px] w-[1280px] origin-top-left scale-[0.6875]">
              {children}
            </div>
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,0.10),transparent_38%)]" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- phone in hand-height ---------- */

/** Screen content: 416px wide at 0.683, top-left (498, 70); lands on the 416px column at (432, 0). */
export const PHONE_CAMERA: Camera = { focal: [640, 400], land: [640, 483], zoom: 1 / 0.683 };

export function PhoneScene({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ perspective: "1600px" }}>
      <Studio />
      <div className="absolute left-1/2 top-[616px] h-[88px] w-[420px] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(0,0,0,0.6),transparent)]" />
      <div
        className="absolute left-[488px] top-[60px] h-[680px] w-[304px]"
        style={{
          transform: `rotateZ(calc(-7deg * ${FLATTEN})) rotateY(calc(18deg * ${FLATTEN}))`,
          transformOrigin: "50% 50%",
        }}
      >
        <div className="h-full rounded-[46px] bg-[linear-gradient(145deg,#3a3a3f,#18181b)] p-[10px] shadow-[0_50px_100px_-30px_rgba(0,0,0,0.9)]">
          <div className="relative h-full overflow-hidden rounded-[37px] bg-black">
            <div className="absolute left-1/2 top-3 z-10 h-7 w-24 -translate-x-1/2 rounded-full bg-black" />
            {/* 416×966 × 0.683 = the 284×660 screen, edge to edge */}
            <div className="absolute left-0 top-0 h-[966px] w-[416px] origin-top-left scale-[0.683]">
              {children}
            </div>
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.13),transparent_40%)]" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- glasses: zoom through the lens into the store ---------- */

/** Left-lens centre (390, 400); the store behind it is at 0.3, centred on the lens. */
export const GLASSES_CAMERA: Camera = { focal: [390, 400], land: [640, 400], zoom: 1 / 0.3 };

export function GlassesScene({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ perspective: "1600px" }}>
      <Studio tone="warm" />
      <div className="absolute left-1/2 top-[584px] h-[98px] w-[980px] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(0,0,0,0.25),transparent)]" />

      <div
        className="absolute left-[190px] top-[272px] h-[256px] w-[900px]"
        style={{
          transform: `rotateY(calc(-10deg * ${FLATTEN})) rotateX(calc(8deg * ${FLATTEN}))`,
          transformOrigin: "22% 50%",
        }}
      >
        {/* temples */}
        <span className="absolute -left-[40px] top-[40px] h-[14px] w-[70px] -rotate-[14deg] rounded-full bg-[#17171b]" />
        <span className="absolute -right-[40px] top-[40px] h-[14px] w-[70px] rotate-[14deg] rounded-full bg-[#17171b]" />

        {/* left lens — the store lives behind this glass */}
        <div className="absolute left-0 top-0 h-[256px] w-[400px] overflow-hidden rounded-[128px] border-[16px] border-[#17171b] bg-[#f6f4ef] shadow-[inset_0_0_0_2px_rgba(255,255,255,0.06),0_24px_40px_-18px_rgba(0,0,0,0.5)]">
          <div className="absolute left-1/2 top-1/2 h-[800px] w-[1280px] -translate-x-1/2 -translate-y-1/2 scale-[0.3]">
            {children}
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(130deg,rgba(255,255,255,0.55),rgba(255,255,255,0)_36%,rgba(255,255,255,0)_70%,rgba(255,255,255,0.18))]" />
        </div>

        {/* bridge */}
        <span className="absolute left-[384px] top-[62px] h-[26px] w-[132px] rounded-t-[60px] border-[14px] border-b-0 border-[#17171b]" />

        {/* right lens — plain tinted glass */}
        <div className="absolute right-0 top-0 h-[256px] w-[400px] overflow-hidden rounded-[128px] border-[16px] border-[#17171b] bg-[linear-gradient(160deg,rgba(185,198,221,0.55),rgba(214,207,194,0.25))] shadow-[0_24px_40px_-18px_rgba(0,0,0,0.5)]">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(130deg,rgba(255,255,255,0.6),rgba(255,255,255,0)_40%)]" />
        </div>
      </div>
    </div>
  );
}
