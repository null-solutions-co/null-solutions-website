"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useIssueAccessCode, useProjectAccess, useRevokeAccessCode } from "@/hooks/queries";
import type { IssuedAccessCode } from "@/lib/api/schemas";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { CardSkeleton } from "@/components/ui/states";
import { formatDate } from "@/lib/format";
import { Section } from "./bits";

/**
 * A freshly issued code. It exists in plain text only here, once: the API
 * keeps a hash. So the admin copies it (or the ready-made message) now.
 */
export function IssuedCode({ issued, projectName }: { issued: IssuedAccessCode; projectName: string }) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const [copied, setCopied] = useState<"code" | "message" | null>(null);
  const loginUrl = `${window.location.origin}${locale === "ar" ? "/ar" : ""}/login`;
  const message = t("codeMessage", { project: projectName, url: loginUrl, code: issued.accessCode });

  const copy = async (what: "code" | "message") => {
    try {
      await navigator.clipboard.writeText(what === "code" ? issued.accessCode : message);
      setCopied(what);
    } catch {
      setCopied(null);
    }
  };

  return (
    <div role="status" className="flex flex-col gap-4 rounded-lg border border-[color-mix(in_srgb,var(--ok)_45%,transparent)] bg-surface p-5">
      <p className="text-sm">{t("codeOnce")}</p>
      <p className="select-all rounded-md bg-ground px-4 py-3 text-center font-mono text-lg tracking-[0.14em]" dir="ltr">
        {issued.accessCode}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => copy("code")}>
          {copied === "code" ? t("copied") : t("copyCode")}
        </Button>
        <Button size="sm" variant="secondary" onClick={() => copy("message")}>
          {copied === "message" ? t("copied") : t("copyMessage")}
        </Button>
      </div>
      <p className="text-xs text-fg-muted">{t("codeHandover")}</p>
    </div>
  );
}

/** How the client gets in: whether a code is live, and issuing / replacing / revoking it. */
export function ProjectAccessSection({ projectId, projectName }: { projectId: string; projectName: string }) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const access = useProjectAccess(projectId);
  const issue = useIssueAccessCode();
  const revoke = useRevokeAccessCode();
  const [issued, setIssued] = useState<IssuedAccessCode | null>(null);
  const [failed, setFailed] = useState(false);
  const active = access.data?.active ?? false;

  const onIssue = async () => {
    if (active && !window.confirm(t("confirmReplace"))) return;
    setFailed(false);
    try {
      setIssued(await issue.mutateAsync(projectId));
    } catch {
      setFailed(true);
    }
  };

  const onRevoke = async () => {
    if (!window.confirm(t("confirmRevoke"))) return;
    setFailed(false);
    try {
      await revoke.mutateAsync(projectId);
      setIssued(null);
    } catch {
      setFailed(true);
    }
  };

  return (
    <Section
      title={t("access")}
      action={
        <div className="flex gap-2">
          {active ? (
            <Button size="sm" variant="secondary" disabled={revoke.isPending} onClick={onRevoke}>
              {t("revokeCode")}
            </Button>
          ) : null}
          <Button size="sm" disabled={issue.isPending} onClick={onIssue}>
            {active ? t("replaceCode") : t("issueCode")}
          </Button>
        </div>
      }
    >
      {access.isLoading ? (
        <CardSkeleton rows={1} />
      ) : (
        <Card className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-fg-muted">
            {active ? t("codeActive", { date: formatDate(access.data?.issuedAt ?? null, locale) }) : t("codeNone")}
          </p>
          <StatusBadge tone={active ? "ok" : "neutral"}>{active ? t("codeOn") : t("codeOff")}</StatusBadge>
        </Card>
      )}
      {failed ? (
        <p role="alert" className="text-sm text-danger">
          {t("failed")}
        </p>
      ) : null}
      {issued ? <IssuedCode issued={issued} projectName={projectName} /> : null}
    </Section>
  );
}
