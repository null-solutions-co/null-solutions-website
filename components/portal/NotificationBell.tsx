"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useUnreadCount } from "@/hooks/queries";

export function NotificationBell() {
  const t = useTranslations("portalNav");
  const { data } = useUnreadCount();
  const count = data?.count ?? 0;

  return (
    <Link
      href="/notifications"
      className="relative rounded-md px-2 py-1.5 font-mono text-sm text-fg-muted hover:text-fg"
      aria-label={`${t("notifications")}${count ? ` (${count})` : ""}`}
    >
      {t("notifications")}
      {count > 0 ? (
        <span className="absolute -end-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-signal text-[10px] font-semibold text-white">
          {count > 9 ? "9+" : count}
        </span>
      ) : null}
    </Link>
  );
}
