import { z } from "zod";
import { isoDateTime, locale, role, sessionScope } from "./common";

export const userSummary = z.object({
  id: z.string(),
  email: z.string(),
  displayName: z.string(),
  role,
  clientId: z.string().nullable(),
  locale: locale.nullable(),
});
export type UserSummary = z.infer<typeof userSummary>;

export const sessionUser = userSummary.extend({
  scope: sessionScope,
  projectId: z.string().nullable(),
});
export type SessionUser = z.infer<typeof sessionUser>;

/**
 * What the BROWSER sees after login. Tokens never leave the BFF — they live in
 * the encrypted httpOnly session cookie. See lib/auth/session.ts.
 */
export const loginResponse = z.object({
  expiresAt: isoDateTime,
  user: userSummary,
});
export type LoginResponse = z.infer<typeof loginResponse>;

export const accessResponse = z.object({
  expiresAt: isoDateTime,
  projectId: z.string(),
  projectName: z.string(),
});
export type AccessResponse = z.infer<typeof accessResponse>;

export const realtimeToken = z.object({
  token: z.string(),
  expiresAt: isoDateTime,
});
export type RealtimeToken = z.infer<typeof realtimeToken>;

// ---- request bodies ----

export const loginRequest = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginRequest = z.infer<typeof loginRequest>;

/** The project access code, as typed: case, spaces and dashes are ignored. */
export const accessRequest = z.object({
  accessCode: z.string().trim().min(16).max(64),
});
export type AccessRequest = z.infer<typeof accessRequest>;
