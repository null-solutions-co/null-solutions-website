import { z } from "zod";
import { COMPANY } from "./company";
import type { PortfolioEntry } from "./portfolio";

/**
 * Pure helpers for content read from NULL Platform (lib/cms.ts does the
 * fetching). Kept free of `server-only` so the unit tests can import them.
 */

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
type Messages = Record<string, unknown>;

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * Lay the CMS texts over the bundled ones. The bundled file decides the shape:
 * - objects merge key by key (extra CMS keys are kept; next-intl ignores them);
 * - arrays keep the bundled length and merge item by item, so a list the site
 *   shortened doesn't grow back from rows still stored in the CMS;
 * - a leaf is replaced only by a non-empty string or a number, and never where
 *   the bundled value is an object/array — so a missing, blank or odd CMS
 *   value falls back to the bundled text and `t()` keeps its structure.
 */
export function mergeMessages<T>(bundled: T, cms: unknown): T {
  return merge(bundled as Json, cms) as T;
}

function merge(base: Json | undefined, over: unknown): Json | undefined {
  if (Array.isArray(base)) {
    if (!Array.isArray(over)) return base;
    return base.map((item, i) => merge(item, over[i]) as Json);
  }
  if (isPlainObject(base)) {
    if (!isPlainObject(over)) return base;
    const out: { [key: string]: Json } = { ...(base as { [key: string]: Json }) };
    for (const [key, value] of Object.entries(over)) {
      const merged = merge(out[key], value);
      if (merged !== undefined) out[key] = merged;
    }
    return out;
  }
  if (base === undefined) {
    // a key the bundled file doesn't have: take it as is when it's usable
    if (typeof over === "string" || typeof over === "number" || isPlainObject(over) || Array.isArray(over)) {
      return over as Json;
    }
    return undefined;
  }
  if (typeof over === "string" && over.trim() !== "") return over;
  if (typeof over === "number" && Number.isFinite(over)) return over;
  return base;
}

/** `GET /api/public/site-messages?locale=…` */
export const siteMessagesResponse = z.object({
  messages: z.record(z.string(), z.unknown()),
});

export function parseSiteMessages(json: unknown): Messages | null {
  const parsed = siteMessagesResponse.safeParse(json);
  return parsed.success ? parsed.data.messages : null;
}

/* ---------------------------------------------------------------- portfolio */

const localized = z.object({ ar: z.string(), en: z.string() });
const image = z.object({ src: z.string().min(1), w: z.number().positive(), h: z.number().positive() });

/** One entry of `GET /api/public/portfolio-entries` — the site's own `PortfolioEntry`. */
export const portfolioEntry = z.object({
  slug: z.string().min(1),
  name: localized,
  kind: z.enum(["website", "app", "software"]),
  cover: z.object({
    bg: z.string().min(1),
    ink: z.enum(["light", "dark"]),
    art: image.optional(),
    icon: z.enum(["coffee", "car"]).optional(),
  }),
  logo: image.optional(),
  shot: z.string().min(1).optional(),
  url: z.string().min(1).optional(),
  fullName: localized.optional(),
  summary: localized.optional(),
}) satisfies z.ZodType<PortfolioEntry>;

export const portfolioResponse = z.object({ entries: z.array(portfolioEntry) });

/**
 * The entries, or null when the payload isn't the expected shape. A single bad
 * entry fails the whole list: showing the bundled portfolio beats showing a
 * half-broken one.
 */
export function parsePortfolio(json: unknown): PortfolioEntry[] | null {
  const parsed = portfolioResponse.safeParse(json);
  return parsed.success ? parsed.data.entries : null;
}

/* ------------------------------------------------------------------ company */

export type Company = {
  email: string;
  phone: string;
  instagram: { handle: string; href: string };
  social: { label: string; href: string }[];
};

const optionalString = z.string().nullish();

export const siteResponse = z.object({
  company: z.object({
    email: optionalString,
    phone: optionalString,
    social: z
      .object({ instagram: optionalString, linkedin: optionalString })
      .partial()
      .nullish(),
  }),
});

const safeHttpUrl = (v: string | null | undefined): string | null => {
  if (!v) return null;
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
};

/** "https://www.instagram.com/null_solutions/" → "null_solutions" */
export function instagramHandle(href: string): string | null {
  try {
    const u = new URL(href);
    if (!/(^|\.)instagram\.com$/i.test(u.hostname)) return null;
    const handle = u.pathname.split("/").filter(Boolean)[0];
    return handle && /^[A-Za-z0-9._]{1,30}$/.test(handle) ? handle : null;
  } catch {
    return null;
  }
}

/**
 * `GET /api/public/site` → the `COMPANY` shape. Each field the platform leaves
 * empty (or sends malformed) keeps the bundled value.
 */
export function parseCompany(json: unknown, fallback: Company = COMPANY): Company {
  const parsed = siteResponse.safeParse(json);
  if (!parsed.success) return fallback;
  const c = parsed.data.company;

  const email = c.email && z.email().safeParse(c.email).success ? c.email : fallback.email;
  const phone = c.phone?.trim() || fallback.phone;

  const igHref = safeHttpUrl(c.social?.instagram);
  const igHandle = igHref ? instagramHandle(igHref) : null;
  const instagram = igHref && igHandle ? { handle: igHandle, href: igHref } : fallback.instagram;

  const linkedin = safeHttpUrl(c.social?.linkedin);
  const social = [
    { label: "Instagram", href: instagram.href },
    ...(linkedin ? [{ label: "LinkedIn", href: linkedin }] : []),
  ];

  return { email, phone, instagram, social };
}
