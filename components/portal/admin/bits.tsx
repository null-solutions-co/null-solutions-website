"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import type { z } from "zod";
import { Button } from "@/components/ui/button";

/** A titled block on the admin pages, with an optional action on the right. */
export function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/**
 * Small admin form: validates with the same zod schema the API contract uses,
 * submits through a mutation, and reports failure in one line.
 */
export function AdminForm<S extends z.ZodTypeAny>({
  schema,
  values,
  onSubmit,
  submitLabel,
  busyLabel,
  errorLabel,
  onCancel,
  cancelLabel,
  children,
}: {
  schema: S;
  values: unknown;
  onSubmit: (data: z.output<S>) => Promise<unknown>;
  submitLabel: string;
  busyLabel: string;
  errorLabel: string;
  onCancel?: () => void;
  cancelLabel?: string;
  children: ReactNode;
}) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      setFailed(true);
      return;
    }
    setBusy(true);
    setFailed(false);
    try {
      await onSubmit(parsed.data);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4 rounded-lg border border-line bg-surface p-5">
      {children}
      {failed ? (
        <p role="alert" className="text-sm text-danger">
          {errorLabel}
        </p>
      ) : null}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={busy}>
          {busy ? busyLabel : submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" size="sm" variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
        ) : null}
      </div>
    </form>
  );
}

/** Tiny controlled-form state: `[values, set("field")]`. */
export function useFields<T extends Record<string, unknown>>(initial: T) {
  const [values, setValues] = useState(initial);
  const set = (key: keyof T) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));
  return { values, setValues, set, reset: () => setValues(initial) };
}
