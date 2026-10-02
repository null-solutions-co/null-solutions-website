"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea, Select } from "@/components/ui/field";
import { SERVICE_CODES, SERVICE_NAMES_EN } from "@/lib/services";

const CODES = SERVICE_CODES;

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  company: z.string().max(160).optional().or(z.literal("")),
  phone: z.string().max(40).optional().or(z.literal("")),
  serviceLineCode: z.enum(CODES).optional().or(z.literal("")),
  message: z.string().min(10).max(4000),
  // honeypot — real people leave this empty
  website: z.string().max(0).optional().or(z.literal("")),
});
type FormValues = z.infer<typeof schema>;

/**
 * Where a message goes. "netlify-forms": straight to Netlify Forms, which
 * stores it and emails the team — for a site hosted on Netlify with no API
 * behind it yet. Otherwise: our own /api/leads, which hands it to the API.
 */
const VIA_NETLIFY = process.env.NEXT_PUBLIC_LEADS_VIA === "netlify-forms";

/** Netlify Forms reads url-encoded posts to a static page that declares the form (public/__forms.html). */
function toNetlify(values: FormValues, locale: string) {
  const body = new URLSearchParams({
    "form-name": "contact",
    name: values.name,
    email: values.email,
    company: values.company ?? "",
    phone: values.phone ?? "",
    service: values.serviceLineCode ? SERVICE_NAMES_EN[values.serviceLineCode] : "",
    message: values.message,
    locale,
    website: values.website ?? "",
  });
  return fetch("/__forms.html", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
}

export function ContactForm() {
  const t = useTranslations("contact");
  const ts = useTranslations("services");
  const locale = useLocale() as "ar" | "en";
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    if (values.website) {
      // bot — pretend success, never call the API
      setStatus("sent");
      return;
    }
    setStatus("sending");
    try {
      const res = VIA_NETLIFY ? await toNetlify(values, locale) : await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          company: values.company || undefined,
          phone: values.phone || undefined,
          serviceLineCode: values.serviceLineCode || undefined,
          message: values.message,
          locale,
          website: values.website ?? "",
        }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    // A paper plane takes off and leaves a dotted trail, then a ring and a
    // tick draw themselves and the words rise in (.cf-sent in globals.css).
    return (
      <div className="cf-sent relative flex flex-col items-center gap-4 overflow-hidden rounded-3xl border border-line bg-surface px-6 py-14 text-center" role="status">
        <svg viewBox="0 0 320 120" aria-hidden="true" className="cf-sent__sky pointer-events-none absolute inset-x-0 top-0 h-28 w-full" style={{ direction: "ltr" }}>
          <path className="cf-sent__trail" d="M20 110 C 90 100, 150 70, 300 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 6" strokeLinecap="round" pathLength={1} />
          <g className="cf-sent__plane">
            <path d="M0 0 L22 9 L0 18 L5 9 Z" fill="currentColor" />
            <path d="M5 9 L22 9" stroke="var(--surface)" strokeWidth="1.2" />
          </g>
        </svg>
        <div aria-hidden="true" className="relative mt-6 size-16">
          <span className="cf-sent__pulse absolute inset-0 rounded-full border border-current" />
          <svg viewBox="0 0 64 64" className="relative size-16">
            <circle className="cf-sent__ring" cx="32" cy="32" r="29" fill="none" stroke="currentColor" strokeWidth="2.5" pathLength={1} />
            <path className="cf-sent__tick" d="M20 33 l8 8 l16 -18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" pathLength={1} />
          </svg>
        </div>
        <h2 className="cf-sent__line text-2xl font-semibold tracking-tight" style={{ animationDelay: "1.15s" }}>
          {t("successTitle")}
        </h2>
        <p className="cf-sent__line max-w-[36ch] text-fg-muted" style={{ animationDelay: "1.3s" }}>
          {t("successBody")}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      {status === "error" ? (
        <div
          role="alert"
          className="rounded-md border border-danger/40 bg-surface p-4 text-sm"
        >
          <p className="font-medium text-danger">{t("errorTitle")}</p>
          <p className="mt-1 text-fg-muted">{t("errorBody")}</p>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("fields.name")} htmlFor="name" required error={errors.name && t("invalid")}>
          <Input id="name" autoComplete="name" aria-invalid={!!errors.name} {...register("name")} />
        </Field>
        <Field label={t("fields.email")} htmlFor="email" required error={errors.email && t("invalid")}>
          <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
        </Field>
        <Field label={t("fields.company")} htmlFor="company">
          <Input id="company" autoComplete="organization" {...register("company")} />
        </Field>
        <Field label={t("fields.phone")} htmlFor="phone">
          <Input id="phone" type="tel" inputMode="tel" autoComplete="tel" {...register("phone")} />
        </Field>
      </div>

      <Field label={t("fields.serviceLine")} htmlFor="serviceLineCode">
        <Select id="serviceLineCode" defaultValue="" {...register("serviceLineCode")}>
          <option value="">{t("fields.serviceLinePlaceholder")}</option>
          {CODES.map((code) => (
            <option key={code} value={code}>
              {code} — {ts(`items.${code}.name`)}
            </option>
          ))}
        </Select>
      </Field>

      <Field label={t("fields.message")} htmlFor="message" required error={errors.message && t("invalid")}>
        <Textarea id="message" rows={5} aria-invalid={!!errors.message} {...register("message")} />
      </Field>

      {/* honeypot: clipped to nothing in place, not pushed off-screen (that widens RTL pages) */}
      <div aria-hidden="true" className="pointer-events-none absolute size-px overflow-hidden opacity-0 [clip-path:inset(50%)]">
        <label htmlFor="website">Website</label>
        <input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      <div>
        <Button type="submit" variant="hero" disabled={status === "sending"}>
          {status === "sending" ? t("sending") : t("submit")}
        </Button>
      </div>
    </form>
  );
}
