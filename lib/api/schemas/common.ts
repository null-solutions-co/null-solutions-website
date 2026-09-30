import { z } from "zod";

/**
 * Shared primitives — mirrors docs/api-contract.md §0–§1 and openapi.yaml.
 * Response schemas are intentionally lenient (unknown keys are stripped, not
 * rejected) so a backend that adds a field doesn't break the frontend.
 */

/** ISO-8601 UTC string, e.g. "2026-08-30T14:00:00Z". Rendered in Asia/Amman. */
export const isoDateTime = z.string();

export const money = z.object({
  currency: z.literal("JOD"),
  /** Decimal string, 3 fractional digits, e.g. "1500.000". */
  amount: z.string(),
});
export type Money = z.infer<typeof money>;

export const locale = z.enum(["ar", "en"]);
export type Locale = z.infer<typeof locale>;

export const role = z.enum(["Client", "Partner", "Dev"]);
export type Role = z.infer<typeof role>;

/** "full" = NULL team (email + password), "project" = a client via their project access code. */
export const sessionScope = z.enum(["full", "project"]);
export type SessionScope = z.infer<typeof sessionScope>;

export const gateId = z.enum(["G0", "G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9"]);
export type GateId = z.infer<typeof gateId>;

export const apiErrorCode = z.enum([
  "bad_request",
  "unauthorized",
  "forbidden",
  "not_found",
  "conflict",
  "validation_error",
  "rate_limited",
  "server_error",
]);
export type ApiErrorCode = z.infer<typeof apiErrorCode>;

export const apiErrorBody = z.object({
  error: z.object({
    code: apiErrorCode.or(z.string()),
    message: z.string(),
    details: z
      .array(z.object({ field: z.string(), message: z.string() }))
      .optional(),
  }),
  traceId: z.string().optional(),
});
export type ApiErrorBody = z.infer<typeof apiErrorBody>;

/** Wrap any item schema in the standard `{ items, page, pageSize, total }` envelope. */
export const paginated = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    items: z.array(item),
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
  });

export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};
