import "server-only";

const BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ?? "";

/** Call the real ASP.NET API server-to-server (live mode only). */
export function upstream(path: string, init?: RequestInit) {
  return fetch(`${BASE}${path}`, { ...init, cache: "no-store" });
}
