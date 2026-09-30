import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { FooterContact } from "./FooterContact";

export async function SiteFooter() {
  const nav = await getTranslations("nav");
  const f = await getTranslations("footer");
  const year = new Date().getFullYear();

  const links = [
    { href: "/", label: nav("home") },
    { href: "/services", label: nav("services") },
    { href: "/portfolio", label: nav("portfolio") },
    { href: "/about", label: nav("about") },
    { href: "/contact", label: nav("contact") },
    { href: "/login", label: nav("portal") },
  ] as const;

  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16">
        <FooterContact follow={f("follow")} instagram={f("instagram")} email={f("email")} />
        <div className="flex flex-wrap items-start justify-between gap-8">
          <Link href="/" aria-label="NULL Solutions">
            <BrandLogo className="h-7 w-auto brightness-0 invert" />
          </Link>
          <nav className="flex flex-wrap gap-x-8 gap-y-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="font-mono text-xs uppercase tracking-[0.14em] text-fg-muted transition-colors hover:text-fg"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 font-mono text-xs text-fg-muted">
          <span>{f("location")}</span>
          <span>
            © {year} · {f("rights")}
          </span>
        </div>
      </div>
    </footer>
  );
}
