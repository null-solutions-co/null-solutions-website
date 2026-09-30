"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  useProject,
  useProjectGates,
  useProjectMilestones,
} from "@/hooks/queries";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { CardSkeleton, ErrorState } from "@/components/ui/states";
import { GateStepper, type GateNode } from "@/components/brand/GateStepper";
import { RequestsPanel } from "./RequestsPanel";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ProjectView({ id }: { id: string }) {
  const t = useTranslations("project");
  const st = useTranslations("status");
  const c = useTranslations("common");
  const locale = useLocale();
  // `?tab=requests` opens straight on requests (the dashboard's "send us a message")
  const params = useSearchParams();
  const [tab, setTab] = useState<"overview" | "requests">(params.get("tab") === "requests" ? "requests" : "overview");

  const project = useProject(id);
  const gates = useProjectGates(id);
  const milestones = useProjectMilestones(id);

  if (project.isLoading) return <CardSkeleton rows={5} />;
  if (project.isError || !project.data)
    return <ErrorState title={c("loadError")} onRetry={() => project.refetch()} retryLabel={c("retry")} />;

  const p = project.data;
  const gateNodes: GateNode[] = (gates.data ?? []).map((g) => ({
    id: g.id,
    status: g.status,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold">{p.name}</h1>
        <span className="u-data text-xs text-fg-muted">{p.code}</span>
        <StatusBadge tone="warn">{p.currentGate}</StatusBadge>
      </div>

      <div role="tablist" className="flex gap-1 border-b border-line">
          {(["overview", "requests"] as const).map((x) => (
            <button
              key={x}
              role="tab"
              aria-selected={tab === x}
              onClick={() => setTab(x)}
              className={cn(
                "-mb-px border-b-2 px-3 py-2 font-mono text-sm transition-colors",
                tab === x
                  ? "border-signal text-fg"
                  : "border-transparent text-fg-muted hover:text-fg",
              )}
            >
              {t(`tabs.${x}`)}
            </button>
          ))}
        </div>

      {tab === "overview" ? (
        <>
          <Card>
            <p className="u-label mb-4">{t("gatesTitle")}</p>
            {gates.isLoading ? (
              <CardSkeleton rows={1} />
            ) : (
              <GateStepper gates={gateNodes} className="max-w-2xl" />
            )}
          </Card>

          <Card>
            <p className="u-label mb-4">{t("milestonesTitle")}</p>
            {milestones.isLoading ? (
              <CardSkeleton rows={3} />
            ) : !milestones.data || milestones.data.length === 0 ? (
              <p className="text-sm text-fg-muted">{t("milestoneEmpty")}</p>
            ) : (
              <ul className="flex flex-col">
                {milestones.data.map((m) => (
                  <li
                    key={m.id}
                    className="flex flex-wrap items-center justify-between gap-2 border-b border-line py-3 last:border-0"
                  >
                    <span className="flex items-center gap-3">
                      {m.gate ? (
                        <span className="u-data text-xs text-fg-muted">{m.gate}</span>
                      ) : null}
                      <span className="text-sm">{m.title}</span>
                    </span>
                    <StatusBadge
                      tone={
                        m.status === "done"
                          ? "ok"
                          : m.status === "blocked"
                            ? "danger"
                            : m.status === "in_progress"
                              ? "warn"
                              : "neutral"
                      }
                    >
                      {st(`milestone.${m.status}`)}
                    </StatusBadge>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="grid gap-3 sm:grid-cols-2">
            <Meta label={t("serviceLine")} value={`${p.serviceLine.code} — ${p.serviceLine.name}`} />
            <Meta label={t("started")} value={formatDate(p.startedAt, locale)} />
            <Meta label={t("target")} value={formatDate(p.targetDate, locale)} />
            <Meta label={t("estCompletion")} value={formatDate(p.estimatedCompletionDate, locale)} />
          </Card>
        </>
      ) : (
        <RequestsPanel projectId={id} />
      )}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="u-label">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}
