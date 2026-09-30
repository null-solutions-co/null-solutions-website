import type { z } from "zod";
import { ApiError } from "./errors";

/**
 * The one place the frontend talks to the network.
 *
 * Every call goes to the BFF at `/api/*` on this app's own origin — never to
 * `NEXT_PUBLIC_API_URL` directly. The BFF route handlers read the httpOnly
 * session cookie and forward to the ASP.NET API server-to-server.
 * (Server-side cookie forwarding is added in the auth step; in mock mode MSW
 * intercepts `/api/*` regardless.)
 */

const isServer = typeof window === "undefined";

function origin(): string {
  if (!isServer) return "";
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ?? "http://localhost:3000"
  );
}

type QueryValue = string | number | boolean | undefined | null;

export type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, QueryValue>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  let qs = "";
  if (query) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) params.set(key, String(value));
    }
    const s = params.toString();
    if (s) qs = `?${s}`;
  }
  return `${origin()}/api${path}${qs}`;
}

/** Perform a request against the BFF and validate the JSON body with `schema`. */
export async function apiRequest<T>(
  path: string,
  schema: z.ZodType<T>,
  opts: RequestOptions = {},
): Promise<T> {
  const hasBody = opts.body !== undefined;
  // A file upload goes as multipart; the browser sets its own boundary.
  const isForm = typeof FormData !== "undefined" && opts.body instanceof FormData;
  // The API answers in the page's language (notification titles, gate names…).
  const lang = !isServer ? document.documentElement.lang || "en" : undefined;
  const res = await fetch(buildUrl(path, opts.query), {
    method: opts.method ?? "GET",
    headers: {
      accept: "application/json",
      ...(lang ? { "accept-language": lang } : {}),
      ...(hasBody && !isForm ? { "content-type": "application/json" } : {}),
      ...opts.headers,
    },
    body: !hasBody ? undefined : isForm ? (opts.body as FormData) : JSON.stringify(opts.body),
    signal: opts.signal,
    credentials: "same-origin",
    cache: "no-store",
  });

  const text = await res.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = text;
    }
  }

  if (!res.ok) {
    throw ApiError.fromResponse(res.status, json);
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    throw new ApiError(500, {
      code: "server_error",
      message: "The server's response didn't match the expected shape.",
    });
  }
  return parsed.data;
}
