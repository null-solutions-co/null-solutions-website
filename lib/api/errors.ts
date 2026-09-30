import { apiErrorBody } from "./schemas/common";

type ApiErrorInit = {
  code: string;
  message: string;
  details?: { field: string; message: string }[];
  traceId?: string;
};

/** Thrown by the API client for any non-2xx response, or a response that fails schema validation. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: { field: string; message: string }[];
  readonly traceId?: string;

  constructor(status: number, init: ApiErrorInit) {
    super(init.message);
    this.name = "ApiError";
    this.status = status;
    this.code = init.code;
    this.details = init.details;
    this.traceId = init.traceId;
  }

  get isUnauthorized() {
    return this.status === 401;
  }
  get isForbidden() {
    return this.status === 403;
  }
  get isNotFound() {
    return this.status === 404;
  }

  static fromResponse(status: number, json: unknown): ApiError {
    const parsed = apiErrorBody.safeParse(json);
    if (parsed.success) {
      return new ApiError(status, {
        code: parsed.data.error.code,
        message: parsed.data.error.message,
        details: parsed.data.error.details,
        traceId: parsed.data.traceId,
      });
    }
    const fallback: Record<number, string> = {
      401: "unauthorized",
      403: "forbidden",
      404: "not_found",
      429: "rate_limited",
    };
    return new ApiError(status, {
      code: fallback[status] ?? "server_error",
      message: `Request failed (${status}).`,
    });
  }
}
