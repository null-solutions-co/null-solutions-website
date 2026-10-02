import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageIntro } from "@/components/marketing/PageIntro";
import { EdgeLines } from "@/components/marketing/portfolio/EdgeLines";
import { Reveal } from "@/components/marketing/Reveal";
import { Parallax } from "@/components/marketing/portfolio/Parallax";
import { WorkCover } from "@/components/marketing/portfolio/WorkCover";
import { COMPANY } from "@/lib/company";
import { PORTFOLIO } from "@/lib/portfolio";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("portfolio");
  return { title: t("title"), description: t("body") };
}

/**
 * Two per row in a 7/5 then 5/7 rhythm, the second card dropped a little so
 * the wall reads as a spread rather than a table. A lone last card centres.
 */
function span(i: number, total: number): string {
  if (i === total - 1 && total % 2 === 1) return "md:col-span-8 md:col-start-3";
  const wide = Math.floor(i / 2) % 2 === 0 ? i % 2 === 0 : i % 2 === 1;
  return cn(wide ? "md:col-span-7" : "md:col-span-5", i % 2 === 1 && "md:mt-28");
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-xs uppercase tracking-[0.24em] text-fg-muted">
      <span className="text-signal-ink">/</span>&nbsp; {children}
    </p>
  );
}

/**
 * The page NULL sends a prospect: who we are, who we've built for, and how
 * to reach us — in that order, readable top to bottom on its own.
 */
export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("portfolio");
  const nav = await getTranslations("nav");
  const lang = locale === "en" ? "en" : "ar";
  const makes = t.raw("makes") as string[];

  return (
    <div className="relative isolate overflow-x-clip">
      <PageIntro eyebrow={t("eyebrow")} title={t("title")} body={t("body")} />

      {/* ---- who we are ---- */}
      <section className="relative isolate mx-auto max-w-6xl px-6 pb-28 md:pb-36">
        <EdgeLines className="-top-24 h-[95%]" />
        <div className="grid gap-12 border-t border-line pt-14 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:gap-20">
          <Reveal className="flex flex-col gap-5">
            <Eyebrow>{t("whoTitle")}</Eyebrow>
            <p className="text-[clamp(1.2rem,1.8vw,1.5rem)] leading-relaxed">{t("whoBody")}</p>
          </Reveal>
          <Reveal delay={120}>
            <ul className="flex flex-col">
              {makes.map((m, i) => (
                <li
                  key={m}
                  className="flex items-baseline justify-between gap-6 border-b border-line py-3 first:pt-0"
                >
                  <span className="text-[clamp(1.1rem,1.6vw,1.35rem)] font-medium leading-snug">{m}</span>
                  <span className="font-mono text-xs text-fg-muted" dir="ltr">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href="/about"
              className="mt-8 inline-flex items-center gap-2 border-b-2 border-signal pb-1 text-sm font-medium"
            >
              {t("aboutLink")} <span className="rtl:rotate-180">→</span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ---- companies we've built for ---- */}
      <section data-header="light" className="tone-light border-t border-line bg-ground text-fg">
        <div className="mx-auto max-w-[1400px] px-6 pb-32 pt-24 min-[900px]:px-[max(3rem,6vw)] md:pb-44 md:pt-32">
          <Reveal className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8">
            <div className="flex flex-col gap-5">
              <Eyebrow>{t("eyebrow")}</Eyebrow>
              <h2 className="mkt-display text-[clamp(2.2rem,5vw,4rem)]">{t("workTitle")}</h2>
            </div>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-fg-muted">{t("count", { count: PORTFOLIO.length })}</span>
          </Reveal>

          <Parallax>
            <ul className="grid gap-x-10 gap-y-20 pt-14 md:grid-cols-12">
              {PORTFOLIO.map((e, i) => {
                const name = e.name[lang];
                const body = (
                  <>
                    <WorkCover e={e} name={name} index={i} />
                    <div className="mt-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                      <h3 className="mkt-display text-[clamp(1.7rem,2.6vw,2.4rem)]">{name}</h3>
                      <span className="rounded-full border border-line px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-fg-muted">
                        {t(`types.${e.kind}`)}
                      </span>
                    </div>
                    {e.fullName ? (
                      <p className="mt-2 text-sm text-fg-muted">
                        {e.fullName[lang]}
                      </p>
                    ) : null}
                    {e.summary ? <p className="mt-3 max-w-[52ch] leading-relaxed text-fg-muted">{e.summary[lang]}</p> : null}
                    {e.url ? (
                      <p className="mt-3 font-mono text-xs uppercase tracking-[0.16em] text-fg-muted transition-colors group-hover:text-fg">
                        {t("visit")} <span dir="ltr">{e.url.replace(/^https?:\/\//, "")}</span> ↗
                      </p>
                    ) : null}
                  </>
                );
                return (
                  <li key={e.slug} className={span(i, PORTFOLIO.length)}>
                    <Reveal delay={(i % 2) * 120}>
                      {e.url ? (
                        <a href={e.url} target="_blank" rel="noopener noreferrer" className="group block">
                          {body}
                        </a>
                      ) : (
                        <div className="group">{body}</div>
                      )}
                    </Reveal>
                  </li>
                );
              })}
            </ul>
          </Parallax>
        </div>
      </section>

      {/* ---- contact ---- */}
      <section className="relative isolate mx-auto max-w-6xl px-6 py-28 md:py-40">
        <EdgeLines className="top-[4%] h-[70%]" />
        <Reveal className="flex flex-col gap-6">
          <Eyebrow>{nav("contact")}</Eyebrow>
          <h2 className="mkt-display max-w-[14ch] text-[clamp(2.6rem,7vw,6rem)]">{t("contactTitle")}</h2>
          <p className="max-w-[46ch] text-lg text-fg-muted">{t("contactBody")}</p>
        </Reveal>
        <div className="tone-light mt-14 grid overflow-hidden rounded-3xl bg-white text-fg sm:grid-cols-2 lg:grid-cols-3">
          <a href={`mailto:${COMPANY.email}`} className="group flex flex-col gap-3 p-10 transition-colors hover:bg-black/[0.03]">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-fg-muted">{t("email")}</span>
            <span className="text-xl font-semibold group-hover:text-[#5c5c5c]" dir="ltr">
              {COMPANY.email}
            </span>
          </a>
          {COMPANY.phone ? (
            <a href={`tel:${COMPANY.phone.replace(/\s+/g, "")}`} className="group flex flex-col gap-3 p-10 transition-colors hover:bg-black/[0.03]">
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-fg-muted">{t("phone")}</span>
              <span className="text-xl font-semibold group-hover:text-[#5c5c5c]" dir="ltr">
                {COMPANY.phone}
              </span>
            </a>
          ) : null}
          <div className="flex flex-col gap-3 border-line p-10 sm:border-s">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-fg-muted">{t("office")}</span>
            <span className="text-xl font-semibold">{t("officeValue")}</span>
          </div>
          <Link href="/contact" className="group flex items-center justify-between gap-4 bg-[#1c1c1c] p-10 text-white">
            <span className="text-xl font-semibold">{t("formCta")}</span>
            <span className="text-2xl transition-transform duration-500 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1">→</span>
          </Link>
        </div>
        {COMPANY.social.length ? (
          <ul className="mt-8 flex flex-wrap gap-3">
            {COMPANY.social.map((so) => (
              <li key={so.href}>
                <a href={so.href} target="_blank" rel="noopener noreferrer" className="rounded-full border border-line px-5 py-2.5 font-mono text-xs uppercase tracking-[0.16em] hover:border-fg">
                  {so.label} ↗
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
