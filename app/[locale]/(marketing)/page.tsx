import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Hero } from "@/components/marketing/Hero";
import { WhoWeAre } from "@/components/marketing/WhoWeAre";
import { FeaturedWork } from "@/components/marketing/FeaturedWork";
import { Portal } from "@/components/marketing/Portal";
import { Method } from "@/components/marketing/Method";
import { CtaBig } from "@/components/marketing/CtaBig";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home");
  return { description: t("sub") };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <>
      <Hero />

      <WhoWeAre
        eyebrow={t("who.eyebrow")}
        title={t("who.title")}
        body={t("who.body")}
        pillars={t.raw("who.pillars") as { title: string; body: string }[]}
        cta={t("who.cta")}
      />

      <FeaturedWork />

      <Portal />

      <Method />

      <CtaBig />
    </>
  );
}
