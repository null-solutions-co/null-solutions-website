"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  useAddDocument,
  useAddMilestone,
  useAdvanceGate,
  useDocuments,
  useInvoices,
  useIssueInvoice,
  useProject,
  useProjectGates,
  useProjectMilestones,
  useProjectSummary,
  useRecordPayment,
  useSetMilestone,
  useSetProgress,
} from "@/hooks/queries";
import { z } from "zod";
import { documentType, gateId, issuedAccessCode, milestoneStatus, newInvoice, newMilestone, newPayment, type IssuedAccessCode, type MilestoneStatus } from "@/lib/api/schemas";
import { GateStepper } from "@/components/brand/GateStepper";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/field";
import { StatusBadge } from "@/components/ui/status-badge";
import { CardSkeleton, ErrorState } from "@/components/ui/states";
import { formatBytes, formatDate, formatMoney } from "@/lib/format";
import { AdminForm, Section, useFields } from "./bits";
import { IssuedCode, ProjectAccessSection } from "./AccessCode";
import { NEW_CODE_KEY } from "./AdminClientView";

const DOC_TYPES = ["proposal", "contract", "deliverable", "report", "invoice", "other"] as const;

/** The upload form: a file is required; the display name defaults to the file's own. */
const uploadFields = z.object({
  hasFile: z.literal(true),
  name: z.string().trim().max(200),
  type: documentType,
});
const METHODS = ["bank_transfer", "cliq", "cash", "other"] as const;

/**
 * What the client sees, in one place: the progress percentage (set by hand,
 * 0–100) and where their payments stand. Each payment is an invoice below;
 * marking it paid updates the client's count straight away.
 */
function ClientPage({ projectId }: { projectId: string }) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const summary = useProjectSummary(projectId);
  const save = useSetProgress(projectId);
  const [draft, setDraft] = useState<number | null>(null);
  const current = summary.data?.percentComplete ?? 0;
  const value = draft ?? current;
  const pay = summary.data?.payments;

  return (
    <Section title={t("clientPage")}>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm font-medium">{t("progressLabel")}</p>
            <p className="font-mono text-3xl font-semibold tabular-nums" dir="ltr">
              {value}%
            </p>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={value}
            aria-label={t("progressLabel")}
            onChange={(e) => setDraft(Number(e.target.value))}
            className="w-full accent-[#0a0a0a]"
          />
          <div className="flex items-center gap-3">
            <Input
              type="number"
              min={0}
              max={100}
              inputMode="numeric"
              dir="ltr"
              aria-label={t("progressLabel")}
              value={value}
              onChange={(e) => setDraft(Math.max(0, Math.min(100, Math.round(Number(e.target.value) || 0))))}
              className="w-24"
            />
            <Button
              size="sm"
              disabled={draft === null || draft === current || save.isPending}
              onClick={() => save.mutate(value, { onSuccess: () => setDraft(null) })}
            >
              {save.isPending ? t("saving") : t("saveProgress")}
            </Button>
            {save.isSuccess && draft === null ? <span className="text-xs text-ok">{t("saved")}</span> : null}
          </div>
          <p className="text-xs text-fg-muted">{t("progressHint")}</p>
        </Card>

        <Card className="flex flex-col gap-3">
          <p className="text-sm font-medium">{t("paymentsLabel")}</p>
          {pay && pay.total > 0 ? (
            <>
              <p className="text-2xl font-semibold">
                {t("paymentsMade", { paid: pay.paid, total: pay.total })}
              </p>
              <div className="flex gap-1" aria-hidden="true">
                {Array.from({ length: pay.total }, (_, i) => (
                  <span key={i} className={`h-1.5 flex-1 rounded-full ${i < pay.paid ? "bg-fg" : "bg-line"}`} />
                ))}
              </div>
              <p className="text-sm">
                {t("paymentsLeft")}: <span className="u-data">{formatMoney(pay.remaining, locale)}</span>
                {pay.nextDue ? <span className="text-fg-muted"> · {t("nextDue", { date: formatDate(pay.nextDue, locale) })}</span> : null}
              </p>
            </>
          ) : (
            <p className="text-sm text-fg-muted">{t("noPaymentsYet")}</p>
          )}
          <p className="text-xs text-fg-muted">{t("paymentsHint")}</p>
        </Card>
      </div>
    </Section>
  );
}

/** The code handed over when the project was just created: shown once, then gone. */
function NewCode({ projectId, projectName }: { projectId: string; projectName: string }) {
  const t = useTranslations("admin");
  const [issued, setIssued] = useState<IssuedAccessCode | null>(null);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(NEW_CODE_KEY(projectId));
      if (!raw) return;
      sessionStorage.removeItem(NEW_CODE_KEY(projectId));
      const parsed = issuedAccessCode.safeParse(JSON.parse(raw));
      if (parsed.success) queueMicrotask(() => setIssued(parsed.data));
    } catch {
      /* storage blocked: nothing to show */
    }
  }, [projectId]);
  if (!issued) return null;
  return (
    <Section title={t("newCodeTitle")}>
      <IssuedCode issued={issued} projectName={projectName} />
    </Section>
  );
}

function Gates({ projectId }: { projectId: string }) {
  const t = useTranslations("admin");
  const gates = useProjectGates(projectId);
  const advance = useAdvanceGate(projectId);
  const next = gates.data?.find((g) => g.status !== "done");
  return (
    <Section
      title={t("gates")}
      action={
        <Button size="sm" disabled={!next || advance.isPending} onClick={() => advance.mutate()}>
          {next ? t("advance", { gate: `${next.id} · ${next.title}` }) : t("allDone")}
        </Button>
      }
    >
      <Card>{gates.data ? <GateStepper gates={gates.data} /> : <CardSkeleton rows={1} />}</Card>
    </Section>
  );
}

function Milestones({ projectId }: { projectId: string }) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const list = useProjectMilestones(projectId);
  const add = useAddMilestone(projectId);
  const setStatus = useSetMilestone();
  const [adding, setAdding] = useState(false);
  const { values, set, reset } = useFields({ title: "", gate: "G4", dueDate: "" });

  return (
    <Section title={t("milestones")} action={adding ? null : <Button size="sm" variant="secondary" onClick={() => setAdding(true)}>+ {t("addMilestone")}</Button>}>
      {adding ? (
        <AdminForm
          schema={newMilestone}
          values={{ ...values, dueDate: values.dueDate || undefined }}
          onSubmit={async (data) => {
            await add.mutateAsync(data);
            reset();
            setAdding(false);
          }}
          submitLabel={t("create")}
          busyLabel={t("creating")}
          errorLabel={t("failed")}
          onCancel={() => setAdding(false)}
          cancelLabel={t("cancel")}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t("milestoneTitle")} htmlFor="m-title" required>
              <Input id="m-title" value={values.title} onChange={set("title")} />
            </Field>
            <Field label={t("gate")} htmlFor="m-gate">
              <Select id="m-gate" value={values.gate} onChange={set("gate")}>
                {gateId.options.map((g) => <option key={g} value={g}>{g}</option>)}
              </Select>
            </Field>
            <Field label={t("dueDate")} htmlFor="m-due">
              <Input id="m-due" type="date" value={values.dueDate} onChange={set("dueDate")} />
            </Field>
          </div>
        </AdminForm>
      ) : null}
      {list.data && list.data.length === 0 ? <p className="text-sm text-fg-muted">{t("noneYet")}</p> : null}
      <Card className={list.data?.length ? "p-0" : "hidden"}>
        <ul>
          {(list.data ?? []).map((m) => (
            <li key={m.id} className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3 text-sm last:border-0">
              <span className="u-data w-8 text-xs text-fg-muted">{m.gate}</span>
              <span className="min-w-0 flex-1 font-medium">{m.title}</span>
              <span className="text-xs text-fg-muted">{formatDate(m.dueDate, locale)}</span>
              <Select
                aria-label={m.title}
                className="min-h-9 w-auto py-1 text-xs"
                value={m.status}
                onChange={(e) => setStatus.mutate({ id: m.id, status: e.target.value as MilestoneStatus })}
              >
                {milestoneStatus.options.map((s) => <option key={s} value={s}>{t(`milestoneStatus.${s}`)}</option>)}
              </Select>
            </li>
          ))}
        </ul>
      </Card>
    </Section>
  );
}

function PaymentForm({ invoiceId, onDone }: { invoiceId: string; onDone: () => void }) {
  const t = useTranslations("admin");
  const pay = useRecordPayment();
  const { values, set } = useFields({ amount: "", method: "cliq", reference: "" });
  return (
    <AdminForm
      schema={newPayment}
      values={{ ...values, reference: values.reference || undefined }}
      onSubmit={async (body) => {
        await pay.mutateAsync({ invoiceId, body });
        onDone();
      }}
      submitLabel={t("recordPayment")}
      busyLabel={t("creating")}
      errorLabel={t("failed")}
      onCancel={onDone}
      cancelLabel={t("cancel")}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label={t("amount")} htmlFor={`pay-amt-${invoiceId}`} required>
          <Input id={`pay-amt-${invoiceId}`} inputMode="decimal" dir="ltr" value={values.amount} onChange={set("amount")} />
        </Field>
        <Field label={t("method")} htmlFor={`pay-m-${invoiceId}`}>
          <Select id={`pay-m-${invoiceId}`} value={values.method} onChange={set("method")}>
            {METHODS.map((m) => <option key={m} value={m}>{t(`methods.${m}`)}</option>)}
          </Select>
        </Field>
        <Field label={t("reference")} htmlFor={`pay-r-${invoiceId}`}>
          <Input id={`pay-r-${invoiceId}`} dir="ltr" value={values.reference} onChange={set("reference")} />
        </Field>
      </div>
    </AdminForm>
  );
}

function Invoices({ projectId }: { projectId: string }) {
  const t = useTranslations("admin");
  const st = useTranslations("status");
  const locale = useLocale();
  const list = useInvoices({ projectId });
  const issue = useIssueInvoice(projectId);
  const [adding, setAdding] = useState(false);
  const [paying, setPaying] = useState<string | null>(null);
  const { values, set, reset } = useFields({ description: "", amount: "", dueDate: "" });

  return (
    <Section title={t("paymentsTitle")} action={adding ? null : <Button size="sm" variant="secondary" onClick={() => setAdding(true)}>+ {t("addPayment")}</Button>}>
      {adding ? (
        <AdminForm
          schema={newInvoice}
          values={values}
          onSubmit={async (data) => {
            await issue.mutateAsync(data);
            reset();
            setAdding(false);
          }}
          submitLabel={t("issueInvoice")}
          busyLabel={t("creating")}
          errorLabel={t("failed")}
          onCancel={() => setAdding(false)}
          cancelLabel={t("cancel")}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t("invoiceFor")} htmlFor="i-desc" required>
              <Input id="i-desc" value={values.description} onChange={set("description")} />
            </Field>
            <Field label={t("amount")} htmlFor="i-amt" required>
              <Input id="i-amt" inputMode="decimal" dir="ltr" value={values.amount} onChange={set("amount")} />
            </Field>
            <Field label={t("dueDate")} htmlFor="i-due" required>
              <Input id="i-due" type="date" value={values.dueDate} onChange={set("dueDate")} />
            </Field>
          </div>
        </AdminForm>
      ) : null}
      {list.data && list.data.items.length === 0 ? <p className="text-sm text-fg-muted">{t("noneYet")}</p> : null}
      <div className="flex flex-col gap-3">
        {(list.data?.items ?? []).map((inv) => (
          <Card key={inv.id} className="flex flex-col gap-3 p-4">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="u-data">{inv.number}</span>
              <StatusBadge tone={inv.status === "paid" ? "ok" : inv.status === "overdue" ? "danger" : "neutral"}>{st(`invoice.${inv.status}`)}</StatusBadge>
              <span className="ms-auto">{formatMoney(inv.total, locale)}</span>
              <span className="text-fg-muted">{t("due")}: {formatMoney(inv.amountDue, locale)}</span>
              {inv.status !== "paid" && paying !== inv.id ? (
                <Button size="sm" variant="ghost" onClick={() => setPaying(inv.id)}>
                  {t("recordPayment")}
                </Button>
              ) : null}
            </div>
            {paying === inv.id ? <PaymentForm invoiceId={inv.id} onDone={() => setPaying(null)} /> : null}
          </Card>
        ))}
      </div>
    </Section>
  );
}

function Documents({ projectId }: { projectId: string }) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const list = useDocuments({ projectId });
  const add = useAddDocument(projectId);
  const [adding, setAdding] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { values, set, reset } = useFields({ name: "", type: "deliverable" });

  return (
    <Section title={t("documents")} action={adding ? null : <Button size="sm" variant="secondary" onClick={() => setAdding(true)}>+ {t("addDocument")}</Button>}>
      {adding ? (
        <AdminForm
          schema={uploadFields}
          values={{ ...values, hasFile: !!file }}
          onSubmit={async (data) => {
            const form = new FormData();
            form.append("file", file!);
            form.append("type", data.type);
            if (data.name) form.append("name", data.name);
            await add.mutateAsync(form);
            reset();
            setFile(null);
            setAdding(false);
          }}
          submitLabel={t("addDocument")}
          busyLabel={t("creating")}
          errorLabel={t("failed")}
          onCancel={() => setAdding(false)}
          cancelLabel={t("cancel")}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t("chooseFile")} htmlFor="d-file" required hint={t("fileLimit")}>
              <Input id="d-file" type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </Field>
            <Field label={t("fileName")} htmlFor="d-name" hint={t("fileNameHint")}>
              <Input id="d-name" value={values.name} onChange={set("name")} />
            </Field>
            <Field label={t("fileType")} htmlFor="d-type">
              <Select id="d-type" value={values.type} onChange={set("type")}>
                {DOC_TYPES.map((d) => <option key={d} value={d}>{t(`types.${d}`)}</option>)}
              </Select>
            </Field>
          </div>
        </AdminForm>
      ) : null}
      {list.data && list.data.items.length === 0 ? <p className="text-sm text-fg-muted">{t("noneYet")}</p> : null}
      <Card className={list.data?.items.length ? "p-0" : "hidden"}>
        <ul>
          {(list.data?.items ?? []).map((d) => (
            <li key={d.id} className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3 text-sm last:border-0">
              <span className="min-w-0 flex-1 font-medium">{d.name}</span>
              <span className="text-xs text-fg-muted">{t(`types.${d.type}`)}</span>
              <span className="u-data text-xs text-fg-muted">{formatBytes(d.sizeBytes)}</span>
              <span className="text-xs text-fg-muted">{formatDate(d.uploadedAt, locale)}</span>
            </li>
          ))}
        </ul>
      </Card>
    </Section>
  );
}

export function AdminProjectView({ id }: { id: string }) {
  const t = useTranslations("admin");
  const c = useTranslations("common");
  const { data: p, isLoading, isError, refetch } = useProject(id);

  if (isLoading) return <CardSkeleton rows={6} />;
  if (isError || !p) return <ErrorState title={c("loadError")} onRetry={() => refetch()} retryLabel={c("retry")} />;

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href={`/admin/clients/${p.clientId}`} className="font-mono text-xs text-fg-muted underline-offset-4 hover:underline">
            ← {t("projects")}
          </Link>
          <h1 className="mt-3 text-2xl font-semibold">{p.name}</h1>
          <p className="mt-1 text-sm text-fg-muted">
            {t("code")}: <span className="u-data text-fg">{p.code}</span> · {p.serviceLine.code} ·{" "}
            {t("progress", { percent: p.percentComplete, gate: p.currentGate })}
          </p>
        </div>
        <Button asChild size="sm" variant="secondary">
          <Link href={`/projects/${p.id}`}>{t("clientView")} <span className="inline-block rtl:rotate-180">→</span></Link>
        </Button>
      </div>
      <NewCode projectId={p.id} projectName={p.name} />
      <ClientPage projectId={p.id} />
      <Invoices projectId={p.id} />
      <ProjectAccessSection projectId={p.id} projectName={p.name} />
      <Gates projectId={p.id} />
      <Milestones projectId={p.id} />
      <Documents projectId={p.id} />
    </div>
  );
}
