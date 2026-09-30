import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Reveal } from "./Reveal";

/**
 * Opening block for the inner marketing pages — same voice as the home hero.
 * The eyebrow doubles as a breadcrumb, so every inner page has a way back home
 * right where the eye starts.
 */
export async function PageIntro({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body?: string;
}) {
  const nav = await getTranslations("nav");

  return (
    <section className="mx-auto max-w-6xl px-6 pb-16 pt-36 md:pb-24 md:pt-44">
      <Reveal className="flex flex-col gap-6">
        <nav aria-label={nav("breadcrumb")} className="font-mono text-xs uppercase tracking-[0.24em] text-fg-muted">
          <ol className="flex items-center gap-3">
            <li>
              <Link
                href="/"
                className="inline-flex items-center gap-2 underline-offset-4 transition-colors hover:text-fg hover:underline"
              >
                <span className="rtl:rotate-180" aria-hidden="true">
                  ←
                </span>
                {nav("home")}
              </Link>
            </li>
            <li aria-hidden="true" className="text-signal-ink">
              /
            </li>
            <li aria-current="page" className="text-fg">
              {eyebrow}
            </li>
          </ol>
        </nav>
        <h1 className="mkt-display max-w-[16ch] text-[clamp(2.8rem,8vw,6.5rem)]">{title}</h1>
        {body ? (
          <p className="max-w-[58ch] text-[clamp(1.05rem,1.6vw,1.3rem)] leading-relaxed text-fg-muted">
            {body}
          </p>
        ) : null}
      </Reveal>
    </section>
  );
}
