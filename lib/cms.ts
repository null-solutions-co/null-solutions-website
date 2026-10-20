import "server-only";
import { COMPANY } from "./company";
import { PORTFOLIO, type PortfolioEntry } from "./portfolio";
import { parseCompany, parsePortfolio, parseSiteMessages, type Company } from "./cms-parse";

/**
 * Website content from NULL Platform's public API (docs/PLATFORM.md).
 *
 * Server-side only. Every read is cached for 60 s under a `null:*` tag, which
 * the platform's webhook (app/api/revalidate) clears the moment staff save an
 * edit. When NULL_CMS_URL is unset, or the platform is slow, down or answers
 * something unexpected, the bundled content is used instead — the site never
 * fails because of the CMS.
 */

export const CMS_TAGS = {
  messages: "null:messages",
  portfolio: "null:portfolio",
  site: "null:site",
} as const;

const TIMEOUT_MS = 3000;

/** One warning per key per minute, so an outage doesn't flood the server log. */
const lastWarned = new Map<string, number>();
function warn(key: string, message: string) {
  const now = Date.now();
  if (now - (lastWarned.get(key) ?? 0) < 60_000) return;
  lastWarned.set(key, now);
  console.warn(`[cms] ${message}`);
}

/** Platform origin, e.g. http://localhost:3000 — null when not configured. */
export function cmsBase(): string | null {
  const raw = process.env.NULL_CMS_URL?.trim();
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return u.protocol === "http:" || u.protocol === "https:" ? raw.replace(/\/+$/, "") : null;
  } catch {
    return null;
  }
}

async function cmsGet(path: string, tag: string): Promise<unknown | null> {
  const base = cmsBase();
  if (!base) return null;
  try {
    const res = await fetch(`${base}/api/public${path}`, {
      headers: { accept: "application/json" },
      next: { revalidate: 60, tags: [tag] },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      warn(path, `GET ${path} → ${res.status}; using bundled content`);
      return null;
    }
    return await res.json();
  } catch (err) {
    warn(path, `GET ${path} failed (${err instanceof Error ? err.name : "error"}); using bundled content`);
    return null;
  }
}

/** The CMS texts for a locale (nested like messages/<locale>.json), or null. */
export async function getCmsMessages(locale: string): Promise<Record<string, unknown> | null> {
  const json = await cmsGet(`/site-messages?locale=${encodeURIComponent(locale)}`, CMS_TAGS.messages);
  if (json === null) return null;
  const messages = parseSiteMessages(json);
  if (!messages) warn("shape:messages", "site-messages: unexpected shape; using bundled texts");
  return messages;
}

/** The published portfolio, or the bundled PORTFOLIO. */
export async function getPortfolio(): Promise<PortfolioEntry[]> {
  const json = await cmsGet("/portfolio-entries", CMS_TAGS.portfolio);
  if (json === null) return PORTFOLIO;
  const entries = parsePortfolio(json);
  if (!entries) {
    warn("shape:portfolio", "portfolio-entries: unexpected shape; using bundled portfolio");
    return PORTFOLIO;
  }
  return entries;
}

/** Public contact details (email, phone, Instagram, social links), or the bundled COMPANY. */
export async function getCompany(): Promise<Company> {
  const json = await cmsGet("/site?locale=en", CMS_TAGS.site);
  return json === null ? COMPANY : parseCompany(json, COMPANY);
}
