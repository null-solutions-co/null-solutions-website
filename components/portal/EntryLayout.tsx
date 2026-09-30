import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";

/**
 * The way into the portal: a quiet paper page with a way back to the site and
 * the language switch on top, and one thing in the middle — the form, which
 * carries its own NULL mark (see KeyMark).
 */
export async function EntryLayout({ children }: { children: React.ReactNode }) {
  const nav = await getTranslations("portalNav");

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-5">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-fg-muted transition-colors hover:border-fg hover:text-fg"
        >
          <span aria-hidden="true" className="rtl:rotate-180">
            ←
          </span>
          {nav("backToSite")}
        </Link>
        <div className="flex items-center gap-5">
          <LocaleSwitcher />
          <Link href="/" aria-label="NULL Solutions" className="max-sm:hidden">
            <BrandLogo className="h-7 w-auto" />
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 pb-20 pt-6">{children}</main>
    </div>
  );
}
