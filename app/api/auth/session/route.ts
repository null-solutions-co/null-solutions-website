import { NextResponse } from "next/server";
import { readSession, toSessionUser } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function GET() {
  const session = await readSession();
  const user = session && toSessionUser(session);
  if (!user) {
    return NextResponse.json(
      { error: { code: "unauthorized", message: "Not signed in." } },
      { status: 401 },
    );
  }
  return NextResponse.json(user);
}
