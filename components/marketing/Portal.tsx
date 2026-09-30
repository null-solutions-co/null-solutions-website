import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PortalStage } from "./PortalStage";
import { PortalDemo } from "./demos/PortalDemo";

/** The client portal, shown as the one real product on the page. */
export async function Portal() {
  const t = await getTranslations("home");
  const locale = await getLocale();

  return (
    <PortalStage
      screen={<PortalDemo locale={locale} />}
      caption={t("portalCaption")}
      copy={
        <>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-fg-muted">
            <span className="text-signal-ink">/</span>&nbsp; {t("portalEyebrow")}
          </p>
          <h2 className="mkt-display mx-auto mt-5 max-w-[16ch] text-[clamp(2.4rem,5.6vw,5rem)]">
            {t("portalTitle")}
          </h2>
          <p className="mx-auto mt-5 max-w-[52ch] text-[clamp(1rem,1.4vw,1.15rem)] text-fg-muted">
            {t("portalBody")}
          </p>
          <div className="mt-7 flex justify-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full border border-fg/20 px-6 py-3 font-mono text-xs uppercase tracking-[0.14em] text-fg transition-colors hover:border-fg"
            >
              {t("portalCta")} <span className="rtl:rotate-180">→</span>
            </Link>
          </div>
        </>
      }
    />
  );
}
