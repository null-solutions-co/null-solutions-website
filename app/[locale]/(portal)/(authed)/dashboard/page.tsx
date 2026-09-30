import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { DashboardView } from "@/components/portal/DashboardView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard");
  return { title: t("title") };
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <section className="mx-auto max-w-4xl px-6 py-10">
      <DashboardView />
    </section>
  );
}
