"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea, Select } from "@/components/ui/field";
import { Logo } from "@/components/brand/Logo";
import { SERVICE_CODES } from "@/lib/services";

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
      const res = await fetch("/api/leads", {
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
    return (
      <div
        className="flex flex-col items-start gap-3 rounded-lg border border-line bg-surface p-6"
        role="status"
      >
        <Logo size={32} />
        <h2 className="text-lg font-semibold">{t("successTitle")}</h2>
        <p className="text-sm text-fg-muted">{t("successBody")}</p>
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
