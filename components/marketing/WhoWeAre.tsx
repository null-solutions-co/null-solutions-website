import { Link } from "@/i18n/navigation";
import { Reveal } from "./Reveal";
import { WhoSteps } from "./WhoSteps";

type Pillar = { title: string; body: string };

/**
 * Home · who we are. The statement and a link to About, then the four steps
 * (plan, build, secure, support) as a pinned scroll: each step's line fills
 * as you pass it, and a graphite panel beside them draws that step in white lines.
 */
export function WhoWeAre({
  eyebrow,
  title,
  body,
  pillars,
  cta,
}: {
  eyebrow: string;
  title: string;
  body: string;
  pillars: Pillar[];
  cta: string;
}) {
  return (
    <section className="relative overflow-x-clip bg-ground text-fg">
      <div className="mx-auto max-w-[1600px] px-6 pt-28 min-[900px]:px-[max(3rem,6vw)] md:pt-40">
        <Reveal className="grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-end lg:gap-20">
          <div className="flex flex-col gap-7">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-fg-muted">
              <span className="text-signal-ink">/</span>&nbsp; {eyebrow}
            </p>
            <h2 className="mkt-display max-w-[16ch] text-[clamp(2.6rem,5.6vw,5.4rem)]">{title}</h2>
          </div>
          <div className="flex flex-col gap-8">
            <p className="max-w-[52ch] text-[clamp(1.05rem,1.4vw,1.25rem)] leading-relaxed text-fg-muted">{body}</p>
            <Link
              href="/about"
              className="group inline-flex w-fit items-center gap-3 rounded-full border border-line py-2 pe-2 ps-6 font-mono text-xs uppercase tracking-[0.14em] transition-colors hover:border-fg"
            >
              {cta}
              <span className="flex size-9 items-center justify-center rounded-full bg-white text-black transition-transform duration-500 group-hover:rotate-[-45deg] rtl:group-hover:rotate-[225deg]">
                <span className="rtl:rotate-180">→</span>
              </span>
            </Link>
          </div>
        </Reveal>
      </div>

      <WhoSteps steps={pillars.slice(0, 4)} />
    </section>
  );
}
