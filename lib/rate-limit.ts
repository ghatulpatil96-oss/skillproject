// ─────────────────────────────────────────────────────────────
// In-memory fixed-window rate limiter (MVP: single process).
// Good enough to blunt credential stuffing on the demo tier;
// swap for Upstash/Redis when we run serverless or multi-instance.
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

/** Best-effort client IP (behind Vercel/proxies this is x-forwarded-for). */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || "local";
}
