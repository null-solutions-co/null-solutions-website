"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/**
 * Toggles between English and Arabic, keeping the current page. The target is
 * built directly (`/about` ↔ `/ar/about`): next-intl's own switch keeps an
 * `/en` prefix on the way back to the default locale, which leaves an untidy
 * `/en/...` address in the bar.
 *
 * It's a real link, so a tap before the page's scripts are ready still works.
 * Once they are, the switch happens in place and the link dims while it's on
 * its way, so a second tap isn't needed. (No prefetch of the other language:
 * prefetching a page under the other root layout made Next's prefetches of
 * the home page's own links 404 intermittently.)
 */
export function LocaleSwitcher({ pill = false }: { pill?: boolean }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const next = locale === "ar" ? "en" : "ar";
  const target = next === routing.defaultLocale ? pathname : `/${next}${pathname === "/" ? "" : pathname}`;

  return (
    <a
      href={target}
      hrefLang={next}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        if (pending) return;
        startTransition(() => router.replace(target + window.location.hash));
      }}
      aria-busy={pending}
      className={cn(
        pill
          ? "flex h-10 items-center rounded-full border border-current/25 px-4 text-sm font-medium transition-transform active:scale-95"
          : "font-mono text-[0.72rem] uppercase tracking-[0.16em] opacity-70 transition-opacity hover:opacity-100",
        pending && "pointer-events-none animate-pulse opacity-40",
      )}
      aria-label={next === "ar" ? "التبديل إلى العربية" : "Switch to English"}
    >
      {pill ? (next === "ar" ? "عربي" : "English") : next === "ar" ? "ع" : "EN"}
    </a>
  );
}
