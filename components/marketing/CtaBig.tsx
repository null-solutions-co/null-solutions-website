import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Reveal } from "./Reveal";

export async function CtaBig() {
  const t = await getTranslations("home");

  return (
    <section data-header="light" className="tone-light bg-ground text-fg">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 py-28 text-center md:py-40">
        <Reveal>
          <h2 className="mkt-display text-[clamp(2.5rem,8vw,6rem)]">{t("ctaTitle")}</h2>
        </Reveal>
        <Reveal delay={100}>
          <p className="max-w-[46ch] text-fg-muted">{t("ctaBody")}</p>
        </Reveal>
        <Reveal delay={160}>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-fg px-9 py-4 font-mono text-xs uppercase tracking-[0.16em] text-ground transition-colors hover:bg-signal-ink hover:text-white"
          >
            {t("ctaButton")} <span className="rtl:rotate-180">→</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
