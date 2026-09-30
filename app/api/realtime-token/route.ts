import { NextResponse } from "next/server";
import { MOCKS_ENABLED } from "@/lib/env";
import { readSession } from "@/lib/auth/session";
import { upstream } from "@/lib/auth/upstream";

export const runtime = "nodejs";

/**
 * Short-lived token the browser holds in JS to open the SignalR connection
 * (it cannot read the httpOnly session cookie). See docs/api-contract.md §10.
 */
export async function GET() {
  const session = await readSession();
  if (!session) {
    return NextResponse.json(
      { error: { code: "unauthorized", message: "Not signed in." } },
      { status: 401 },
    );
  }

  if (MOCKS_ENABLED) {
    return NextResponse.json({
      token: "mock.hub.token",
      expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
    });
  }

  const res = await upstream("/auth/realtime-token", {
    headers: { authorization: `Bearer ${session.accessToken}` },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    return NextResponse.json(
      data ?? { error: { code: "server_error", message: "Token request failed." } },
      { status: res.status },
    );
  }
  return NextResponse.json(data);
}
