import { NextResponse } from "next/server";
import { MOCKS_ENABLED, PORTAL_ENABLED } from "@/lib/env";
import { writeSession } from "@/lib/auth/session";
import { upstream } from "@/lib/auth/upstream";
import { rateLimit } from "@/lib/rate-limit";
import { BodyTooLarge, apiError, clientIp, forbiddenOrigin, rateLimited, readJson, sameOrigin, tooLarge } from "@/lib/security";

export const runtime = "nodejs";

/**
 * NULL team sign-in (the /team page). Clients don't have passwords: they open
 * their project with its access code at /login. A client account that somehow
 * reaches this endpoint is refused.
 */
const badCredentials = async () => {
  await new Promise((r) => setTimeout(r, 400 + Math.random() * 200));
  return apiError(401, "invalid_credentials", "Email or password is wrong.");
};

export async function POST(req: Request) {
  if (!sameOrigin(req)) return forbiddenOrigin();
  if (!PORTAL_ENABLED) return apiError(503, "unavailable", "The portal isn't open yet.");

  let body: Record<string, unknown>;
  try {
    body = await readJson(req, 2048);
  } catch (e) {
    if (e instanceof BodyTooLarge) return tooLarge();
    throw e;
  }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 254) : "";
  const password = typeof body.password === "string" ? body.password.slice(0, 256) : "";

  const ip = clientIp(req);
  for (const [key, limit] of [
    [`login:ip:${ip}`, 10],
    [`login:email:${email}`, 5],
  ] as const) {
    const { ok, retryAfter } = rateLimit(key, { limit, windowMs: 15 * 60_000 });
    if (!ok) return rateLimited(retryAfter);
  }
  if (!email || !password) return badCredentials();

  if (MOCKS_ENABLED) {
    const { checkStaffPassword, findUserByEmail, toUserSummary } = await import("@/mocks/db");
    const found = findUserByEmail(email);
    const passwordOk = checkStaffPassword(password);
    if (!found || !passwordOk || found.role === "Client") return badCredentials();
    const user = toUserSummary(found);
    await writeSession({
      scope: "full",
      accessToken: "mock.access.token",
      refreshToken: "mock.refresh.token",
      user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role, clientId: user.clientId },
    });
    return NextResponse.json({ expiresAt: new Date(Date.now() + 3.6e6).toISOString(), user });
  }

  const res = await upstream("/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify({ email, password }),
  }).catch(() => null);
  if (!res) return apiError(502, "server_error", "The API is unreachable.");
  if (res.status === 429) return rateLimited(Number(res.headers.get("retry-after") ?? 60));
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.user || data.user.role === "Client") return badCredentials();
  await writeSession({
    scope: "full",
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    user: data.user,
  });
  return NextResponse.json({ expiresAt: data.expiresAt, user: data.user });
}
