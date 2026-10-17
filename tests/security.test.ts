// ─────────────────────────────────────────────────────────────
// Unit tests for the security behaviours called out in the review:
//   1. safeNext() — open-redirect / javascript: guard (#9)
//   2. the signup email check — linear-time validation (#12)
//   3. assertSameOrigin() — cross-site form submission guard (#1 #4 #6)
// ─────────────────────────────────────────────────────────────
import { describe, expect, it } from "vitest";
import { safeNext, safeNextForRole } from "@/lib/safe-next";
import { assertSameOrigin } from "@/lib/security";

// login-page redirect target validation
describe("safeNext", () => {
  it("accepts a same-origin path with search", () => {
    expect(safeNext("/jobs?selected=j1", "http://localhost:3100")).toBe(
      "/jobs?selected=j1"
    );
  });

  it("accepts a bare path", () => {
    expect(safeNext("/roadmaps", "http://localhost:3100")).toBe("/roadmaps");
  });

  it("rejects javascript: URLs", () => {
    expect(safeNext("javascript:alert(1)", "http://localhost:3100")).toBe("/");
  });

  it("rejects protocol-relative URLs (//evil)", () => {
    expect(safeNext("//evil.example", "http://localhost:3100")).toBe("/");
  });

  it("rejects backslash protocol-relative URLs (/\\evil)", () => {
    expect(safeNext("/\\evil.example", "http://localhost:3100")).toBe("/");
  });

  it("rejects absolute URLs on a foreign origin", () => {
    expect(safeNext("https://evil.example/phish", "http://localhost:3100")).toBe("/");
  });

  it("rejects null/undefined/empty", () => {
    expect(safeNext(null, "http://localhost:3100")).toBe("/");
    expect(safeNext(undefined, "http://localhost:3100")).toBe("/");
    expect(safeNext("", "http://localhost:3100")).toBe("/");
  });
});

describe("safeNextForRole", () => {
  it("preserves a valid destination the role can access", () => {
    expect(
      safeNextForRole("/jobs?selected=j1", "student", "https://app.example")
    ).toBe("/jobs?selected=j1");
    expect(
      safeNextForRole("/recruiter/post", "recruiter", "https://app.example")
    ).toBe("/recruiter/post");
    expect(
      safeNextForRole("/admin/integrity", "admin", "https://app.example")
    ).toBe("/admin/integrity");
  });

  it("falls back when the destination is outside the user's role", () => {
    expect(
      safeNextForRole("/recruiter/post", "student", "https://app.example", "/jobs")
    ).toBe("/jobs");
    expect(
      safeNextForRole("/admin", "recruiter", "https://app.example")
    ).toBe("/recruiter");
  });

  it("falls back for unsafe destinations", () => {
    expect(
      safeNextForRole("https://evil.example", "student", "https://app.example")
    ).toBe("/roadmaps");
  });
});

// signup email validation runs with a linear-time pattern and a
// length cap; import the same expression semantics via a local
// mirror kept in sync with app/api/auth/signup/route.ts.
const MAX_EMAIL_LENGTH = 254;
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

function emailValid(email: string): boolean {
  return email.length <= MAX_EMAIL_LENGTH && EMAIL_RE.test(email);
}

describe("signup email validation", () => {
  it("accepts a normal address", () => {
    expect(emailValid("ananya@student.in")).toBe(true);
    expect(emailValid("first.last+tag@sub.domain.co")).toBe(true);
  });

  it("rejects emails without a proper domain", () => {
    expect(emailValid("nodomain@localhost")).toBe(false);
    expect(emailValid("a@b")).toBe(false);
    expect(emailValid("no-at-sign")).toBe(false);
  });

  it("rejects emails longer than 254 characters", () => {
    const long = "a".repeat(300) + "@example.com";
    expect(long.length).toBeGreaterThan(254);
    expect(emailValid(long)).toBe(false);
  });

  it("runs in bounded time even on pathological input", () => {
    // previously quadratic: 'a@' + 'x.x.' repeated hundreds of times
    const evil = "ab@" + "x.".repeat(500);
    const start = Date.now();
    emailValid(evil);
    expect(Date.now() - start).toBeLessThan(50);
  });
});

// same-origin enforcement for mutating API routes
function reqWith(headers: Record<string, string>): Request {
  return new Request("http://localhost:3100/api/auth/login", {
    method: "POST",
    headers,
  });
}

describe("assertSameOrigin", () => {
  it("allows a request with no Origin header", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3100";
    expect(await assertSameOrigin(reqWith({}))).toBe(true);
  });

  it("allows the configured origin", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3100";
    expect(
      await assertSameOrigin(reqWith({ origin: "http://localhost:3100" }))
    ).toBe(true);
  });

  it("allows the app's alternate local dev origin", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3001";
    expect(
      await assertSameOrigin(reqWith({ origin: "http://localhost:3100" }))
    ).toBe(true);
  });

  it("rejects a foreign origin", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3100";
    expect(
      await assertSameOrigin(reqWith({ origin: "https://evil.example" }))
    ).toBe(false);
  });

  it("does not allow the alternate local origin in production", async () => {
    const previousNodeEnv = process.env.NODE_ENV;
    try {
      process.env.NODE_ENV = "production";
      process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3001";
      expect(
        await assertSameOrigin(reqWith({ origin: "http://localhost:3100" }))
      ).toBe(false);
    } finally {
      process.env.NODE_ENV = previousNodeEnv;
    }
  });

  it("rejects an origin that merely contains the expected host", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3100";
    expect(
      await assertSameOrigin(
        reqWith({ origin: "http://localhost:3100.evil.example" })
      )
    ).toBe(false);
  });
});
