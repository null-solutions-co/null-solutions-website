import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import { getCmsMessages } from "@/lib/cms";
import { mergeMessages } from "@/lib/cms-parse";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  // The bundled texts are the fallback: when NULL_CMS_URL is unset or the
  // platform is unreachable they are used as they are; otherwise the texts
  // edited in the platform (/admin/website/texts) are laid over them.
  const bundled = (await import(`../messages/${locale}.json`)).default;
  const cms = await getCmsMessages(locale);

  return {
    locale,
    messages: cms ? mergeMessages(bundled, cms) : bundled,
  };
});
