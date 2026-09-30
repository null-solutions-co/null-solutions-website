"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/**
 * Toggles between English and Arabic, keeping the current page. The target is
 * built directly (`/about` ↔ `/ar/about`): next-intl's own switch keeps an
 * `/en` prefix on the way back to the default locale, which leaves an untidy
 * `/en/...` address in the bar.
 */
export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const next = locale === "ar" ? "en" : "ar";
  const target = next === routing.defaultLocale ? pathname : `/${next}${pathname === "/" ? "" : pathname}`;

  return (
    <button
      type="button"
      onClick={() => router.replace(target + window.location.hash)}
      className="font-mono text-[0.72rem] uppercase tracking-[0.16em] opacity-70 transition-opacity hover:opacity-100"
      aria-label={next === "ar" ? "التبديل إلى العربية" : "Switch to English"}
    >
      {next === "ar" ? "ع" : "EN"}
    </button>
  );
}
