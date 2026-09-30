import { readSession, type SessionData } from "@/lib/auth/session";
import { MOCKS_ENABLED, PORTAL_ENABLED } from "@/lib/env";
import { apiError, forbiddenOrigin, sameOrigin } from "@/lib/security";

export const runtime = "nodejs";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ?? "";

/** Plain resource segments only: no `..`, no encoded slashes or query marks. */
const SEGMENT = /^[A-Za-z0-9_-][A-Za-z0-9._-]{0,127}$/;

/** JSON bodies are small; file uploads (team only) get the platform's ceiling. */
const MAX_JSON = 64 * 1024;
const MAX_UPLOAD = 4 * 1024 * 1024;

/**
 * What a client's project session may reach, before the API is even asked.
 * The API scopes everything again by its own token (defence in depth).
 */
function projectAllowed(path: string[], s: SessionData): boolean {
  const [head] = path;
  if (head === "admin" || head === "partner") return false;
  if (head === "projects" && path[1] && path[1] !== "mine" && path[1] !== s.projectId) return false;
  return true;
}

async function handle(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  if (!sameOrigin(req)) return forbiddenOrigin();
  if (!PORTAL_ENABLED) return apiError(503, "unavailable", "The portal isn't open yet.");

  const session = await readSession();
  if (!session) return apiError(401, "unauthorized", "Not signed in.");

  const { path } = await ctx.params;
  if (path.length === 0 || path.length > 8 || !path.every((seg) => SEGMENT.test(seg) && seg !== "..")) {
    return apiError(400, "bad_request", "Invalid path.");
  }
  if (session.scope === "project" && !projectAllowed(path, session)) {
    return apiError(403, "forbidden", "You don't have access to this.");
  }

  let body: ArrayBuffer | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    const multipart = req.headers.get("content-type")?.startsWith("multipart/") ?? false;
    const max = multipart && session.scope === "full" ? MAX_UPLOAD : MAX_JSON;
    if (Number(req.headers.get("content-length") ?? 0) > max) return apiError(413, "too_large", "Request body is too large.");
    body = await req.arrayBuffer();
    if (body.byteLength > max) return apiError(413, "too_large", "Request body is too large.");
  }

  const p = path.join("/");
  const search = new URL(req.url).search;
  if (MOCKS_ENABLED) return mockApi(req, p, search, session, body);

  let upstream: Response;
  try {
    upstream = await fetch(`${API_BASE}/${p}${search}`, {
      method: req.method,
      headers: {
        authorization: `Bearer ${session.accessToken}`,
        accept: req.headers.get("accept") ?? "application/json",
        "accept-language": req.headers.get("accept-language") ?? "en",
        ...(req.headers.get("content-type") ? { "content-type": req.headers.get("content-type")! } : {}),
      },
      body,
      cache: "no-store",
      redirect: "manual",
    });
  } catch {
    return apiError(502, "server_error", "The API is unreachable.");
  }

  const out = await upstream.arrayBuffer();
  const headers: Record<string, string> = {
    "content-type": upstream.headers.get("content-type") ?? "application/json",
    "cache-control": "no-store",
  };
  const disposition = upstream.headers.get("content-disposition");
  if (disposition) headers["content-disposition"] = disposition;
  return new Response(out, { status: upstream.status, headers });
}

/**
 * Mock mode: answer from the in-process mock API (mocks/handlers.ts) instead of
 * the network, passing who's signed in so data is scoped exactly as the real
 * API will scope it by its token.
 */
async function mockApi(req: Request, path: string, search: string, session: SessionData, body?: ArrayBuffer) {
  const [{ getResponse }, { handlers }, { VIEWER_HEADER, encodeViewer }] = await Promise.all([
    import("msw"),
    import("@/mocks/handlers"),
    import("@/mocks/db"),
  ]);
  const viewer = {
    id: session.user?.id ?? (session.projectId ? `project:${session.projectId}` : null),
    role: session.user?.role ?? "Client",
    clientId: session.user?.clientId ?? session.clientId ?? null,
    name: session.user?.displayName ?? session.clientName ?? "",
    scope: session.scope,
    projectId: session.projectId ?? null,
  };
  const request = new Request(`http://mock.local/api/proxy/${path}${search}`, {
    method: req.method,
    headers: {
      "content-type": req.headers.get("content-type") ?? "application/json",
      [VIEWER_HEADER]: encodeViewer(viewer),
    },
    body,
  });
  const res = await getResponse(handlers, request);
  return res ?? apiError(404, "not_found", "Not found.");
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const DELETE = handle;
