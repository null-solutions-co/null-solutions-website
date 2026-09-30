import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import type { Role, SessionScope, SessionUser } from "@/lib/api/schemas";
import { MOCKS_ENABLED } from "@/lib/env";
import { SESSION_COOKIE } from "./constants";

export { SESSION_COOKIE };
const MAX_AGE = 60 * 60 * 8; // 8 hours

/**
 * Two kinds of session:
 * - "project": a client who entered their project's access code. Sees that
 *   one project's portal and nothing else.
 * - "full": the NULL team, signed in with email + password at /team.
 */
export type SessionData = {
  scope: SessionScope;
  /** Absolute expiry (ms). Checked here, so a copied cookie dies on time too. */
  exp: number;
  /** Bearer token the BFF proxy attaches when calling the upstream API. */
  accessToken: string;
  refreshToken?: string;
  /** Project sessions: which project, and which issued code opened it. */
  projectId?: string;
  codeId?: string;
  projectName?: string;
  clientId?: string | null;
  clientName?: string;
  /** Team sessions. */
  user?: {
    id: string;
    email: string;
    displayName: string;
    role: Role;
    clientId: string | null;
  };
};

function key(): Buffer {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    // A guessable key would let anyone mint a session, including an admin one.
    if (process.env.NODE_ENV === "production") {
      throw new Error("SESSION_SECRET must be set to 32+ random characters in production.");
    }
    return createHash("sha256").update(secret || "insecure-dev-secret").digest();
  }
  return createHash("sha256").update(secret).digest();
}

/** Encrypt a session blob for the httpOnly cookie (AES-256-GCM). */
export function sealSession(data: SessionData): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([cipher.update(JSON.stringify(data), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, enc].map((b) => b.toString("base64url")).join(".");
}

export function openSession(value: string | undefined): SessionData | null {
  if (!value || value.length > 8192) return null;
  try {
    const [ivB, tagB, encB] = value.split(".");
    const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(ivB, "base64url"));
    decipher.setAuthTag(Buffer.from(tagB, "base64url"));
    const dec = Buffer.concat([decipher.update(Buffer.from(encB, "base64url")), decipher.final()]);
    const data = JSON.parse(dec.toString("utf8")) as SessionData;
    if (typeof data.exp !== "number" || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * A project session stays valid only while the code that opened it is the
 * project's current code. In live mode the API enforces this on every call
 * (docs/api-contract.md §3); in mock mode we check the mock store here.
 */
async function stillValid(s: SessionData): Promise<boolean> {
  if (s.scope !== "project" || !MOCKS_ENABLED) return true;
  const { accessOf } = await import("@/mocks/db");
  return !!s.projectId && accessOf(s.projectId)?.id === s.codeId;
}

/** Read + decrypt + validate the current session (server components, route handlers). */
export async function readSession(): Promise<SessionData | null> {
  const store = await cookies();
  const s = openSession(store.get(SESSION_COOKIE)?.value);
  return s && (await stillValid(s)) ? s : null;
}

export async function writeSession(data: Omit<SessionData, "exp">): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, sealSession({ ...data, exp: Date.now() + MAX_AGE * 1000 }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** The shape returned by GET /api/auth/session (the `sessionUser` schema). */
export function toSessionUser(s: SessionData): SessionUser {
  if (s.scope === "project" || !s.user) {
    return {
      id: `project:${s.projectId ?? ""}`,
      email: "",
      displayName: s.clientName || s.projectName || "",
      role: "Client",
      clientId: s.clientId ?? null,
      locale: null,
      scope: "project",
      projectId: s.projectId ?? null,
    };
  }
  return { ...s.user, locale: null, scope: "full", projectId: null };
}
