import { setRequestLocale } from "next-intl/server";
import { ProjectView } from "@/components/portal/ProjectView";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return (
    <section className="mx-auto max-w-4xl px-6 py-10">
      <ProjectView id={id} />
    </section>
  );
}
