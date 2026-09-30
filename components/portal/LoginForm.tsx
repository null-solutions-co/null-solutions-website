"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

/** The code alphabet (no I, O, 0 or 1, so nothing can be misread). */
const SYMBOLS = /[^ABCDEFGHJKLMNPQRSTUVWXYZ23456789]/g;

/** Whatever is typed or pasted → `NS-XXXX-XXXX-XXXX-XXXX` as far as it goes. */
function formatAsTyped(value: string): string {
  let raw = value.toUpperCase().replace(/^\s*NS[\s-]*/, "").replace(SYMBOLS, "").slice(0, 16);
  raw = raw.match(/.{1,4}/g)?.join("-") ?? "";
  return raw ? `NS-${raw}` : "";
}

/**
 * Clients open their project with the access code NULL gave them. There are
 * no client passwords and no sign-up: codes come from the NULL team.
 *
 * Laid out after the 21st.dev auth-ui form the user picked (centred heading,
 * one labelled field, full-width button, a line under it), but with the
 * access code in place of email and password. The code formats itself as it's
 * typed or pasted.
 */
export function LoginForm() {
  const t = useTranslations("login");
  const router = useRouter();
  const qc = useQueryClient();
  const id = useId();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  const complete = code.replace(/[^A-Z0-9]/g, "").length === 18;

  function fail(message: string) {
    setError(message);
    setShake((n) => n + 1);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!complete) {
      fail(t("incomplete"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.accessByCode({ accessCode: code });
      qc.removeQueries({ queryKey: ["session"] });
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      const status = err instanceof ApiError ? err.status : 0;
      fail(status === 401 ? t("badCode") : status === 429 ? t("tooMany") : t("genericError"));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex w-full max-w-[380px] flex-col gap-8">
      <div className="key-in flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">{t("keyTitle")}</h1>
        <p className="text-balance text-sm text-fg-muted">{t("intro")}</p>
      </div>

      <div className="key-in key-in--2 grid gap-4">
        <div className="grid gap-2">
          <label htmlFor={id} className="text-sm font-medium leading-none">
            {t("accessCode")}
          </label>
          <div key={shake} className={cn("relative", shake ? "key-shake" : "")}>
            <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-fg-muted" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="7.5" cy="15.5" r="4.5" />
              <path d="m10.7 12.3 9.3-9.3M17 6l3 3M14 9l2 2" />
            </svg>
            <input
              id={id}
              name="accessCode"
              dir="ltr"
              inputMode="text"
              autoComplete="one-time-code"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              maxLength={22}
              placeholder="NS-XXXX-XXXX-XXXX-XXXX"
              value={code}
              onChange={(e) => {
                setCode(formatAsTyped(e.target.value));
                setError(null);
              }}
              aria-invalid={error ? true : undefined}
              aria-describedby={`${id}-hint`}
              className="flex h-12 w-full rounded-lg border border-line bg-white ps-10 pe-3 font-mono text-base tracking-[0.12em] text-fg shadow-sm shadow-black/5 outline-none transition-[border-color,box-shadow] placeholder:text-fg-muted/60 focus-visible:border-[#0d1b2a] focus-visible:shadow-[0_0_0_4px_rgba(13,27,42,0.12)] aria-[invalid=true]:border-danger"
              required
            />
          </div>
          <p id={`${id}-hint`} className="min-h-5 text-xs" role={error ? "alert" : undefined}>
            {error ? <span className="text-danger">{error}</span> : <span className="text-fg-muted">{t("accessCodeHint")}</span>}
          </p>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-[#0a0a0a] bg-[#0a0a0a] px-6 text-sm font-medium text-white transition-colors hover:bg-[#0d1b2a] disabled:pointer-events-none disabled:opacity-50"
        >
          {busy ? t("working") : t("open")}
          {busy ? null : (
            <span aria-hidden="true" className="rtl:rotate-180">
              →
            </span>
          )}
        </button>
      </div>

      <div className="key-in key-in--3 flex flex-col gap-4 text-center text-sm">
        <p>
          {t("noCode")}{" "}
          <Link href="/contact" className="font-medium underline-offset-4 hover:underline">
            {t("askUs")}
          </Link>
        </p>
        <p className="text-xs leading-relaxed text-fg-muted">{t("keepSafe")}</p>
      </div>
    </form>
  );
}
