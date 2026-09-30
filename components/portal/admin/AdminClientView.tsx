"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useAdminClient, useCreateProject, useIssueAccessCode } from "@/hooks/queries";
import { newProject, type IssuedAccessCode } from "@/lib/api/schemas";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { StatusBadge } from "@/components/ui/status-badge";
import { CardSkeleton, EmptyState, ErrorState } from "@/components/ui/states";
import { AdminForm, Section, useFields } from "./bits";
import { IssuedCode } from "./AccessCode";
import { SERVICE_CODES } from "@/lib/services";

const LINES = SERVICE_CODES;

type Created = { name: string; issued: IssuedAccessCode | null };

/** Where the one-time code waits for the project page to show it (this tab only, read once). */
export const NEW_CODE_KEY = (projectId: string) => `ns-new-code:${projectId}`;

/**
 * New project → its access code comes back in the same response; we go
 * straight to the project's own page, which shows the code once at the top
 * with the progress and payment controls under it.
 */
function ProjectForm({ clientId, onDone }: { clientId: string; onDone: (created?: Created) => void }) {
  const t = useTranslations("admin");
  const s = useTranslations("services");
  const router = useRouter();
  const create = useCreateProject();
  const issue = useIssueAccessCode();
  const { values, set } = useFields({ clientId, name: "", serviceLineCode: "S1", targetDate: "", description: "" });
  return (
    <AdminForm
      schema={newProject}
      values={{ ...values, targetDate: values.targetDate || undefined, description: values.description || undefined }}
      onSubmit={async (data) => {
        const project = await create.mutateAsync(data);
        const issued = project.access ?? (await issue.mutateAsync(project.id).catch(() => null));
        if (!issued) {
          onDone({ name: project.name, issued: null });
          return;
        }
        try {
          sessionStorage.setItem(NEW_CODE_KEY(project.id), JSON.stringify(issued));
          router.push(`/admin/projects/${project.id}`);
        } catch {
          // storage blocked: show the code right here instead
          onDone({ name: project.name, issued });
        }
      }}
      submitLabel={t("create")}
      busyLabel={t("creating")}
      errorLabel={t("failed")}
      onCancel={() => onDone()}
      cancelLabel={t("cancel")}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label={t("projectName")} htmlFor="p-name" required>
          <Input id="p-name" value={values.name} onChange={set("name")} />
        </Field>
        <Field label={t("serviceLine")} htmlFor="p-line" required>
          <Select id="p-line" value={values.serviceLineCode} onChange={set("serviceLineCode")}>
            {LINES.map((code) => (
              <option key={code} value={code}>
                {code} · {s(`items.${code}.name`)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("targetDate")} htmlFor="p-date">
          <Input id="p-date" type="date" value={values.targetDate} onChange={set("targetDate")} />
        </Field>
      </div>
      <Field label={t("description")} htmlFor="p-desc">
        <Textarea id="p-desc" value={values.description} onChange={set("description")} />
      </Field>
    </AdminForm>
  );
}

export function AdminClientView({ id }: { id: string }) {
  const t = useTranslations("admin");
  const st = useTranslations("status");
  const c = useTranslations("common");
  const { data, isLoading, isError, refetch } = useAdminClient(id);
  const [adding, setAdding] = useState(false);
  const [created, setCreated] = useState<Created | null>(null);

  if (isLoading) return <CardSkeleton rows={6} />;
  if (isError || !data) return <ErrorState title={c("loadError")} onRetry={() => refetch()} retryLabel={c("retry")} />;

  const { client, projects } = data;

  return (
    <div className="flex flex-col gap-10">
      <div>
        <Link href="/admin" className="font-mono text-xs text-fg-muted underline-offset-4 hover:underline">
          ← {t("back")}
        </Link>
        <h1 className="mt-3 text-2xl font-semibold">{client.name}</h1>
        <p className="mt-1 text-sm text-fg-muted" dir="ltr">
          {client.contactEmail}
          {client.contactPhone ? ` · ${client.contactPhone}` : ""}
        </p>
      </div>

      <Section
        title={t("projects")}
        action={
          adding ? null : (
            <Button size="sm" onClick={() => { setCreated(null); setAdding(true); }}>
              + {t("newProject")}
            </Button>
          )
        }
      >
        {created?.issued ? <IssuedCode issued={created.issued} projectName={created.name} /> : null}
        {created && !created.issued ? <p role="alert" className="text-sm text-danger">{t("codeFailed")}</p> : null}
        {adding ? (
          <ProjectForm
            clientId={client.id}
            onDone={(c) => {
              setAdding(false);
              if (c) setCreated(c);
            }}
          />
        ) : null}
        {projects.length === 0 ? (
          <EmptyState title={t("noProjects")} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {projects.map((p) => (
              <Card key={p.id} className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="u-data text-xs text-fg-muted">
                      {p.code} · {p.serviceLine.code}
                    </p>
                  </div>
                  <StatusBadge tone={p.status === "delivered" ? "ok" : "neutral"}>{st(`project.${p.status}`)}</StatusBadge>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-line">
                  <div className="h-full rounded-full bg-fg" style={{ width: `${p.percentComplete}%` }} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-fg-muted">{t("progress", { percent: p.percentComplete, gate: p.currentGate })}</span>
                  <Link href={`/admin/projects/${p.id}`} className="font-mono text-xs underline-offset-4 hover:underline">
                    {t("manage")} <span className="inline-block rtl:rotate-180">→</span>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
