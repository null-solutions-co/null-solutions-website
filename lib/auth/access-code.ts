import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Project access codes — how a client gets into their portal.
 *
 * NULL issues one code per project from the admin screens and hands it to the
 * client. The code is the credential, so it has to be unguessable: 16 symbols
 * from a 32-letter alphabet is 80 bits of randomness (the old 5-symbol project
 * number was 25 bits). Only a hash is ever stored; the plain code is shown to
 * the admin once, at issue. Re-issuing replaces the hash, which signs out every
 * session opened with the old code.
 *
 * Alphabet drops 0/O and 1/I so a code read over the phone survives.
 */

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 32 symbols → 5 bits each
const LENGTH = 16;

/** A fresh code, e.g. `NS-7K2M-9QXA-4HPD-3WRT`. */
export function generateAccessCode(): string {
  const bytes = randomBytes(LENGTH);
  let raw = "";
  // 256 is a multiple of 32, so masking the low 5 bits is unbiased.
  for (const b of bytes) raw += ALPHABET[b & 31];
  return formatAccessCode(raw);
}

/** `7K2M9QXA4HPD3WRT` → `NS-7K2M-9QXA-4HPD-3WRT`. */
export function formatAccessCode(raw: string): string {
  return `NS-${raw.match(/.{1,4}/g)?.join("-") ?? raw}`;
}

/**
 * Whatever the client typed or pasted → the 16 raw symbols, or null if it
 * can't be a code. Case, spaces and dashes don't matter.
 */
export function normalizeAccessCode(input: string): string | null {
  if (typeof input !== "string" || input.length > 64) return null;
  let s = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (s.length === LENGTH + 2 && s.startsWith("NS")) s = s.slice(2);
  if (s.length !== LENGTH) return null;
  for (const ch of s) if (!ALPHABET.includes(ch)) return null;
  return s;
}

/** SHA-256 of the normalised code. 80 random bits need no slow hash. */
export function hashAccessCode(normalized: string): string {
  return createHash("sha256").update(`ns-access:${normalized}`).digest("hex");
}

/** Constant-time comparison of two hex hashes. */
export function sameHash(a: string, b: string): boolean {
  const x = Buffer.from(a, "hex");
  const y = Buffer.from(b, "hex");
  return x.length === y.length && timingSafeEqual(x, y);
}
