import type { ReactNode } from "react";

/**
 * Device frames for the hero cluster. Each takes an outer width in px and a
 * design size for the screen content (authored at its native resolution), and
 * returns the framed device plus its outer height so the cluster can place it.
 */

export type Framed = { node: ReactNode; w: number; h: number };

function Screen({ w, h, design, children }: { w: number; h: number; design: [number, number]; children: ReactNode }) {
  const s = w / design[0];
  return (
    <div className="relative overflow-hidden bg-black" style={{ width: w, height: h }}>
      <div className="absolute left-0 top-0 origin-top-left" style={{ width: design[0], height: design[1], transform: `scale(${s})` }}>
        {children}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0)_32%)]" />
    </div>
  );
}

/** A 16:10 laptop: aluminium-dark lid, thin bezel, silver deck seen edge-on. */
export function Laptop({ w, children }: { w: number; children: ReactNode }): Framed {
  const pad = Math.round(w * 0.02);
  const sw = w - pad * 2;
  const sh = Math.round((sw * 900) / 1440);
  const lidH = sh + pad * 2;
  const deckH = Math.round(w * 0.028);
  return {
    w,
    h: lidH + deckH,
    node: (
      <div className="relative" style={{ width: w, height: lidH + deckH }}>
        <div className="relative rounded-[16px] bg-[#1b1b1f] shadow-[0_0_0_1px_rgba(0,0,0,0.6),0_60px_100px_-40px_rgba(0,0,0,0.55)]" style={{ padding: pad, height: lidH }}>
          <span className="absolute left-1/2 top-[3px] size-1 -translate-x-1/2 rounded-full bg-[#34343a]" />
          <div className="overflow-hidden rounded-[4px]">
            <Screen w={sw} h={sh} design={[1440, 900]}>
              {children}
            </Screen>
          </div>
        </div>
        <div
          className="absolute left-[-7%] w-[114%] rounded-b-[40%] bg-[linear-gradient(180deg,#e2e2e6_0%,#b8b8be_55%,#8e8e94_100%)]"
          style={{ top: lidH, height: deckH }}
        >
          <span className="absolute left-1/2 top-0 h-1/2 w-[16%] -translate-x-1/2 rounded-b-md bg-[#a3a3a9]" />
        </div>
      </div>
    ),
  };
}

/** A tablet in landscape or portrait, black bezel, soft metal edge. */
export function Tablet({ w, portrait = false, children }: { w: number; portrait?: boolean; children: ReactNode }): Framed {
  const bezel = Math.round(w * (portrait ? 0.05 : 0.032));
  const design: [number, number] = portrait ? [820, 1180] : [1180, 820];
  const sw = w - bezel * 2;
  const sh = Math.round((sw * design[1]) / design[0]);
  const h = sh + bezel * 2;
  return {
    w,
    h,
    node: (
      <div className="rounded-[30px] bg-[linear-gradient(145deg,#3b3b40,#161618)] p-[2px] shadow-[0_50px_90px_-30px_rgba(0,0,0,0.5)]" style={{ width: w, height: h }}>
        <div className="h-full rounded-[28px] bg-[#0b0b0c]" style={{ padding: bezel - 2 }}>
          <div className="overflow-hidden rounded-[14px]">
            <Screen w={sw} h={sh} design={design}>
              {children}
            </Screen>
          </div>
        </div>
      </div>
    ),
  };
}

/** A modern phone: thin bezel, rounded corners, dynamic-island cut-out. */
export function Phone({ w, children }: { w: number; children: ReactNode }): Framed {
  const bezel = Math.round(w * 0.04);
  const sw = w - bezel * 2;
  const sh = Math.round((sw * 844) / 390);
  const h = sh + bezel * 2;
  return {
    w,
    h,
    node: (
      <div className="rounded-[40px] bg-[linear-gradient(145deg,#45454b,#18181b)] p-[2px] shadow-[0_40px_70px_-25px_rgba(0,0,0,0.55)]" style={{ width: w, height: h }}>
        <div className="h-full rounded-[38px] bg-black" style={{ padding: bezel - 2 }}>
          <div className="relative overflow-hidden rounded-[30px]">
            <Screen w={sw} h={sh} design={[390, 844]}>
              {children}
            </Screen>
            <span className="absolute left-1/2 top-[7px] h-[16px] w-[64px] -translate-x-1/2 rounded-full bg-black" />
          </div>
        </div>
      </div>
    ),
  };
}

/** A desktop browser window with real chrome: traffic lights, tabs, address bar. */
export function Browser({ w, url, tab, children }: { w: number; url: string; tab: string; children: ReactNode }): Framed {
  const chrome = 40;
  const sh = Math.round((w * 800) / 1280);
  return {
    w,
    h: sh + chrome,
    node: (
      <div className="overflow-hidden rounded-[12px] bg-[#1f1f23] shadow-[0_0_0_1px_rgba(0,0,0,0.5),0_50px_90px_-30px_rgba(0,0,0,0.5)]" style={{ width: w }}>
        <div className="flex items-center gap-3 px-3" style={{ height: chrome }}>
          <span className="flex gap-1.5">
            <span className="size-[9px] rounded-full bg-[#ff5f57]" />
            <span className="size-[9px] rounded-full bg-[#febc2e]" />
            <span className="size-[9px] rounded-full bg-[#28c840]" />
          </span>
          <span className="max-w-[28%] truncate rounded-md bg-[#2c2c31] px-2.5 py-1 text-[9px] text-white/70">{tab}</span>
          <span className="flex-1 truncate rounded-md bg-[#2c2c31] px-3 py-1 text-center text-[9px] text-white/55">{url}</span>
        </div>
        <Screen w={w} h={sh} design={[1280, 800]}>
          {children}
        </Screen>
      </div>
    ),
  };
}
