// ─────────────────────────────────────────────────────────────
// Demo-account gating (CWE-798): when DEMO_MODE is off, demo users
// (u_demo_*) are rejected by findUserByEmail AND by session lookup
// via getUserFromToken — even with a valid old signature.
// These tests run against the JSON store with production-mode env
// (demo mode off) set BEFORE importing lib/auth.
// ─────────────────────────────────────────────────────────────
import { describe, expect, it, beforeAll } from "vitest";
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

beforeAll(async () => {
  // seed a store that contains a persisted demo admin, like a
  // database that was migrated before the demo policy existed
  await fs.mkdir(DATA_DIR, { recursive: true });
  const users = [
    {
      id: "u_demo_admin",
      name: "Demo Admin",
      email: "admin@skillbridge.local",
      passwordHash: "salt:hash",
      role: "admin",
      createdAt: new Date().toISOString(),
      sessionVersion: 0,
    },
    {
      id: "u_real_1",
      name: "Real User",
      email: "real@test.dev",
      passwordHash: "salt:hash",
      role: "student",
      createdAt: new Date().toISOString(),
      sessionVersion: 0,
    },
  ];
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
});

// Import AFTER seeding and with NODE_ENV=production so DEMO_MODE=false;
// process.env.NODE_ENV is typed read-only under @types/node, so cast.
(process.env as Record<string, string>).NODE_ENV = "production";
process.env.AUTH_SECRET =
  process.env.AUTH_SECRET ?? "vitest-test-secret-0123456789abcdef0123";
const { findUserByEmail, createSessionToken, getUserFromToken, isDemoUserId } = await import("@/lib/auth");

describe("demo gating in production (DEMO_MODE off)", () => {
  it("treats u_demo_* ids as demo", () => {
    expect(isDemoUserId("u_demo_admin")).toBe(true);
    expect(isDemoUserId("u_real_1")).toBe(false);
  });

  it("refuses to resolve a persisted demo user by email for login", async () => {
    const user = await findUserByEmail("admin@skillbridge.local");
    expect(user).toBeUndefined();
  });

  it("still resolves real users by email", async () => {
    const user = await findUserByEmail("real@test.dev");
    expect(user).toBeDefined();
    expect(user?.id).toBe("u_real_1");
  });

  it("kills sessions signed for a demo user even if the signature is valid", async () => {
    // a token signed for the demo admin — as if issued before demo mode was disabled
    const token = createSessionToken("u_demo_admin", "admin", 30, 0);
    const resolved = await getUserFromToken(token);
    expect(resolved).toBeNull();
  });

  it("accepts valid tokens for real users", async () => {
    const token = createSessionToken("u_real_1", "student", 30, 0);
    const resolved = await getUserFromToken(token);
    expect(resolved?.id).toBe("u_real_1");
  });
});
