/**
 * NULL's service lines. S1–S10 come from the roadmap; S11 (ERP systems) was
 * added by the founder on 2026-09-28. Names and copy live in messages/*.json
 * under `services.items.<code>`.
 */
export const SERVICE_CODES = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10", "S11"] as const;
export type ServiceCode = (typeof SERVICE_CODES)[number];

/**
 * Plain English names, for places the team reads rather than the visitor
 * (the contact-form email): "Software", not "S2". Mirrors services.items.*.name.
 */
export const SERVICE_NAMES_EN: Record<ServiceCode, string> = {
  S1: "Web platforms",
  S2: "Software",
  S3: "Mobile apps",
  S4: "AI solutions",
  S5: "Data & analytics",
  S6: "Security assessments",
  S7: "Security operations",
  S8: "Cloud & DevOps",
  S9: "Integration",
  S10: "Managed support",
  S11: "ERP systems",
};

/** Validates a service line code, S1 through S11. */
export const SERVICE_CODE_PATTERN = /^S([1-9]|1[01])$/;
