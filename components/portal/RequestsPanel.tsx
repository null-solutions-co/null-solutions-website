"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  useProjectRequests,
  useRequest,
  useCreateRequest,
  useAddRequestMessage,
} from "@/hooks/queries";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea, Select } from "@/components/ui/field";
import { StatusBadge } from "@/components/ui/status-badge";
import { CardSkeleton, EmptyState, ErrorState } from "@/components/ui/states";
import { formatDate } from "@/lib/format";
import type { ChangeRequestType } from "@/lib/api/schemas";

const TYPES: ChangeRequestType[] = ["comment", "question", "change_request"];

export function RequestsPanel({ projectId }: { projectId: string }) {
  const t = useTranslations("requests");
  const st = useTranslations("status");
  const c = useTranslations("common");
  const locale = useLocale();
  const [openId, setOpenId] = useState<string | null>(null);

  const list = useProjectRequests(projectId);
  const create = useCreateRequest(projectId);

  if (openId) return <RequestThread requestId={openId} onBack={() => setOpenId(null)} />;

  return (
    <div className="flex flex-col gap-6">
      <NewRequestForm
        onSubmit={(v) => create.mutate(v, { onSuccess: (r) => setOpenId(r.id) })}
        pending={create.isPending}
      />

      {list.isLoading ? (
        <CardSkeleton rows={3} />
      ) : list.isError ? (
        <ErrorState title={c("loadError")} onRetry={() => list.refetch()} retryLabel={c("retry")} />
      ) : !list.data || list.data.items.length === 0 ? (
        <EmptyState title={t("empty")} body={t("emptyBody")} />
      ) : (
        <ul className="flex flex-col gap-2">
          {list.data.items.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => setOpenId(r.id)}
                className="flex w-full flex-col items-start gap-1.5 rounded-lg border border-line bg-surface p-4 text-start transition-colors hover:bg-ground"
              >
                <div className="flex w-full flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{r.subject}</span>
                  <StatusBadge tone={r.status === "closed" ? "neutral" : r.status === "answered" ? "ok" : "warn"}>
                    {st(`request.${r.status}`)}
                  </StatusBadge>
                </div>
                <span className="u-label">
                  {t(`types.${r.type}`)} · {formatDate(r.updatedAt, locale)} · {r.messageCount}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NewRequestForm({
  onSubmit,
  pending,
}: {
  onSubmit: (v: { type: ChangeRequestType; subject: string; body: string }) => void;
  pending: boolean;
}) {
  const t = useTranslations("requests");
  const [type, setType] = useState<ChangeRequestType>("comment");

  return (
    <Card>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          onSubmit({
            type,
            subject: String(f.get("subject") ?? ""),
            body: String(f.get("body") ?? ""),
          });
          e.currentTarget.reset();
          setType("comment");
        }}
        className="flex flex-col gap-4"
      >
        <p className="u-label">{t("new")}</p>
        <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
          <Field label={t("type")} htmlFor="type">
            <Select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as ChangeRequestType)}
            >
              {TYPES.map((x) => (
                <option key={x} value={x}>
                  {t(`types.${x}`)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("subject")} htmlFor="subject" required>
            <Input id="subject" name="subject" required minLength={3} maxLength={160} />
          </Field>
        </div>
        <Field label={t("message")} htmlFor="body" required>
          <Textarea id="body" name="body" required minLength={10} maxLength={4000} rows={3} />
        </Field>
        <div>
          <Button type="submit" variant="primary" size="sm" disabled={pending}>
            {pending ? t("sending") : t("send")}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export function RequestThread({
  requestId,
  onBack,
}: {
  requestId: string;
  onBack?: () => void;
}) {
  const t = useTranslations("requests");
  const st = useTranslations("status");
  const c = useTranslations("common");
  const locale = useLocale();
  const { data, isLoading, isError, refetch } = useRequest(requestId);
  const reply = useAddRequestMessage(requestId);

  return (
    <div className="flex flex-col gap-4">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="self-start font-mono text-sm text-fg-muted hover:text-fg"
        >
          ← {t("backToList")}
        </button>
      ) : null}

      {isLoading ? (
        <CardSkeleton rows={4} />
      ) : isError || !data ? (
        <ErrorState title={c("loadError")} onRetry={() => refetch()} retryLabel={c("retry")} />
      ) : (
        <>
          <Card className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">{data.subject}</h3>
              <StatusBadge tone={data.status === "closed" ? "neutral" : "warn"}>
                {st(`request.${data.status}`)}
              </StatusBadge>
            </div>
            <ul className="flex flex-col gap-3">
              {data.messages.map((m) => (
                <li
                  key={m.id}
                  className="flex flex-col gap-1 border-s-2 border-line ps-3"
                >
                  <span className="u-label">
                    {m.authorRole === "client" ? t("byClient") : t("byTeam")} ·{" "}
                    {formatDate(m.createdAt, locale)}
                  </span>
                  <p className="text-sm">{m.body}</p>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                const body = String(f.get("reply") ?? "").trim();
                if (body) reply.mutate({ body });
                e.currentTarget.reset();
              }}
              className="flex flex-col gap-3"
            >
              <Field label={t("reply")} htmlFor="reply">
                <Textarea
                  id="reply"
                  name="reply"
                  rows={2}
                  placeholder={t("replyPlaceholder")}
                  required
                />
              </Field>
              <div>
                <Button type="submit" variant="primary" size="sm" disabled={reply.isPending}>
                  {t("sendReply")}
                </Button>
              </div>
            </form>
          </Card>
        </>
      )}
    </div>
  );
}
