"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useInvoices } from "@/hooks/queries";
import { Card } from "@/components/ui/card";
import { StatusBadge, invoiceTone } from "@/components/ui/status-badge";
import { CardSkeleton, EmptyState, ErrorState } from "@/components/ui/states";
import { formatDate, formatMoney } from "@/lib/format";

export function InvoicesView() {
  const t = useTranslations("invoices");
  const st = useTranslations("status");
  const c = useTranslations("common");
  const locale = useLocale();
  const { data, isLoading, isError, refetch } = useInvoices();

  if (isLoading) return <CardSkeleton rows={4} />;
  if (isError) return <ErrorState title={c("loadError")} onRetry={() => refetch()} retryLabel={c("retry")} />;
  if (!data || data.items.length === 0)
    return <EmptyState title={t("empty")} body={t("emptyBody")} />;

  return (
    <Card className="overflow-x-auto p-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="[&>th]:border-b [&>th]:border-line [&>th]:px-4 [&>th]:py-3 sm:[&>th]:px-6 [&>th]:text-start [&>th]:font-mono [&>th]:text-xs [&>th]:uppercase [&>th]:tracking-wider [&>th]:text-fg-muted">
            <th>{t("number")}</th>
            <th className="max-sm:hidden">{t("issued")}</th>
            <th className="max-md:hidden">{t("due")}</th>
            <th>{t("status")}</th>
            <th className="text-end">{t("amount")}</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((inv) => (
            <tr key={inv.id} className="[&>td]:border-b [&>td]:border-line [&>td]:px-4 [&>td]:py-3 sm:[&>td]:px-6 last:[&>td]:border-0">
              <td>
                <Link href={`/invoices/${inv.id}`} className="u-data hover:underline">
                  {inv.number}
                </Link>
              </td>
              <td className="text-fg-muted max-sm:hidden">{formatDate(inv.issueDate, locale)}</td>
              <td className="text-fg-muted max-md:hidden">{formatDate(inv.dueDate, locale)}</td>
              <td>
                <StatusBadge tone={invoiceTone(inv.status)}>{st(`invoice.${inv.status}`)}</StatusBadge>
              </td>
              <td className="u-data text-end">{formatMoney(inv.amountDue, locale)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
