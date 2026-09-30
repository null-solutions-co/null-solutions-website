import { setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SmoothScroll } from "@/components/marketing/SmoothScroll";
import { Cursor } from "@/components/marketing/Cursor";

/** Public marketing surface — its own visual world (see globals.css [data-theme="mkt"]). */
export default async function MarketingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div data-theme="mkt" className="min-h-dvh bg-ground text-fg">
      <SmoothScroll />
      <Cursor />
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="content">{children}</main>
      <SiteFooter />
    </div>
  );
}
