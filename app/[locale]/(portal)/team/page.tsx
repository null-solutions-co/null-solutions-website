import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { EntryLayout } from "@/components/portal/EntryLayout";
import { TeamLoginForm } from "@/components/portal/TeamLoginForm";
import { KeyMark } from "@/components/portal/KeyMark";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("team");
  return { title: t("title"), robots: { index: false, follow: false } };
}

/** NULL team sign-in. Deliberately not in any navigation or the sitemap. */
export default async function TeamLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("team");

  return (
    <EntryLayout>
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <KeyMark progress={1} className="key-in size-20" />
        <h1 className="key-in key-in--2 mt-7 text-3xl font-semibold leading-tight">{t("title")}</h1>
        <p className="key-in key-in--2 mt-3 text-sm text-fg-muted">{t("intro")}</p>
        <div className="key-in key-in--3 mt-8 w-full text-start">
          <TeamLoginForm />
        </div>
      </div>
    </EntryLayout>
  );
}
