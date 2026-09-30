import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { AdminClientView } from "@/components/portal/admin/AdminClientView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin");
  return { title: t("title") };
}

export default async function AdminClientPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <AdminClientView id={id} />
    </section>
  );
}
