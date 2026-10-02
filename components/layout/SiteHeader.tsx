import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PORTAL_ENABLED } from "@/lib/env";
import { COMPANY } from "@/lib/company";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { HeaderTone } from "./HeaderTone";
import { MobileNav } from "./MobileNav";
import { NavLinks } from "./NavLinks";

export async function SiteHeader() {
  const t = await getTranslations("nav");

  const links = [
    { href: "/", label: t("home") },
    { href: "/services", label: t("services") },
    { href: "/portfolio", label: t("portfolio") },
    { href: "/about", label: t("about") },
    { href: "/contact", label: t("contact") },
  ] as const;

  return (
    <header
      id="site-header"
      data-tone="dark"
      className="group/header fixed inset-x-0 top-0 z-40 bg-gradient-to-b from-[#0a0a0a]/80 to-transparent text-[#fafafa] transition-colors duration-300 data-[tone=light]:from-white/90 data-[tone=light]:text-[#0a0a0a]"
    >
      <HeaderTone />
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-x-6 px-6 py-5 min-[900px]:px-[max(3rem,6vw)]">
        <Link href="/" aria-label="NULL Solutions">
          {/* black artwork: inverted to white over dark sections, left black over light ones */}
          <BrandLogo
            className="h-8 w-auto brightness-0 min-[900px]:h-9 invert transition-[filter] duration-300 group-data-[tone=light]/header:invert-0"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-x-4 md:flex">
          <NavLinks items={[...links]} />
          <LocaleSwitcher />
          {/* the client portal link shows only once the portal has a backend */}
          {PORTAL_ENABLED ? (
            <Link
              href="/login"
              className="rounded-full px-3 py-1.5 font-mono text-[0.72rem] uppercase tracking-[0.16em] opacity-65 transition-opacity hover:opacity-100"
            >
              {t("portal")}
            </Link>
          ) : null}
        </nav>
        {/* phones: the language switch sits in the header, next to the menu */}
        <div className="flex items-center gap-2 md:hidden">
          <LocaleSwitcher pill />
          <MobileNav
          items={PORTAL_ENABLED ? [...links, { href: "/login", label: t("portal") }] : [...links]}
          labels={{ open: t("menu"), close: t("close") }}
          extra={<LocaleSwitcher pill />}
          email={COMPANY.email}
        />
        </div>
      </div>
    </header>
  );
}
