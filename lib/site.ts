// ─────────────────────────────────────────────────────────────
// Canonical site URL — one place so emails, metadata, sitemap
// and robots all agree (set NEXT_PUBLIC_SITE_URL in production).
// ─────────────────────────────────────────────────────────────
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100";
}
