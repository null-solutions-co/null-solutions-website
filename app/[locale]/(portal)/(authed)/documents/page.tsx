import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { DocumentsView } from "@/components/portal/DocumentsView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("documents");
  return { title: t("title") };
}

export default async function DocumentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("documents");

  return (
    <section className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-6 text-xl font-semibold">{t("title")}</h1>
      <DocumentsView />
    </section>
  );
}
