import { NextResponse } from "next/server";
import { MOCKS_ENABLED, PORTAL_ENABLED } from "@/lib/env";
import { writeSession } from "@/lib/auth/session";
import { upstream } from "@/lib/auth/upstream";
import { normalizeAccessCode } from "@/lib/auth/access-code";
import { rateLimit } from "@/lib/rate-limit";
import { BodyTooLarge, apiError, clientIp, forbiddenOrigin, rateLimited, readJson, sameOrigin, tooLarge } from "@/lib/security";

export const runtime = "nodejs";

/**
 * A client opens their project with the access code NULL gave them.
 *
 * The code is the only credential, so this endpoint is the one to attack:
 * - 80-bit codes (lib/auth/access-code.ts) make guessing hopeless on paper;
 * - per-IP and per-instance limits make it slow in practice;
 * - a wrong code and a malformed one get the same answer after the same pause.
 */
const invalid = async () => {
  await new Promise((r) => setTimeout(r, 400 + Math.random() * 200));
  return apiError(401, "invalid_code", "That code didn't open a project.");
};

export async function POST(req: Request) {
  if (!sameOrigin(req)) return forbiddenOrigin();
  if (!PORTAL_ENABLED) return apiError(503, "unavailable", "The portal isn't open yet.");

  const ip = clientIp(req);
  for (const [key, limit, windowMs] of [
    [`access:ip:${ip}`, 10, 15 * 60_000],
    ["access:all", 300, 60_000],
  ] as const) {
    const { ok, retryAfter } = rateLimit(key, { limit, windowMs });
    if (!ok) return rateLimited(retryAfter);
  }

  let body: Record<string, unknown>;
  try {
    body = await readJson(req, 1024);
  } catch (e) {
    if (e instanceof BodyTooLarge) return tooLarge();
    throw e;
  }
  const code = typeof body.accessCode === "string" ? normalizeAccessCode(body.accessCode) : null;
  if (!code) return invalid();

  if (MOCKS_ENABLED) {
    const { db, projectByAccessCode } = await import("@/mocks/db");
    const match = projectByAccessCode(code);
    if (!match) return invalid();
    const { project, access } = match;
    const client = db().clients.find((c) => c.id === project.clientId);
    await writeSession({
      scope: "project",
      accessToken: "mock.project.token",
      projectId: project.id,
      codeId: access.id,
      projectName: project.name,
      clientId: project.clientId,
      clientName: client?.name ?? "",
    });
    return NextResponse.json({
      expiresAt: new Date(Date.now() + 8 * 3.6e6).toISOString(),
      projectId: project.id,
      projectName: project.name,
    });
  }

  const res = await upstream("/auth/access", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify({ accessCode: code }),
  }).catch(() => null);
  if (!res) return apiError(502, "server_error", "The API is unreachable.");
  if (res.status === 429) return rateLimited(Number(res.headers.get("retry-after") ?? 60));
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.accessToken) return invalid();
  await writeSession({
    scope: "project",
    accessToken: data.accessToken,
    projectId: data.projectId,
    projectName: data.projectName,
    clientId: data.clientId ?? null,
    clientName: data.clientName ?? "",
  });
  return NextResponse.json({
    expiresAt: data.expiresAt,
    projectId: data.projectId,
    projectName: data.projectName,
  });
}
