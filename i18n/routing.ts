import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ar"],
  // English first (founder, 2026-09-28): `/` serves English, `/ar/...` serves
  // Arabic. RTL is wired from the locale in [locale]/layout.tsx.
  defaultLocale: "en",
  localePrefix: "as-needed",
  // `/` always opens in English. Arabic is one click away via the language
  // switcher or `/ar` — we don't auto-redirect by Accept-Language.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
