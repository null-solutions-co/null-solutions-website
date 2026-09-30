"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/errors";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

/** NULL team sign-in. Not linked from the public site; clients use /login with a code. */
export function TeamLoginForm() {
  const t = useTranslations("team");
  const router = useRouter();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      const res = await api.login({
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
      });
      qc.removeQueries({ queryKey: ["session"] });
      router.replace(res.user.role === "Dev" ? "/admin" : "/partner");
      router.refresh();
    } catch (err) {
      const status = err instanceof ApiError ? err.status : 0;
      setError(status === 401 ? t("badCreds") : status === 429 ? t("tooMany") : t("genericError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4 rounded-lg border border-line bg-surface p-6">
      <Field label={t("email")} htmlFor="email" required>
        <Input id="email" name="email" type="email" dir="ltr" autoComplete="username" required />
      </Field>
      <Field label={t("password")} htmlFor="password" required>
        <Input id="password" name="password" type="password" dir="ltr" autoComplete="current-password" required />
      </Field>
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      <Button type="submit" variant="primary" disabled={busy}>
        {busy ? t("working") : t("signIn")}
      </Button>
    </form>
  );
}
