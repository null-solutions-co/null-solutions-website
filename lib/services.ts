/**
 * NULL's service lines. S1–S10 come from the roadmap; S11 (ERP systems) was
 * added by the founder on 2026-09-28. Names and copy live in messages/*.json
 * under `services.items.<code>`.
 */
export const SERVICE_CODES = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10", "S11"] as const;
export type ServiceCode = (typeof SERVICE_CODES)[number];

/** Validates a service line code, S1 through S11. */
export const SERVICE_CODE_PATTERN = /^S([1-9]|1[01])$/;
