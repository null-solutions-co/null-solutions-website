import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { LoginForm } from "@/components/portal/LoginForm";
import { SpaceScene } from "@/components/portal/SpaceScene";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("login");
  return { title: t("title") };
}

/**
 * Client sign-in, after the 21st.dev auth-ui the user chose: the form on one
 * side, a picture with a typewriter line on the other — here a drifting
 * astronaut over the ∅ planet. On phones the scene sits on top, shorter.
 */
export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("login");
  const nav = await getTranslations("portalNav");

  const back = (
    <Link
      href="/"
      className="inline-flex items-center gap-2 rounded-full border border-current/25 px-4 py-2 font-mono text-[0.7rem] uppercase tracking-[0.14em] opacity-80 transition-opacity hover:opacity-100"
    >
      <span aria-hidden="true" className="rtl:rotate-180">
        ←
      </span>
      {nav("backToSite")}
    </Link>
  );

  return (
    <div className="grid min-h-dvh bg-white text-fg md:grid-cols-2">
      <div className="flex flex-col">
        <header className="hidden items-center justify-between gap-4 px-8 py-6 md:flex">
          {back}
          <div className="flex items-center gap-5">
            <LocaleSwitcher />
            <Link href="/" aria-label="NULL Solutions">
              <BrandLogo className="h-7 w-auto" />
            </Link>
          </div>
        </header>
        <main className="flex flex-1 items-center justify-center px-6 py-12 md:pb-20 md:pt-6">
          <LoginForm />
        </main>
      </div>

      <div className="relative order-first h-[23rem] md:order-none md:h-auto">
        <SpaceScene quote={t("quote")} author={t("quoteAuthor")} />
        {/* phones: the way back and the language sit on the scene */}
        <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-4 text-white md:hidden">
          {back}
          <LocaleSwitcher />
        </div>
      </div>
    </div>
  );
}
