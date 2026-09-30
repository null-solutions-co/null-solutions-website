import { setRequestLocale } from "next-intl/server";
import { Providers } from "@/components/layout/Providers";

/** Portal surface — light ground. The TanStack Query / MSW /
 *  Toaster providers are mounted here so the static marketing pages skip that JS. */
export default async function PortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div data-theme="light" className="min-h-dvh bg-ground text-fg">
      <Providers>{children}</Providers>
    </div>
  );
}
