import { z } from "zod";
import { SERVICE_CODE_PATTERN } from "@/lib/services";
import { isoDateTime, locale } from "./common";

// ---- service lines (public) ----

export const serviceLine = z.object({
  id: z.string(),
  code: z.string().regex(SERVICE_CODE_PATTERN),
  name: z.string(),
  shortDescription: z.string(),
  order: z.number().int(),
});
export type ServiceLine = z.infer<typeof serviceLine>;

// ---- leads (contact form) ----

export const leadRequest = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  company: z.string().max(160).optional(),
  phone: z.string().max(40).optional(),
  serviceLineCode: z
    .string()
    .regex(SERVICE_CODE_PATTERN)
    .optional(),
  message: z.string().min(10).max(4000),
  locale,
});
export type LeadRequest = z.infer<typeof leadRequest>;

export const leadCreated = z.object({ id: z.string() });
export type LeadCreated = z.infer<typeof leadCreated>;

// ---- partner metrics (shell — shape TBD by NULL) ----

export const partnerMetrics = z.object({
  generatedAt: isoDateTime,
  cards: z.array(
    z.object({
      key: z.string(),
      label: z.string(),
      value: z.union([z.string(), z.number()]),
      hint: z.string().optional(),
    }),
  ),
});
export type PartnerMetrics = z.infer<typeof partnerMetrics>;

// ---- admin (Dev only) ----

export const client = z.object({
  id: z.string(),
  name: z.string(),
  contactEmail: z.string(),
  contactPhone: z.string().nullable(),
  status: z.enum(["active", "prospect", "inactive"]),
  serviceLineCodes: z.array(z.string()),
  createdAt: isoDateTime,
});
export type Client = z.infer<typeof client>;
