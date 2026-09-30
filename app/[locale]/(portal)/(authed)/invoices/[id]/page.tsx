import { setRequestLocale } from "next-intl/server";
import { InvoiceDetailView } from "@/components/portal/InvoiceDetailView";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return (
    <section className="mx-auto max-w-4xl px-6 py-10">
      <InvoiceDetailView id={id} />
    </section>
  );
}
