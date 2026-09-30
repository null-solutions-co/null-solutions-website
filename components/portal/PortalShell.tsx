"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { cn } from "@/lib/utils";
import { useSession } from "@/hooks/useSession";
import { NotificationBell } from "./NotificationBell";
import { PortalHeaderUser } from "./PortalHeaderUser";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";

type NavItem = { href: string; key: string; roles?: ("Client" | "Partner" | "Dev")[] };

const NAV: NavItem[] = [
  { href: "/dashboard", key: "dashboard" },
  { href: "/invoices", key: "invoices" },
  { href: "/documents", key: "documents" },
  { href: "/notifications", key: "notifications" },
  { href: "/partner", key: "partner", roles: ["Partner", "Dev"] },
  { href: "/admin", key: "admin", roles: ["Dev"] },
];

export function PortalShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("portalNav");
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.role;
  const items = NAV.filter((i) => !i.roles || (role && i.roles.includes(role)));

  return (
    <div className="mx-auto flex min-h-dvh max-w-6xl flex-col md:flex-row">
      <aside className="border-b border-line md:w-56 md:shrink-0 md:border-b-0 md:border-e">
        <div className="flex items-center gap-2.5 px-6 py-4">
          <Link href="/" aria-label="NULL Solutions">
            <BrandLogo className="h-7 w-auto" />
          </Link>
        </div>
        <nav className="flex flex-wrap gap-1 px-4 pb-3 md:flex-col md:flex-nowrap md:px-2 md:pb-0">
          {items.map((i) => {
            const active = pathname === i.href || pathname.startsWith(`${i.href}/`);
            return (
              <Link
                key={i.href}
                href={i.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative whitespace-nowrap rounded-md px-3 py-2 font-mono text-sm transition-colors",
                  active
                    ? "text-fg md:before:absolute md:before:inset-y-1 md:before:start-0 md:before:w-0.5 md:before:bg-signal"
                    : "text-fg-muted hover:text-fg",
                )}
              >
                {t(i.key)}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex min-w-0 items-center gap-3 border-b border-line px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="me-auto inline-flex shrink-0 items-center gap-2 rounded-full border border-line px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-fg-muted transition-colors hover:border-fg hover:text-fg"
          >
            <span aria-hidden="true" className="rtl:rotate-180">
              ←
            </span>
            <span className="max-sm:sr-only">{t("backToSite")}</span>
          </Link>
          <LocaleSwitcher />
          {session?.scope === "project" ? <NotificationBell /> : null}
          <PortalHeaderUser />
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
