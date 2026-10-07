import { NextRequest, NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────
// Edge middleware — verifies the signed session cookie with Web
// Crypto only (no node:crypto / fs in the middleware runtime).
// The `role` lives inside the HMAC-signed payload, so a client
// cannot elevate itself without breaking the signature.
// Server layouts re-check the role against the user store
// (defence in depth).
// ─────────────────────────────────────────────────────────────

const SESSION_COOKIE = "sb_session";

type Role = "student" | "recruiter" | "admin";
type Payload = { userId: string; role: Role; exp: number };

const GATES: { prefix: string; roles: Role[] }[] = [
  { prefix: "/recruiter", roles: ["recruiter", "admin"] },
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/api/emails", roles: ["admin"] },
  { prefix: "/dev-inbox", roles: ["admin"] },
];

const enc = new TextEncoder();

function b64urlToBytes(s: string): Uint8Array {
  const pad = s.length % 4 ? "=".repeat(4 - (s.length % 4)) : "";
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function bytesToB64url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Same-length, always-full-scan comparison of two strings. */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hmacSign(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return bytesToB64url(new Uint8Array(sig));
}

let warned = false;
function getSecret(): string | null {
  const s = process.env.AUTH_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV !== "production") return s ?? "skillbridge-dev-secret-change-in-production";
  if (!warned) {
    warned = true;
    console.error("[middleware] AUTH_SECRET missing/short in production — gated routes will deny access.");
  }
  return null;
}

async function verify(token: string | undefined, secret: string | null): Promise<Payload | null> {
  if (!token || !secret) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = await hmacSign(body, secret);
  if (!constantTimeEqual(expected, sig)) return null;
  try {
    const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(body))) as Payload;
    if (!payload.userId || !payload.role || typeof payload.exp !== "number") return null;
    if (payload.exp < Date.now()) return null; // expired
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProd = process.env.NODE_ENV === "production";
  const isApi = pathname.startsWith("/api/");

  // Dev Inbox is a build/dev tool — it must not exist in production at all.
  if (pathname === "/dev-inbox" || pathname.startsWith("/dev-inbox/")) {
    if (isProd) return new NextResponse(null, { status: 404 });
  }

  const gate = GATES.find((g) => pathname.startsWith(g.prefix));
  if (gate) {
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    const payload = await verify(token, getSecret());

    if (!payload) {
      if (isApi) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.search = "";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    if (!gate.roles.includes(payload.role)) {
      if (isApi) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/recruiter/:path*",
    "/admin/:path*",
    "/api/emails/:path*",
    "/dev-inbox",
    "/dev-inbox/:path*",
  ],
};
