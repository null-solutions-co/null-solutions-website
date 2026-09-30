import { NextResponse } from "next/server";
import { MOCKS_ENABLED } from "@/lib/env";
import { clearSession, readSession } from "@/lib/auth/session";
import { upstream } from "@/lib/auth/upstream";
import { forbiddenOrigin, sameOrigin } from "@/lib/security";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return forbiddenOrigin();
  if (!MOCKS_ENABLED) {
    const session = await readSession();
    if (session?.refreshToken) {
      await upstream("/auth/logout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      }).catch(() => undefined);
    }
  }
  await clearSession();
  return new NextResponse(null, { status: 204 });
}
