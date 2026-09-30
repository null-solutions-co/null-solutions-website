"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAdminClients, useCreateClient } from "@/hooks/queries";
import { newClient } from "@/lib/api/schemas";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { StatusBadge } from "@/components/ui/status-badge";
import { CardSkeleton, EmptyState, ErrorState } from "@/components/ui/states";
import { AdminForm, Section, useFields } from "./admin/bits";
import { SERVICE_CODES } from "@/lib/services";

const LINES = SERVICE_CODES;

function NewClientForm({ onDone }: { onDone: () => void }) {
  const t = useTranslations("admin");
  const create = useCreateClient();
  const { values, setValues, set } = useFields({ name: "", contactEmail: "", contactPhone: "", serviceLineCodes: [] as string[] });

  const toggle = (code: string) =>
    setValues((v) => ({
      ...v,
      serviceLineCodes: v.serviceLineCodes.includes(code)
        ? v.serviceLineCodes.filter((c) => c !== code)
        : [...v.serviceLineCodes, code],
    }));

  return (
    <AdminForm
      schema={newClient}
      values={values}
      onSubmit={async (data) => {
        await create.mutateAsync(data);
        onDone();
      }}
      submitLabel={t("create")}
      busyLabel={t("creating")}
      errorLabel={t("failed")}
      onCancel={onDone}
      cancelLabel={t("cancel")}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label={t("clientName")} htmlFor="c-name" required>
          <Input id="c-name" value={values.name} onChange={set("name")} />
        </Field>
        <Field label={t("email")} htmlFor="c-email" required>
          <Input id="c-email" type="email" dir="ltr" value={values.contactEmail} onChange={set("contactEmail")} />
        </Field>
        <Field label={t("phone")} htmlFor="c-phone">
          <Input id="c-phone" dir="ltr" value={values.contactPhone} onChange={set("contactPhone")} />
        </Field>
      </div>
      <fieldset className="flex flex-col gap-2">
        <legend className="u-label">{t("lines")}</legend>
        <div className="flex flex-wrap gap-2">
          {LINES.map((code) => {
            const on = values.serviceLineCodes.includes(code);
            return (
              <button
                key={code}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(code)}
                className={`rounded-md border px-3 py-1.5 font-mono text-xs transition-colors ${on ? "border-fg bg-fg text-ground" : "border-line text-fg-muted hover:border-fg"}`}
              >
                {code}
              </button>
            );
          })}
        </div>
      </fieldset>
    </AdminForm>
  );
}

export function AdminView() {
  const t = useTranslations("admin");
  const st = useTranslations("status");
  const c = useTranslations("common");
  const { data, isLoading, isError, refetch } = useAdminClients();
  const [adding, setAdding] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      <p className="max-w-2xl text-fg-muted">{t("subtitle")}</p>

      <Section
        title={t("clients")}
        action={
          adding ? null : (
            <Button size="sm" onClick={() => setAdding(true)}>
              + {t("newClient")}
            </Button>
          )
        }
      >
        {adding ? <NewClientForm onDone={() => setAdding(false)} /> : null}

        {isLoading ? (
          <CardSkeleton rows={4} />
        ) : isError ? (
          <ErrorState title={c("loadError")} onRetry={() => refetch()} retryLabel={c("retry")} />
        ) : !data || data.items.length === 0 ? (
          <EmptyState title={t("empty")} />
        ) : (
          <Card className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="[&>th]:border-b [&>th]:border-line [&>th]:px-3 [&>th]:py-3 sm:[&>th]:px-5 [&>th]:text-start [&>th]:font-mono [&>th]:text-xs [&>th]:uppercase [&>th]:tracking-wider [&>th]:text-fg-muted">
                  <th>{t("name")}</th>
                  <th className="max-md:hidden">{t("contact")}</th>
                  <th className="max-lg:hidden">{t("lines")}</th>
                  <th>{t("status")}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.items.map((cl) => (
                  <tr key={cl.id} className="[&>td]:border-b [&>td]:border-line [&>td]:px-3 [&>td]:py-3 sm:[&>td]:px-5 last:[&>td]:border-0">
                    <td className="font-medium">{cl.name}</td>
                    <td className="text-fg-muted max-md:hidden" dir="ltr">{cl.contactEmail}</td>
                    <td className="u-data text-xs max-lg:hidden">{cl.serviceLineCodes.join(" ")}</td>
                    <td>
                      <StatusBadge tone={cl.status === "active" ? "ok" : "neutral"}>{st(`client.${cl.status}`)}</StatusBadge>
                    </td>
                    <td className="text-end">
                      <Link href={`/admin/clients/${cl.id}`} className="whitespace-nowrap font-mono text-xs underline-offset-4 hover:underline">
                        {t("open")} <span className="inline-block rtl:rotate-180">→</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </Section>
    </div>
  );
}
