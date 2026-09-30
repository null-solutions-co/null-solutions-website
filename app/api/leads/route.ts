import { NextResponse } from "next/server";
import { MOCKS_ENABLED } from "@/lib/env";
import { upstream } from "@/lib/auth/upstream";
import { rateLimit } from "@/lib/rate-limit";
import { leadRequest } from "@/lib/api/schemas";
import { BodyTooLarge, clientIp, forbiddenOrigin, rateLimited, readJson, sameOrigin, tooLarge } from "@/lib/security";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return forbiddenOrigin();

  const ip = clientIp(req);
  for (const [key, limit, windowMs] of [
    [`leads:ip:${ip}`, 5, 10 * 60_000],
    ["leads:all", 60, 60_000],
  ] as const) {
    const { ok, retryAfter } = rateLimit(key, { limit, windowMs });
    if (!ok) return rateLimited(retryAfter);
  }

  let raw: Record<string, unknown>;
  try {
    raw = await readJson(req, 16_384);
  } catch (e) {
    if (e instanceof BodyTooLarge) return tooLarge();
    throw e;
  }

  // Honeypot — a real person leaves `website` empty.
  if (typeof raw.website === "string" && raw.website.length > 0) {
    return NextResponse.json({ id: "ok" }, { status: 201 });
  }

  const parsed = leadRequest.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "validation_error",
          message: "Please check the form.",
          details: parsed.error.issues.map((i) => ({
            field: i.path.join("."),
            message: i.message,
          })),
        },
      },
      { status: 422 },
    );
  }

  if (MOCKS_ENABLED) {
    return NextResponse.json({ id: `lead-${Date.now()}` }, { status: 201 });
  }

  const res = await upstream("/leads", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(parsed.data),
  }).catch(() => null);

  if (!res) {
    return NextResponse.json(
      { error: { code: "server_error", message: "Could not send. Try again." } },
      { status: 502 },
    );
  }
  const data = await res.json().catch(() => ({ id: "unknown" }));
  return NextResponse.json(data, { status: res.status });
}
