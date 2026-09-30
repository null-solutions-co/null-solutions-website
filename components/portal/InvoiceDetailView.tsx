"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useInvoice } from "@/hooks/queries";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, invoiceTone } from "@/components/ui/status-badge";
import { CardSkeleton, ErrorState } from "@/components/ui/states";
import { formatMoney } from "@/lib/format";

export function InvoiceDetailView({ id }: { id: string }) {
  const t = useTranslations("invoices");
  const st = useTranslations("status");
  const c = useTranslations("common");
  const locale = useLocale();
  const { data, isLoading, isError, refetch } = useInvoice(id);

  if (isLoading) return <CardSkeleton rows={6} />;
  if (isError || !data)
    return <ErrorState title={c("loadError")} onRetry={() => refetch()} retryLabel={c("retry")} />;

  const inv = data;
  const bank = inv.paymentInstructions.bankTransfer;
  const cliq = inv.paymentInstructions.cliq;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/invoices" className="self-start font-mono text-sm text-fg-muted hover:text-fg">
        ← {t("back")}
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold">{t("detailTitle", { number: inv.number })}</h1>
        <StatusBadge tone={invoiceTone(inv.status)}>{st(`invoice.${inv.status}`)}</StatusBadge>
        <Button variant="secondary" size="sm" asChild>
          <a href={`/api/proxy/invoices/${inv.id}/pdf`}>{t("downloadPdf")}</a>
        </Button>
      </div>

      {/* phones: the same figures as a list, so nothing scrolls sideways */}
      <Card className="flex flex-col gap-4 sm:hidden">
        <p className="u-label">{t("lineItems")}</p>
        <ul className="flex flex-col gap-3">
          {inv.lineItems.map((li) => (
            <li key={li.id} className="flex flex-col gap-1 border-b border-line pb-3 text-sm">
              <span>{li.description}</span>
              <span className="flex justify-between text-fg-muted">
                <span className="u-data">
                  {li.quantity} × {formatMoney(li.unitPrice, locale)}
                </span>
                <span className="u-data text-fg">{formatMoney(li.total, locale)}</span>
              </span>
            </li>
          ))}
        </ul>
        <dl className="flex flex-col gap-2 text-sm">
          {[
            [t("subtotal"), inv.subtotal, false],
            ...(inv.tax ? [[t("tax"), inv.tax, false] as const] : []),
            [t("total"), inv.total, true],
            [t("paid"), inv.amountPaid, false],
            [t("balance"), inv.amountDue, true],
          ].map(([label, money, strong]) => (
            <div key={String(label)} className={`flex justify-between ${strong ? "font-semibold" : "text-fg-muted"}`}>
              <dt>{String(label)}</dt>
              <dd className="u-data text-fg">{formatMoney(money as typeof inv.total, locale)}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card className="overflow-x-auto p-0 max-sm:hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="[&>th]:border-b [&>th]:border-line [&>th]:px-6 [&>th]:py-3 [&>th]:text-start [&>th]:font-mono [&>th]:text-xs [&>th]:uppercase [&>th]:tracking-wider [&>th]:text-fg-muted">
              <th>{t("lineItems")}</th>
              <th className="text-end">{t("qty")}</th>
              <th className="text-end">{t("unit")}</th>
              <th className="text-end">{t("total")}</th>
            </tr>
          </thead>
          <tbody>
            {inv.lineItems.map((li) => (
              <tr key={li.id} className="[&>td]:border-b [&>td]:border-line [&>td]:px-6 [&>td]:py-3">
                <td>{li.description}</td>
                <td className="u-data text-end">{li.quantity}</td>
                <td className="u-data text-end">{formatMoney(li.unitPrice, locale)}</td>
                <td className="u-data text-end">{formatMoney(li.total, locale)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="[&>tr>td]:px-6 [&>tr>td]:py-2">
            <tr>
              <td colSpan={3} className="text-end text-fg-muted">{t("subtotal")}</td>
              <td className="u-data text-end">{formatMoney(inv.subtotal, locale)}</td>
            </tr>
            {inv.tax ? (
              <tr>
                <td colSpan={3} className="text-end text-fg-muted">{t("tax")}</td>
                <td className="u-data text-end">{formatMoney(inv.tax, locale)}</td>
              </tr>
            ) : null}
            <tr className="[&>td]:pt-3 [&>td]:font-semibold">
              <td colSpan={3} className="text-end">{t("total")}</td>
              <td className="u-data text-end">{formatMoney(inv.total, locale)}</td>
            </tr>
            <tr>
              <td colSpan={3} className="text-end text-fg-muted">{t("paid")}</td>
              <td className="u-data text-end">{formatMoney(inv.amountPaid, locale)}</td>
            </tr>
            <tr className="[&>td]:font-semibold">
              <td colSpan={3} className="text-end">{t("balance")}</td>
              <td className="u-data text-end">{formatMoney(inv.amountDue, locale)}</td>
            </tr>
          </tfoot>
        </table>
      </Card>

      <Card className="flex flex-col gap-3">
        <p className="u-label">{t("howToPay")}</p>
        <p className="text-sm text-fg-muted">{t("noOnlinePayment")}</p>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          {bank ? (
            <div>
              <dt className="u-label">{t("bankTransfer")}</dt>
              <dd className="u-data">{bank.bankName} · {bank.iban}</dd>
            </div>
          ) : null}
          {cliq ? (
            <div>
              <dt className="u-label">{t("cliq")}</dt>
              <dd className="u-data">{cliq.alias}</dd>
            </div>
          ) : null}
        </dl>
      </Card>
    </div>
  );
}
