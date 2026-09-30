import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageIntro } from "@/components/marketing/PageIntro";
import { SilkRibbon } from "@/components/marketing/SilkRibbon";
import { Reveal } from "@/components/marketing/Reveal";
import { CtaBig } from "@/components/marketing/CtaBig";
import { CountUp } from "@/components/marketing/about/CountUp";
import { PRINCIPLE_ICONS, ROLE_ICONS } from "@/components/marketing/about/Icons";

const ROLE_KEYS = ["lead", "backend", "frontend", "security", "ai"] as const;

/** The service lines grouped by what they're for, so this page reads as a map of the work, not a list. */
const GROUPS = [
  { key: "build", codes: ["S1", "S2", "S3", "S11"] },
  { key: "intelligence", codes: ["S4", "S5"] },
  { key: "security", codes: ["S6", "S7"] },
  { key: "run", codes: ["S8", "S9", "S10"] },
] as const;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("about");
  return { title: t("title"), description: t("body") };
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-xs uppercase tracking-[0.24em] text-fg-muted">
      <span className="text-signal-ink">/</span>&nbsp; {children}
    </p>
  );
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const s = await getTranslations("services");
  const facts = t.raw("facts") as { n: number; label: string }[];
  const principles = t.raw("principles") as { title: string; body: string }[];

  return (
    <div className="relative isolate overflow-x-clip">
      <PageIntro eyebrow={t("eyebrow")} title={t("title")} body={t("body")} />

      {/* ---- three true numbers ---- */}
      <section className="relative isolate mx-auto max-w-6xl px-6 pb-28 md:pb-40">
        <SilkRibbon className="-top-24 h-[85%]" tilt={0.15} />
        <Reveal>
          <Eyebrow>{t("factsTitle")}</Eyebrow>
        </Reveal>
        <ul className="mt-8 grid border-y border-line md:grid-cols-3">
          {facts.map((f, i) => (
            <li
              key={f.label}
              className="border-line py-10 md:px-10 md:py-14 [&:not(:first-child)]:border-t md:[&:not(:first-child)]:border-s md:[&:not(:first-child)]:border-t-0 md:first:ps-0"
            >
              <Reveal delay={i * 110}>
                <CountUp value={f.n} className="mkt-display block text-[clamp(4.5rem,11vw,9.5rem)] leading-none tabular-nums" />
                <p className="mt-5 max-w-[22ch] text-lg text-fg-muted">{f.label}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      {/* ---- what we hold ourselves to ---- */}
      <section data-header="light" className="tone-light bg-ground text-fg">
        <div className="mx-auto max-w-6xl px-6 py-28 md:py-40">
          <Reveal className="flex max-w-4xl flex-col gap-5">
            <Eyebrow>{t("principlesEyebrow")}</Eyebrow>
            <h2 className="mkt-display text-[clamp(2.2rem,5vw,4.2rem)]">{t("principlesTitle")}</h2>
          </Reveal>
          <ul className="mt-16 grid gap-5 md:grid-cols-2">
            {principles.map((p, i) => {
              const Icon = PRINCIPLE_ICONS[i % PRINCIPLE_ICONS.length];
              return (
                <li key={p.title}>
                  <Reveal
                    delay={(i % 2) * 120}
                    className="group flex h-full flex-col gap-6 rounded-[28px] border border-line bg-surface p-8 md:p-10"
                  >
                    <div className="flex items-start justify-between">
                      <Icon />
                      <span className="font-mono text-xs tracking-[0.18em] text-fg-muted" dir="ltr">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="text-[clamp(1.5rem,2.2vw,2rem)] font-semibold leading-tight">{p.title}</h3>
                    <p className="max-w-[44ch] leading-relaxed text-fg-muted">{p.body}</p>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ---- what we do: the service index ---- */}
      <section className="relative isolate mx-auto max-w-6xl px-6 py-28 md:py-40">
        <SilkRibbon className="bottom-0 h-[55%]" seed={0.35} tilt={-0.2} />
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div className="flex flex-col gap-5">
            <Eyebrow>{s("eyebrow")}</Eyebrow>
            <h2 className="mkt-display text-[clamp(2.2rem,5vw,4.2rem)]">{t("servicesTitle")}</h2>
          </div>
          <Link href="/services" className="font-mono text-xs uppercase tracking-[0.16em] text-fg-muted underline-offset-4 hover:text-fg hover:underline">
            {t("servicesLink")} <span className="inline-block rtl:rotate-180">→</span>
          </Link>
        </Reveal>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {GROUPS.map((g, gi) => (
            <Reveal key={g.key} delay={gi * 90} className="h-full">
              <article className="flex h-full flex-col rounded-[28px] border border-line p-7">
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-signal-ink">{t(`groups.${g.key}.label`)}</span>
                <h3 className="mt-4 text-2xl font-semibold leading-snug tracking-tight">{t(`groups.${g.key}.title`)}</h3>
                <ul className="mt-6 flex flex-1 flex-col gap-1 border-t border-line pt-4">
                  {g.codes.map((code) => (
                    <li key={code}>
                      <Link
                        href={`/services#${code.toLowerCase()}`}
                        className="group flex items-center justify-between gap-3 rounded-lg py-2 text-fg-muted transition-colors hover:text-fg"
                      >
                        <span>{s(`items.${code}.name`)}</span>
                        <span className="opacity-0 transition-opacity group-hover:opacity-100 rtl:rotate-180">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---- who you'll work with ---- */}
      <section data-header="light" className="tone-light bg-ground text-fg">
        <div className="mx-auto max-w-6xl px-6 py-28 md:py-40">
          <Reveal className="flex max-w-3xl flex-col gap-5">
            <Eyebrow>{t("rolesEyebrow")}</Eyebrow>
            <h2 className="mkt-display text-[clamp(2.2rem,5vw,4.2rem)]">{t("rolesTitle")}</h2>
            <p className="max-w-[52ch] text-lg text-fg-muted">{t("rolesNote")}</p>
          </Reveal>
          <ul className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {ROLE_KEYS.map((key, i) => {
              const Icon = ROLE_ICONS[key];
              return (
                <li key={key}>
                  <Reveal delay={i * 90} className="flex h-full flex-col gap-5 rounded-3xl border border-line bg-surface p-6">
                    <span className="flex size-14 items-center justify-center rounded-2xl bg-ground">
                      <Icon />
                    </span>
                    <span className="text-lg font-semibold leading-snug">{t(`roles.${key}.title`)}</span>
                    <span className="text-sm leading-relaxed text-fg-muted">{t(`roles.${key}.description`)}</span>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ---- see the work ---- */}
      <section className="relative isolate border-b border-line">
        <SilkRibbon className="inset-y-0" seed={0.7} tilt={0.1} />
        <Link href="/portfolio" className="group mx-auto flex max-w-6xl items-center justify-between gap-8 px-6 py-20 md:py-28">
          <span className="flex flex-col gap-4">
            <Eyebrow>{t("workTitle")}</Eyebrow>
            <span className="mkt-display text-[clamp(3rem,9vw,8rem)] leading-none transition-colors rtl:leading-[1.25] duration-500 group-hover:text-signal-ink">
              {t("workCta")}
            </span>
          </span>
          <span className="flex size-20 shrink-0 items-center justify-center rounded-full border border-line text-3xl transition-all duration-500 group-hover:rotate-[-45deg] group-hover:border-transparent group-hover:bg-signal group-hover:text-white rtl:group-hover:rotate-[225deg] md:size-28">
            <span className="rtl:rotate-180">→</span>
          </span>
        </Link>
      </section>

      <CtaBig />
    </div>
  );
}
