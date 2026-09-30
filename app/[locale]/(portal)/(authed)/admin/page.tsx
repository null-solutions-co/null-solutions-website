import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { AdminView } from "@/components/portal/AdminView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin");
  return { title: t("title") };
}

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-3 text-2xl font-semibold">{t("title")}</h1>
      <AdminView />
    </section>
  );
}
