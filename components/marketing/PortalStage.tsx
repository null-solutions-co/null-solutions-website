"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { compactMotion, onTrackFrame, ramp, reducedMotion } from "@/lib/scroll";

const DESIGN_W = 1280;
const DESIGN_H = 800;
/** Room left for the fixed site header when the portal lands full-bleed. */
const HEADER_CLEAR = 72;

/**
 * The client-portal section as one camera move. You open on a laptop in a daylight studio; the
 * scroll dollies the camera down, straightens the lid, and pushes into the
 * screen until the client portal on it *is* the page. Nothing here listens to
 * the pointer — the scroll position is the only input.
 *
 * The push is exponential (fill ** t) so the zoom feels even rather than
 * lurching at the end, and the fill scale is solved from the screen's own
 * size so the handoff to the full-bleed portal lands pixel-on-pixel.
 */
export function PortalStage({
  copy,
  screen,
  caption,
}: {
  copy: ReactNode;
  screen: ReactNode;
  caption: string;
}) {
  const track = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const copyEl = useRef<HTMLDivElement>(null);
  const laptop = useRef<HTMLDivElement>(null);
  const lid = useRef<HTMLDivElement>(null);
  const glass = useRef<HTMLDivElement>(null);
  const full = useRef<HTMLDivElement>(null);
  const captionEl = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const t = track.current;
    const st = stage.current;
    const c = copyEl.current;
    const l = laptop.current;
    const ld = lid.current;
    const g = glass.current;
    const f = full.current;
    if (!t || !st || !c || !l || !ld || !g || !f) return;

    // Phones and tablets: the push ends when the screen fills the width, not
    // the height. On a tall phone, filling the height meant a 3.5× blow-up of
    // the whole laptop, and a desktop portal cropped to its middle.
    const compact = compactMotion();

    const paint = (p: number) => {
      const W = st.clientWidth;
      const H = st.clientHeight;

      // Resting position: lid top sits just under the headline block.
      const copyBottom = c.offsetTop + c.offsetHeight;
      const rest = Math.max(copyBottom + 36 + ld.offsetHeight / 2 - H / 2, 0);

      const fill = compact && W < H
        ? W / g.offsetWidth
        : Math.max(W / g.offsetWidth, (H - HEADER_CLEAR) / g.offsetHeight) * 1.002;
      const push = ramp(p, 0.06, 0.72);
      const settle = ramp(p, 0.02, 0.5);

      const drop = ramp(p, 0.02, 0.56);
      const ty = rest * (1 - drop) + (HEADER_CLEAR / 2) * drop;
      const tilt = 17 * (1 - settle);
      const scale = Math.pow(fill, push);

      l.style.transform = `translate(-50%, -50%) translateY(${ty}px) rotateX(${tilt}deg) scale(${scale})`;

      const lift = ramp(p, 0, 0.22);
      c.style.opacity = String(1 - lift);
      c.style.transform = `translateY(${-lift * 90}px)`;

      const cross = ramp(p, 0.66, 0.8);
      l.style.opacity = String(1 - cross);
      f.style.opacity = String(cross);
      const fullScale = compact && W < H ? W / DESIGN_W : Math.max(W / DESIGN_W, (H - HEADER_CLEAR) / DESIGN_H);
      f.style.transform = `translate(-50%, -50%) translateY(${HEADER_CLEAR / 2}px) scale(${fullScale})`;
      // Painted only once it starts to fade in; the laptop only until it has faded out.
      f.style.visibility = cross <= 0 ? "hidden" : "visible";
      l.style.visibility = cross >= 1 ? "hidden" : "visible";

      if (captionEl.current) captionEl.current.style.opacity = String(ramp(p, 0.8, 0.9));
    };

    // Reduced motion: the opening frame, unpinned — no camera move at all.
    if (reducedMotion()) {
      t.dataset.still = "";
      f.hidden = true;
      const still = () => paint(0);
      still();
      window.addEventListener("resize", still);
      return () => window.removeEventListener("resize", still);
    }

    return onTrackFrame(t, paint);
  }, []);

  return (
    <section
      ref={track}
      data-header="light"
      className="ns-pin-track tone-light relative h-[300vh] bg-ground text-fg"
    >
      <div
        ref={stage}
        className="ns-pin-stage sticky top-0 h-screen overflow-hidden"
        style={{ perspective: "1700px", perspectiveOrigin: "50% 35%" }}
      >
        {/* daylight studio: a soft key light from above, a floor that falls away */}
        <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_0%,#ffffff_0%,#f6f6f6_55%,#e6e6e6_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[38%] bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.05))]" />

        <div ref={copyEl} className="relative z-10 mx-auto max-w-5xl px-6 pt-[16vh] text-center md:pt-[17vh]">
          {copy}
        </div>

        <div
          ref={laptop}
          className="absolute left-1/2 top-1/2 w-[min(90vw,118vh)] md:w-[min(62vw,112vh)]"
          style={{ transform: "translate(-50%, -50%)", transformOrigin: "50% 50%" }}
        >
          <div
            ref={lid}
            className="relative rounded-[clamp(12px,1.8vw,24px)] bg-[#141417] p-[1.5%] shadow-[0_50px_90px_-30px_rgba(0,0,0,0.55),0_0_0_1px_rgba(0,0,0,0.5)]"
          >
            <span className="absolute left-1/2 top-[0.55%] size-[0.5%] min-h-1 min-w-1 -translate-x-1/2 rounded-full bg-[#2c2c31]" />
            <div
              ref={glass}
              className="relative aspect-[16/10] overflow-hidden rounded-[4px] bg-[#f5f7f5]"
              style={{ containerType: "inline-size" }}
            >
              <div
                aria-hidden="true"
                className="absolute left-0 top-0"
                style={{
                  width: DESIGN_W,
                  height: DESIGN_H,
                  transformOrigin: "top left",
                  transform: `scale(calc(100cqw / ${DESIGN_W}px))`,
                }}
              >
                {screen}
              </div>
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(118deg,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0)_34%)]" />
            </div>
          </div>
          {/* the deck, seen edge-on */}
          <div className="absolute left-[-7%] top-full h-[3.4%] w-[114%] rounded-b-[40%] bg-[linear-gradient(180deg,#d9d9dd_0%,#b4b4ba_55%,#8d8d93_100%)] shadow-[0_22px_30px_-10px_rgba(0,0,0,0.45)]">
            <span className="absolute left-1/2 top-0 h-1/2 w-[15%] -translate-x-1/2 rounded-b-md bg-[#9d9da3]" />
          </div>
        </div>

        {/* After the push: the portal, full-bleed. Decorative — the caption says it in words. */}
        <div
          ref={full}
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2"
          style={{ width: DESIGN_W, height: DESIGN_H, opacity: 0, transform: "translate(-50%, -50%)" }}
        >
          {screen}
        </div>

        <p
          ref={captionEl}
          className="absolute bottom-8 start-6 z-10 max-w-[44ch] rounded-lg bg-[#0d1b2a] px-5 py-4 text-sm leading-relaxed text-[#fafafa] shadow-lg md:start-10"
          style={{ opacity: 0 }}
        >
          {caption}
        </p>

      </div>
    </section>
  );
}
