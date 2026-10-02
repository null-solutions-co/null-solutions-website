import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Outfit, Tajawal, IBM_Plex_Mono } from "next/font/google";
import { routing } from "@/i18n/routing";
import "../globals.css";
import { LoadingScreen } from "@/components/brand/LoadingScreen";

// The site's typefaces (user's pick, 2026-09-30): Outfit for Latin, Tajawal
// for Arabic — headings and text alike. Outfit has no Arabic glyphs, so Arabic
// text falls through to Tajawal. `adjustFontFallback: false` matters: the
// automatic fallback face is local Arial, which *does* have Arabic, and would
// catch every Arabic letter before Tajawal was ever reached.
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
  adjustFontFallback: false,
});

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  variable: "--font-tajawal",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
  // same reason: Arabic in mono labels must reach Tajawal, not a local fallback
  adjustFontFallback: false,
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  // The site is already in Arabic and English: stop Chrome offering to
  // translate it (its popup sat over the header and swallowed the first tap).
  other: { google: "notranslate" },
  title: {
    default: "NULL Solutions",
    template: "%s · NULL Solutions",
  },
  description:
    "NULL Solutions designs, builds and secures websites, software, mobile apps, ERP systems and AI tools in Amman, with a private portal to follow every project.",
  alternates: {
    languages: { en: "/", ar: "/ar" },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      translate="no"
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={`${outfit.variable} ${tajawal.variable} ${plexMono.variable}`}
    >
      <body className="min-h-dvh">
        <LoadingScreen />
        {/* NextIntlClientProvider is needed by client components on every surface.
            The TanStack Query / MSW / Toaster providers live in (portal) only —
            the static marketing pages don't ship that JS. */}
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
