"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useMyProjects, useProjectSummary } from "@/hooks/queries";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardSkeleton, EmptyState, ErrorState } from "@/components/ui/states";
import { RadialProgress } from "./RadialProgress";
import { GateStepper, type GateNode } from "@/components/brand/GateStepper";
import { formatDate, formatMoney } from "@/lib/format";
import { COMPANY } from "@/lib/company";

const GATE_IDS = ["G0", "G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9"] as const;

export function DashboardView() {
  const t = useTranslations("dashboard");
  const c = useTranslations("common");
  const locale = useLocale();

  const projects = useMyProjects();
  const projectId = projects.data?.[0]?.id;
  const summary = useProjectSummary(projectId ?? "");

  if (projects.isLoading) return <CardSkeleton rows={4} />;
  if (projects.isError)
    return <ErrorState title={c("loadError")} onRetry={() => projects.refetch()} retryLabel={c("retry")} />;
  if (!projectId)
    return <EmptyState title={t("noProject")} body={t("noProjectBody")} />;

  if (summary.isLoading) return <CardSkeleton rows={4} />;
  if (summary.isError || !summary.data)
    return <ErrorState title={c("loadError")} onRetry={() => summary.refetch()} retryLabel={c("retry")} />;

  const s = summary.data;
  const currentIndex = GATE_IDS.indexOf(s.currentGate);
  const gates: GateNode[] = GATE_IDS.map((id, i) => ({
    id,
    status: i < currentIndex ? "done" : i === currentIndex ? "in_progress" : "not_started",
  }));

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <RadialProgress value={s.percentComplete} label={t("title")} />
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-lg font-semibold">{s.name}</h1>
            <span className="u-data text-xs text-fg-muted">{s.code}</span>
          </div>
          <p className="text-sm text-fg-muted">
            {t("onTrack")}
            {s.estimatedCompletionDate ? <> — {t("estCompletion", { date: formatDate(s.estimatedCompletionDate, locale) })}</> : null} ·{" "}
            {t("gatesDone", { done: s.gatesDone, total: s.gatesTotal })}
          </p>
          {s.nextGate ? (
            <p className="u-data text-sm">{t("nextGate", { gate: s.nextGate })}</p>
          ) : null}
          {s.outstandingBalance ? (
            <p className="text-sm">
              <span className="u-label">{t("outstanding")}</span>{" "}
              <span className="u-data">{formatMoney(s.outstandingBalance, locale)}</span>
            </p>
          ) : null}
          <div className="pt-1">
            <Button variant="secondary" size="sm" asChild>
              <Link href={`/projects/${projectId}`}>{t("openProject")}</Link>
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <GateStepper gates={gates} className="max-w-2xl" />
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* where the payments stand */}
        <Card className="flex flex-col gap-3">
          <p className="u-label">{t("paymentsTitle")}</p>
          {s.payments && s.payments.total > 0 ? (
            <>
              <p className="text-2xl font-semibold">{t("paymentsMade", { paid: s.payments.paid, total: s.payments.total })}</p>
              <div className="flex gap-1" aria-hidden="true">
                {Array.from({ length: s.payments.total }, (_, i) => (
                  <span key={i} className={`h-1.5 flex-1 rounded-full ${i < s.payments!.paid ? "bg-fg" : "bg-line"}`} />
                ))}
              </div>
              <p className="text-sm">
                {t("paymentsLeft")}: <span className="u-data">{formatMoney(s.payments.remaining, locale)}</span>
              </p>
              {s.payments.nextDue ? (
                <p className="text-sm text-fg-muted">{t("nextDue", { date: formatDate(s.payments.nextDue, locale) })}</p>
              ) : null}
              <div className="pt-1">
                <Button variant="secondary" size="sm" asChild>
                  <Link href="/invoices">{t("seeInvoices")}</Link>
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-fg-muted">{t("noPayments")}</p>
          )}
        </Card>

        {/* two ways to reach NULL */}
        <Card className="flex flex-col gap-3">
          <p className="u-label">{t("contactTitle")}</p>
          <p className="text-sm text-fg-muted">{t("contactBody")}</p>
          <div className="mt-1 flex flex-col gap-2 sm:flex-row">
            <Button size="sm" asChild>
              <Link href={`/projects/${projectId}?tab=requests`}>{t("contactPortal")}</Link>
            </Button>
            <Button variant="secondary" size="sm" asChild>
              <a href={`mailto:${COMPANY.email}?subject=${encodeURIComponent(`${s.code} · ${s.name}`)}`}>
                {t("contactEmail")} <span dir="ltr" className="u-data text-xs">{COMPANY.email}</span>
              </a>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
