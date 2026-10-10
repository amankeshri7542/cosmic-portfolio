import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public extra: Record<string, unknown> = {},
    public headers: Record<string, string> = {},
  ) {
    super(message);
  }
}

/** Thrown to abort a handler with a response that already exists (e.g. a 401 from the auth guard). */
export class Halt extends Error {
  constructor(public response: Response) {
    super("halt");
  }
}

export function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

export function errorResponse(error: unknown) {
  if (error instanceof Halt) return error.response;
  if (error instanceof ApiError) return json({ error: error.code, message: error.message, ...error.extra }, error.status, error.headers);
  const code = (error as { code?: string } | null)?.code ?? "";
  const unavailable = /^(08|53|57P0|ECONN|ETIMEDOUT|CONNECT_TIMEOUT|CONNECTION)/.test(code) || /No DATABASE_URL/.test(String((error as Error)?.message));
  if (!unavailable) console.error("[api]", error);
  return unavailable
    ? json({ error: "unavailable", message: "The database is unavailable. Try again shortly." }, 503)
    : json({ error: "server_error", message: "Something went wrong on the server." }, 500);
}

/** Wrap a route body so thrown ApiErrors (and anything unexpected) become JSON error responses. */
export function handle<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (error) {
      return errorResponse(error);
    }
  };
}

export const notFound = (what = "Not found") => new ApiError(404, "not_found", what);
export const badRequest = (message: string, code = "bad_request") => new ApiError(400, code, message);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (value: string) => UUID.test(value);
export function idParam(value: string) {
  if (!isUuid(value)) throw notFound("Post not found.");
  return value.toLowerCase();
}

export function intField(body: Record<string, unknown>, key: string) {
  const value = body[key];
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) throw badRequest(`${key} must be a non-negative integer.`, "invalid_body");
  return value;
}

/** Streams the body with a hard byte cap; 415 for non-JSON, 413 when too large, 400 for malformed JSON. */
export async function readJson(request: Request, maxBytes = 256_000): Promise<Record<string, unknown>> {
  if (!/^application\/json\b/i.test(request.headers.get("content-type") ?? "")) throw new ApiError(415, "unsupported_media_type", "Send application/json.");
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) throw new ApiError(413, "payload_too_large", `Keep the request under ${Math.round(maxBytes / 1000)} KB.`);
  const reader = request.body?.getReader();
  if (!reader) throw badRequest("The request body is empty.", "invalid_body");
  const parts: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel().catch(() => {});
      throw new ApiError(413, "payload_too_large", `Keep the request under ${Math.round(maxBytes / 1000)} KB.`);
    }
    parts.push(value);
  }
  try {
    const parsed: unknown = JSON.parse(Buffer.concat(parts).toString("utf8"));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    return parsed as Record<string, unknown>;
  } catch {
    throw badRequest("The request body is not a valid JSON object.", "invalid_json");
  }
}
