import Image from "next/image";
import type { PortfolioEntry } from "@/lib/portfolio";
import { cn } from "@/lib/utils";

/**
 * The picture on a portfolio card, by what we built:
 * - a website with a screenshot → the real site in a browser window;
 * - a website with a logo → the logo on a colour it sits well on;
 * - an app or software with nothing to show yet → the name set large beside
 *   a plain device outline, with a line icon for what the app is about. The
 *   outline is deliberately generic: it says "a café app", not "this is their
 *   screen".
 */

function CoverIcon({ icon }: { icon: "coffee" | "car" }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-[46%]">
      {icon === "coffee" ? (
        <>
          <path d="M9 19h24v10a10 10 0 0 1-10 10h-4A10 10 0 0 1 9 29z" />
          <path d="M33 22h3a5 5 0 0 1 0 10h-3" />
          <path d="M16 8c-1.5 2 1.5 3.5 0 5.5M22 8c-1.5 2 1.5 3.5 0 5.5M28 8c-1.5 2 1.5 3.5 0 5.5" />
        </>
      ) : (
        <>
          <path d="M7 30v-6l4-9a3 3 0 0 1 2.8-2h20.4a3 3 0 0 1 2.8 2l4 9v6a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z" />
          <path d="M7 24h34M13 32v3M35 32v3" />
          <circle cx="14" cy="28" r="1.5" />
          <circle cx="34" cy="28" r="1.5" />
        </>
      )}
    </svg>
  );
}
export function WorkCover({ e, name, index }: { e: PortfolioEntry; name: string; index: number }) {
  const light = e.cover.ink === "light";
  const ink = light ? "text-white" : "text-[#111]";
  const line = light ? "bg-white/15" : "bg-black/10";
  const frame = light ? "border-white/25" : "border-black/20";

  return (
    <div data-parallax className="relative aspect-[5/4] overflow-hidden rounded-[28px]" style={{ background: e.cover.bg }}>
      {e.shot ? (
        <div className="absolute inset-x-[7%] top-[13%] overflow-hidden rounded-t-xl bg-white shadow-[0_40px_70px_-30px_rgba(0,0,0,0.45)]">
          <div className="flex h-7 items-center gap-1.5 border-b border-black/5 bg-[#f4f2ee] px-3" dir="ltr">
            <span className="size-2 rounded-full bg-[#ff6159]" />
            <span className="size-2 rounded-full bg-[#ffbd2e]" />
            <span className="size-2 rounded-full bg-[#28c941]" />
            {e.url ? (
              <span className="mx-auto truncate rounded bg-white px-3 py-0.5 font-mono text-[10px] text-black/50">
                {e.url.replace(/^https?:\/\//, "")}
              </span>
            ) : null}
          </div>
          <Image src={e.shot} alt={name} width={1440} height={900} className="pf-shot h-auto w-full" sizes="(min-width: 768px) 55vw, 100vw" />
        </div>
      ) : e.logo ? (
        <>
          {e.cover.art ? (
            <Image
              src={e.cover.art.src}
              alt=""
              width={e.cover.art.w}
              height={e.cover.art.h}
              className="pf-art absolute bottom-[-6%] end-[4%] h-[92%] w-auto opacity-40"
            />
          ) : null}
          <div className="absolute inset-0 flex items-center justify-center">
            <Image src={e.logo.src} alt={name} width={e.logo.w} height={e.logo.h} className="pf-logo h-[44%] w-auto drop-shadow-[0_18px_30px_rgba(0,0,0,0.18)]" />
          </div>
        </>
      ) : (
        <div className="absolute inset-0" aria-hidden="true">
          {e.kind === "app" ? (
            <div className={cn("pf-logo absolute bottom-[-12%] end-[9%] h-[86%] w-[34%] rounded-[2rem] border-2 p-3", frame)}>
              <div className={cn("mx-auto h-2 w-1/3 rounded-full", line)} />
              <div className={cn("mt-5 flex h-[26%] items-center justify-center rounded-xl", line, light ? "text-white/80" : "text-black/60")}>
                {e.cover.icon ? <CoverIcon icon={e.cover.icon} /> : null}
              </div>
              <div className="mt-4 space-y-3">
                {[80, 60, 70].map((w) => (
                  <div key={w} className="flex items-center gap-2">
                    <span className={cn("size-6 shrink-0 rounded-lg", line)} />
                    <span className={cn("h-2 rounded-full", line)} style={{ width: `${w}%` }} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={cn("pf-logo absolute bottom-[-8%] end-[-4%] h-[56%] w-[60%] rounded-2xl border-2 p-3", frame)}>
              <div className="flex gap-1.5">
                {[0, 1, 2].map((k) => (
                  <span key={k} className={cn("size-2 rounded-full", line)} />
                ))}
              </div>
              <div className="mt-4 grid h-[70%] grid-cols-[1fr_3fr] gap-3">
                <div className={cn("rounded-lg", line)} />
                <div className="grid grid-rows-[1fr_2fr] gap-3">
                  <div className="grid grid-cols-3 gap-3">
                    {[0, 1, 2].map((k) => (
                      <span key={k} className={cn("rounded-lg", line)} />
                    ))}
                  </div>
                  <div className={cn("rounded-lg", line)} />
                </div>
              </div>
            </div>
          )}
          <span className={cn("mkt-display absolute start-[8%] top-[16%] max-w-[52%] text-[clamp(2rem,4.2vw,3.6rem)] leading-[0.95] rtl:leading-[1.3]", ink)}>
            {name}
          </span>
        </div>
      )}
      <span className={cn("absolute start-6 top-5 font-mono text-xs tracking-[0.18em]", light ? "text-white/60" : "text-black/45")} dir="ltr">
        {String(index + 1).padStart(2, "0")}
      </span>
      {e.url ? (
        <span
          className={cn(
            "absolute end-5 top-5 flex size-10 items-center justify-center rounded-full text-lg transition-transform duration-500 group-hover:rotate-45",
            light ? "bg-white text-black" : "bg-black text-white",
          )}
          aria-hidden="true"
        >
          ↗
        </span>
      ) : null}
    </div>
  );
}
