import "server-only";

/**
 * Guards shared by every BFF route handler (app/api/*).
 *
 * - `sameOrigin`: state-changing requests must come from this site's own pages.
 *   The session cookie is SameSite=Lax already; this closes the rest of CSRF.
 * - `readJson`: bodies are capped before parsing, so a huge payload can't tie
 *   up the function.
 * - `clientIp`: the address the rate limiter keys on.
 */

const UNSAFE = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function sameOrigin(req: Request): boolean {
  if (!UNSAFE.has(req.method)) return true;
  const site = req.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return false;
  const origin = req.headers.get("origin");
  if (!origin) return site === "same-origin";
  try {
    // Compare with the host the visitor actually reached. On serverless hosts
    // `req.url` can carry an internal hostname, so it isn't trusted for this.
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? new URL(req.url).host;
    return new URL(origin).host === host.split(",")[0].trim();
  } catch {
    return false;
  }
}

export class BodyTooLarge extends Error {}

/** Parse a JSON body of at most `maxBytes`; `{}` when empty or not JSON. */
export async function readJson(req: Request, maxBytes = 16_384): Promise<Record<string, unknown>> {
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > maxBytes) throw new BodyTooLarge();
  const text = await req.text();
  if (text.length > maxBytes) throw new BodyTooLarge();
  if (!text) return {};
  try {
    const v = JSON.parse(text);
    return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

/**
 * The caller's IP. On Vercel `x-real-ip` / the first `x-forwarded-for` hop are
 * set by the platform edge; elsewhere they're only as trustworthy as the proxy
 * in front of the app.
 */
export function clientIp(req: Request): string {
  const real = req.headers.get("x-real-ip")?.trim();
  if (real) return real;
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export const apiError = (status: number, code: string, message: string, headers?: Record<string, string>) =>
  Response.json({ error: { code, message } }, { status, headers });

export const forbiddenOrigin = () => apiError(403, "forbidden", "Cross-site request refused.");
export const tooLarge = () => apiError(413, "too_large", "Request body is too large.");
export const rateLimited = (retryAfter: number) =>
  apiError(429, "rate_limited", "Too many attempts. Try again later.", { "retry-after": String(retryAfter) });
