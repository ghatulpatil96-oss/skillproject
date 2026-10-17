// ─────────────────────────────────────────────────────────────
// Request hardening helpers shared by all mutating API routes.
//   assertSameOrigin(req) — Origin must equal getSiteUrl()'s origin.
//   readJson(req)         — content-type must be application/json and
//                           the body at most 10 KB.
// ─────────────────────────────────────────────────────────────
import { getSiteUrl } from "@/lib/site";

const MAX_JSON_BODY_BYTES = 10 * 1024;

export type ReadJsonResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: 400 | 403 | 413 | 415; error: string };

function originOf(value: string): string | null {
  try {
    const url = new URL(value);
    // originOf values must already be absolute URLs
    return url.origin;
  } catch {
    return null;
  }
}

/**
 * Reject requests whose Origin header does not match the configured
 * application origin. Defends login, signup, logout and other
 * mutations against cross-site form submissions (CWE-352).
 *
 * Missing Origin (same-origin GET-style or non-browser clients) is
 * allowed; a present Origin that mismatches is rejected.
 */
export async function assertSameOrigin(req: Request): Promise<boolean> {
  const origin = req.headers.get("origin");
  if (!origin) return true; // no Origin header → not a cross-site form POST
  const requestOrigin = originOf(origin);
  const expected = originOf(getSiteUrl());
  if (!requestOrigin) return false;

  if (requestOrigin === expected) return true;

  if (process.env.NODE_ENV !== "production") {
    const localOrigins = new Set([
      "http://localhost:3001",
      "http://localhost:3100",
      "http://127.0.0.1:3001",
      "http://127.0.0.1:3100",
    ]);
    return localOrigins.has(requestOrigin);
  }

  return false;
}

/**
 * Read a JSON body under 10 KB that was explicitly sent as
 * application/json. Text/plain HTML forms and oversized payloads
 * fail fast instead of reaching business logic.
 */
export async function readJson<T>(req: Request): Promise<ReadJsonResult<T>> {
  const contentType = req.headers.get("content-type") ?? "";
  const mime = contentType.split(";")[0].trim().toLowerCase();
  if (mime !== "application/json") {
    return { ok: false, status: 415, error: "Expected application/json." };
  }

  const declared = Number(req.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > MAX_JSON_BODY_BYTES) {
    return { ok: false, status: 413, error: "Body exceeds 10 KB." };
  }

  const text = await req.text();
  if (new TextEncoder().encode(text).byteLength > MAX_JSON_BODY_BYTES) {
    return { ok: false, status: 413, error: "Body exceeds 10 KB." };
  }

  try {
    return { ok: true, data: JSON.parse(text) as T };
  } catch {
    return { ok: false, status: 400, error: "Invalid JSON." };
  }
}
