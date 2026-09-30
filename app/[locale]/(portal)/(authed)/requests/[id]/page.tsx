import { setRequestLocale } from "next-intl/server";
import { RequestThread } from "@/components/portal/RequestsPanel";

export default async function RequestPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return (
    <section className="mx-auto max-w-3xl px-6 py-10">
      <RequestThread requestId={id} />
    </section>
  );
}
