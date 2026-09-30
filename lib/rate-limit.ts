import "server-only";

/**
 * In-memory fixed-window limiter for the BFF's public endpoints.
 *
 * Per server instance only, so on Vercel it's a second line: the first is the
 * platform firewall's rate-limit rules, and the API enforces its own limits
 * too (docs/security-checklist.md). It still stops a single client hammering
 * one instance, which is what code guessing looks like.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();
let sweptAt = 0;

function sweep(now: number) {
  if (now - sweptAt < 60_000) return;
  sweptAt = now;
  for (const [k, b] of buckets) if (b.resetAt < now) buckets.delete(k);
}

export function rateLimit(
  key: string,
  { limit = 5, windowMs = 60_000 } = {},
): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  sweep(now);
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  b.count += 1;
  if (b.count > limit) {
    return { ok: false, retryAfter: Math.ceil((b.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfter: 0 };
}
