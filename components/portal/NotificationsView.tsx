"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/hooks/queries";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CardSkeleton, EmptyState, ErrorState } from "@/components/ui/states";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Notification } from "@/lib/api/schemas";

const HREF: Record<string, (id: string) => string> = {
  project: (id) => `/projects/${id}`,
  invoice: (id) => `/invoices/${id}`,
  document: () => `/documents`,
  request: (id) => `/requests/${id}`,
};

export function NotificationsView() {
  const t = useTranslations("notifications");
  const c = useTranslations("common");
  const locale = useLocale();
  const { data, isLoading, isError, refetch } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  if (isLoading) return <CardSkeleton rows={4} />;
  if (isError) return <ErrorState title={c("loadError")} onRetry={() => refetch()} retryLabel={c("retry")} />;
  if (!data || data.items.length === 0)
    return <EmptyState title={t("empty")} body={t("emptyBody")} />;

  return (
    <div className="flex flex-col gap-4">
      {data.unreadCount > 0 ? (
        <div className="flex items-center justify-between">
          <span className="u-label">
            {data.unreadCount} {t("unread")}
          </span>
          <Button variant="ghost" size="sm" onClick={() => markAll.mutate()}>
            {t("markAll")}
          </Button>
        </div>
      ) : null}

      <ul className="flex flex-col gap-2">
        {data.items.map((n: Notification) => {
          const to = n.link ? HREF[n.link.entity]?.(n.link.id) : undefined;
          const inner = (
            <Card
              className={cn(
                "flex items-start gap-3 py-4",
                !n.isRead && "border-s-2 border-s-signal",
              )}
            >
              {!n.isRead ? (
                <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-signal" />
              ) : (
                <span aria-hidden className="mt-1.5 size-1.5 shrink-0" />
              )}
              <div className="flex flex-col gap-1">
                <span className="font-medium">{n.title}</span>
                <span className="text-sm text-fg-muted">{n.body}</span>
                <span className="u-label">{formatDate(n.createdAt, locale)}</span>
              </div>
            </Card>
          );
          return (
            <li key={n.id} onMouseEnter={() => !n.isRead && markRead.mutate(n.id)}>
              {to ? (
                <Link href={to} className="block" onClick={() => !n.isRead && markRead.mutate(n.id)}>
                  {inner}
                </Link>
              ) : (
                inner
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
