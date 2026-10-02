"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Image from "next/image";
import { compactMotion, onTrackFrame, ramp, reducedMotion } from "@/lib/scroll";

export type FlightDevice = {
  code: string;
  name: string;
  /** A framed device (laptop, tablet, phone, browser) at its outer size. */
  node: ReactNode;
  w: number;
  h: number;
  /**
   * A picture of the device exactly as `node` renders it (public/hero). Phones
   * fly the picture instead of the live page: one image per screen is cheap to
   * move, a full mini-site in 3D is not, and that's what made the phone stutter.
   */
  still?: string;
};

/**
 * The cluster, in world space around the vanishing point: x/y as fractions of
 * the viewport, z in px (negative = further away). Near screens sit wide, far
 * ones gather toward the vanishing point, so the first frame is already full.
 */
const SLOTS: { x: number; y: number; z: number; ry: number }[] = [
  { x: 0, y: 0.02, z: -300, ry: -10 },
  { x: 0.26, y: 0.12, z: -60, ry: -16 },
  { x: -0.08, y: -0.3, z: -1000, ry: 14 },
  { x: 0.32, y: -0.3, z: -1500, ry: -20 },
  { x: -0.3, y: 0.3, z: -2000, ry: 16 },
  { x: 0.2, y: 0.3, z: -2700, ry: -12 },
  { x: -0.1, y: -0.34, z: -3400, ry: 6 },
];

const DEPTH = 3500;
/** Phones and tablets fly through the first five screens only. */
const COMPACT_DEVICES = 5;
const PERSPECTIVE = 1200;

/**
 * The hero as a flight. The headline holds one side of the frame; the other is
 * a cluster of devices running the kind of products we build (real markup,
 * not pictures) hanging in depth. Scroll and the camera moves into the cluster
 * and through it, until the page carries on. On phones the cluster sits right
 * under the headline and buttons, and flies with fewer screens.
 *
 * Scroll position is the only input. Screens are promoted once (will-change)
 * and faded before they grow past ~1.4×, so the raster never visibly softens on
 * the integrated-GPU target.
 */
export function HeroFlight({ copy, devices }: { copy: ReactNode; devices: FlightDevice[] }) {
  const track = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const copyEl = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const t = track.current;
    const st = stage.current;
    const w = world.current;
    const c = copyEl.current;
    if (!t || !st || !w || !c) return;

    // Phones and tablets fly through fewer screens: every one is a live layer.
    const compact = compactMotion();
    items.current.forEach((el, i) => {
      if (el && compact && i >= COMPACT_DEVICES) el.hidden = true;
    });
    const live = items.current.filter((el, i) => el && !(compact && i >= COMPACT_DEVICES));
    // The camera travels only as deep as the screens it flies through, so a
    // shorter phone flight doesn't end on an empty stretch of sky.
    const depth = compact ? Math.min(DEPTH, 40 - Math.min(...SLOTS.slice(0, COMPACT_DEVICES).map((s) => s.z))) : DEPTH;

    const paint = (p: number) => {
      const W = st.clientWidth;
      const H = st.clientHeight;
      const rtl = document.documentElement.dir === "rtl";
      const wide = W >= 900;

      // Where the cluster lives: beside the headline on wide screens, below it
      // on narrow ones. It drifts to the centre as the camera commits to it.
      const centre = ramp(p, 0.08, 0.45);
      // Narrow: centred in the space left under the copy, so the screens sit
      // right below the buttons instead of down at the bottom edge.
      const copy = c.firstElementChild as HTMLElement | null;
      const copyBottom = copy ? c.offsetTop + copy.offsetTop + copy.offsetHeight : H * 0.5;
      const room = Math.max(H - copyBottom, H * 0.3);
      const vx0 = wide ? (rtl ? 0.36 : 0.64) : 0.5;
      const vy0 = wide ? 0.52 : (copyBottom + room * 0.4) / H;
      const vx = (vx0 + (0.5 - vx0) * centre) * W;
      const vy = (vy0 + (0.5 - vy0) * centre) * H;
      st.style.perspectiveOrigin = `${vx}px ${vy}px`;
      w.style.transform = `translate3d(${vx}px, ${vy}px, 0)`;

      const lift = ramp(p, 0.02, 0.18);
      c.style.opacity = String(1 - lift);
      c.style.transform = `translateY(${-lift * 60}px)`;

      const cam = ramp(p, 0.03, 0.97) * depth;
      // Phones: smaller, and sized to the room under the copy.
      const scale = wide ? 1 : Math.min(0.58, W / 680, room / 600);
      const spreadY = wide ? 1 : 0.5;
      live.forEach((el, i) => {
        if (!el) return;
        const s = SLOTS[i % SLOTS.length];
        const z = s.z + cam;
        const appear = Math.min(Math.max((z + 5400) / 1600, 0), 1);
        // Phones: gone before the screen grows much, so no big pale ghost of a
        // white page sweeps across (and the picture never has to be blown up).
        const leave = compact ? 1 - Math.min(Math.max((z + 120) / 260, 0), 1) : 1 - Math.min(Math.max((z - 160) / 300, 0), 1);
        const o = appear * leave;
        el.style.opacity = String(o);
        el.style.visibility = o <= 0.001 ? "hidden" : "visible";
        el.style.transform = `translate3d(${(rtl ? -s.x : s.x) * W}px, ${s.y * H * spreadY}px, ${z}px) rotateY(${rtl ? -s.ry : s.ry}deg) scale(${scale})`;
      });

    };

    // Reduced motion: the opening frame, unpinned.
    if (reducedMotion()) {
      t.dataset.still = "";
      const still = () => paint(0);
      still();
      window.addEventListener("resize", still);
      return () => window.removeEventListener("resize", still);
    }

    for (const el of live) if (el) el.style.willChange = "transform";
    return onTrackFrame(t, paint);
  }, [devices]);

  return (
    <section ref={track} data-header="light" className="ns-pin-track tone-light relative h-[340vh] bg-ground text-fg max-[899px]:h-[260vh]">
      <div ref={stage} className="ns-pin-stage sticky top-0 h-screen overflow-hidden" style={{ perspective: `${PERSPECTIVE}px` }}>
        <div className="absolute inset-0 bg-[radial-gradient(90%_80%_at_70%_50%,#ffffff_0%,#f7f7f7_50%,#e4e4e4_100%)] rtl:bg-[radial-gradient(90%_80%_at_30%_50%,#ffffff_0%,#f7f7f7_50%,#e4e4e4_100%)]" />

        {/* decorative: the headline carries the meaning */}
        <div ref={world} aria-hidden="true" inert dir="ltr" className="absolute left-0 top-0 size-0" style={{ transformStyle: "preserve-3d" }}>
          {devices.map((d, i) => (
            <div
              key={i}
              ref={(el) => {
                items.current[i] = el;
              }}
              dir="ltr"
              className="absolute left-0 top-0"
              style={{ width: d.w, height: d.h, marginLeft: -d.w / 2, marginTop: -d.h / 2, opacity: 0, visibility: "hidden" }}
            >
              {d.still ? (
                <>
                  <div className="h-full w-full max-[899px]:hidden">{d.node}</div>
                  <Image src={d.still} alt="" width={d.w} height={d.h} unoptimized priority className="h-full w-full [backface-visibility:hidden] min-[900px]:hidden" />
                </>
              ) : (
                d.node
              )}
            </div>
          ))}
        </div>

        <div ref={copyEl} className="relative z-10 mx-auto flex h-full w-full max-w-[1600px] flex-col justify-start px-6 pt-[max(6rem,12vh)] min-[900px]:min-h-svh min-[900px]:justify-center min-[900px]:px-[max(3rem,6vw)] min-[900px]:pt-0">
          <div className="max-w-[540px]">{copy}</div>
        </div>

      </div>
    </section>
  );
}
