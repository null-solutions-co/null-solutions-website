import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PageIntro } from "@/components/marketing/PageIntro";
import { Reveal } from "@/components/marketing/Reveal";
import { ContactForm } from "@/components/marketing/ContactForm";

const EMAIL = "info@null-solutions.com";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("contact");
  return { title: t("title"), description: t("body") };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  const facts = [
    { label: t("office"), value: t("officeValue") },
    { label: t("reply"), value: t("replyValue") },
  ];

  return (
    <>
      <PageIntro eyebrow={t("eyebrow")} title={t("title")} body={t("body")} />
      <section className="mx-auto grid max-w-6xl gap-12 px-6 pb-28 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
        <Reveal className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-fg-muted">
              {t("direct")}
            </p>
            <a
              href={`mailto:${EMAIL}`}
              dir="ltr"
              className="self-start text-xl underline-offset-4 hover:underline"
            >
              {EMAIL}
            </a>
          </div>
          {facts.map((f) => (
            <div key={f.label} className="flex flex-col gap-2">
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-fg-muted">
                {f.label}
              </p>
              <p className="text-xl">{f.value}</p>
            </div>
          ))}
        </Reveal>
        <Reveal delay={100} className="tone-light rounded-3xl bg-white p-8 text-fg md:p-12">
          <ContactForm />
        </Reveal>
      </section>
    </>
  );
}
