"use client";

import { useLocale, useTranslations } from "next-intl";
import { useDocuments } from "@/hooks/queries";
import { Card } from "@/components/ui/card";
import { CardSkeleton, EmptyState, ErrorState } from "@/components/ui/states";
import { formatBytes, formatDate } from "@/lib/format";

export function DocumentsView() {
  const t = useTranslations("documents");
  const c = useTranslations("common");
  const locale = useLocale();
  const { data, isLoading, isError, refetch } = useDocuments();

  if (isLoading) return <CardSkeleton rows={4} />;
  if (isError) return <ErrorState title={c("loadError")} onRetry={() => refetch()} retryLabel={c("retry")} />;
  if (!data || data.items.length === 0)
    return <EmptyState title={t("empty")} body={t("emptyBody")} />;

  return (
    <ul className="flex flex-col gap-2">
      {data.items.map((d) => (
        <li key={d.id}>
          <Card className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div className="flex flex-col gap-1">
              <span className="font-medium">{d.name}</span>
              <span className="u-label">
                {d.type} · {formatBytes(d.sizeBytes)} · {formatDate(d.uploadedAt, locale)} · {t("addedBy")} {d.uploadedBy}
              </span>
            </div>
            <a
              href={`/api/proxy/documents/${d.id}/content`}
              className="rounded-md border border-line px-3 py-1.5 font-mono text-sm hover:bg-ground"
            >
              {t("download")}
            </a>
          </Card>
        </li>
      ))}
    </ul>
  );
}
