import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PageIntro } from "@/components/marketing/PageIntro";
import { ServiceCatalogue } from "@/components/marketing/services/ServiceCatalogue";
import { CtaBig } from "@/components/marketing/CtaBig";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("services");
  return { title: t("title"), description: t("intro") };
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("services");

  return (
    <>
      <PageIntro eyebrow={t("eyebrow")} title={t("title")} body={t("intro")} />
      <ServiceCatalogue />
      <CtaBig />
    </>
  );
}
