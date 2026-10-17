// ─────────────────────────────────────────────────────────────
// In-memory fixed-window rate limiter (MVP: single process).
// Swap for Upstash/Redis when we run serverless or multi-instance.
//
// Identity policy (CWE-307): the client IP comes only from
// proxy-controlled headers (x-real-ip / x-vercel-forwarded-for).
// The client-supplied first x-forwarded-for value is never used —
// an attacker cannot forge a fresh bucket by adding that header.
// ─────────────────────────────────────────────────────────────

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function rateLimit(
  key: string,
  max = 5,
  windowMs = 15 * 60 * 1000
): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  // occasional sweep so the map can't grow unbounded
  if (buckets.size > 10_000) {
    for (const [k, b] of buckets) if (b.resetAt < now) buckets.delete(k);
  }
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }
  b.count += 1;
  if (b.count > max) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((b.resetAt - now) / 1000)) };
  }
  return { ok: true, retryAfterSec: 0 };
}

/**
 * Trusted client IP. Only headers that an edge proxy sets (typically
 * overwriting any client-supplied value) are honoured:
 *   1. x-real-ip — set by most reverse proxies with the real socket peer
 *   2. x-vercel-forwarded-for — Vercel's proxy-set, right-most trusted value
 * A bare x-forwarded-for is ignored because its first value is
 * client-controlled when the request reaches the app directly.
 */
export function clientIp(req: Request): string {
  const real = req.headers.get("x-real-ip")?.trim();
  if (real) return real;
  const vercel = req.headers.get("x-vercel-forwarded-for")?.trim();
  if (vercel) {
    const last = vercel.split(",").map((s) => s.trim()).filter(Boolean).pop();
    if (last) return last;
  }
  return "local";
}

/**
 * Normalize an email into a per-account rate-limit bucket key so
 * header rotation cannot reset attempts on the same account.
 */
export function emailBucketKey(email: string): string {
  return `acct|${email.trim().toLowerCase()}`;
}

/**
 * Check BOTH the per-IP+email key (spoofable-limiting: slows scanner
 * churn) and the per-account email bucket (not spoofable at all).
 * The account bucket caps password guessing per account.
 */
export function authRateLimit(
  req: Request,
  email: string,
  max = 5,
  windowMs = 15 * 60 * 1000
): { ok: boolean; retryAfterSec: number } {
  const ipKey = `${clientIp(req)}|${emailBucketKey(email)}`;
  const ip = rateLimit(ipKey, max, windowMs);
  if (!ip.ok) return ip;
  return rateLimit(emailBucketKey(email), max, windowMs);
}
