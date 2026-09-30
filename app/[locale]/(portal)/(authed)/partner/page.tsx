import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PartnerView } from "@/components/portal/PartnerView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("partner");
  return { title: t("title") };
}

export default async function PartnerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("partner");

  return (
    <section className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-6 text-xl font-semibold">{t("title")}</h1>
      <PartnerView />
    </section>
  );
}
