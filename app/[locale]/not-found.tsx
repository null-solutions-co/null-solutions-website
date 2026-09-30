"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";

export default function LocaleNotFound() {
  const t = useTranslations("notFound");

  return (
    <div
      data-theme="dark"
      className="grid min-h-dvh place-items-center bg-ground px-6 text-fg"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <Logo size={64} />
        <p className="u-label">404</p>
        <p className="text-fg-muted">{t("title")}</p>
        <Button variant="secondary" size="sm" asChild>
          <Link href="/">{t("back")}</Link>
        </Button>
      </div>
    </div>
  );
}
