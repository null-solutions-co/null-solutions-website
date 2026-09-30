"use client";

import { useTranslations } from "next-intl";
import { usePartnerMetrics } from "@/hooks/queries";
import { Card } from "@/components/ui/card";
import { CardSkeleton, EmptyState, ErrorState } from "@/components/ui/states";

export function PartnerView() {
  const t = useTranslations("partner");
  const c = useTranslations("common");
  const { data, isLoading, isError, refetch } = usePartnerMetrics();

  if (isLoading) return <CardSkeleton rows={3} />;
  if (isError) return <ErrorState title={c("loadError")} onRetry={() => refetch()} retryLabel={c("retry")} />;
  if (!data || data.cards.length === 0)
    return <EmptyState title={t("empty")} body={t("body")} />;

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-fg-muted">{t("body")}</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.cards.map((card) => (
          <Card key={card.key} className="flex flex-col gap-1">
            <span className="u-label">{card.label}</span>
            <span className="u-data text-2xl font-semibold">{card.value}</span>
            {card.hint ? <span className="text-xs text-fg-muted">{card.hint}</span> : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
