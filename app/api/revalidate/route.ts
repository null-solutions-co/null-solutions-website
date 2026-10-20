import { createHash, timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { apiError, BodyTooLarge, clientIp, rateLimited, readJson, tooLarge } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Revalidation webhook for NULL Platform (docs/PLATFORM.md).
 *
 * After staff save anything under /admin/website/* the platform POSTs
 * `{ secret, paths, tags }` here (its settings: revalidateUrl +
 * revalidateSecret = this site's REVALIDATE_SECRET). Tags are the ones
 * lib/cms.ts puts on its fetches (`null:messages`, `null:portfolio`,
 * `null:site`, …); paths are site paths such as `/about` or `/ar/about`.
 * Server-to-server, so no same-origin check; the secret is the guard.
 */

/** Compare digests, so neither the content nor the length of the secret leaks through timing. */
function sameSecret(given: string, expected: string): boolean {
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

export async function POST(req: Request) {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected) return apiError(503, "not_configured", "Revalidation is not configured.");

  const ip = clientIp(req);
  const { ok, retryAfter } = rateLimit(`revalidate:ip:${ip}`, { limit: 60, windowMs: 60_000 });
  if (!ok) return rateLimited(retryAfter);

  let body: Record<string, unknown>;
  try {
    body = await readJson(req, 16_384);
  } catch (e) {
    if (e instanceof BodyTooLarge) return tooLarge();
    throw e;
  }

  if (typeof body.secret !== "string" || !sameSecret(body.secret, expected)) {
    return apiError(401, "unauthorized", "Bad secret.");
  }

  const tags = strings(body.tags)
    .filter((t) => t.startsWith("null:") && t.length <= 256)
    .slice(0, 50);
  const paths = strings(body.paths)
    .filter((p) => p.startsWith("/") && !p.startsWith("//") && !p.includes("\\") && p.length <= 200)
    .slice(0, 100);

  // Next 16 signature: { expire: 0 } → the next request gets fresh data rather than stale-while-revalidate.
  for (const tag of tags) revalidateTag(tag, { expire: 0 });

  // `/about` is served from the `[locale]` route as `/en/about` (English has no prefix in the URL).
  const expanded = new Set<string>();
  for (const p of paths) {
    expanded.add(p);
    if (!/^\/(en|ar)(\/|$)/.test(p)) expanded.add(p === "/" ? "/en" : `/en${p}`);
  }
  for (const p of expanded) revalidatePath(p);

  return NextResponse.json(
    { revalidated: true, tags, paths: [...expanded], now: Date.now() },
    { headers: { "cache-control": "no-store" } },
  );
}
