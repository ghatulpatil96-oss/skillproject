// ─────────────────────────────────────────────────────────────
// Quota-lock test (CWE-362): the attempt quota is consumed inside
// the same locked transaction as the insert. On the JSON backend we
// can only verify the rejection logic; the Postgres path is exercised
// by pg_advisory_xact_lock in production.
// ─────────────────────────────────────────────────────────────
import { describe, expect, it, beforeEach } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import { addAttemptWithQuota, attemptsByUser } from "@/lib/store";

const DATA_DIR = path.join(process.cwd(), ".data");
const ATTEMPTS_FILE = path.join(DATA_DIR, "attempts.json");

beforeEach(async () => {
  await fs.rm(DATA_DIR, { recursive: true, force: true });
});

function attempt(n: number) {
  return {
    userId: "u_quota_test",
    skillId: "javascript",
    score: 60 + n,
    percentile: 50,
    passed: false,
    answers: { "js-q1": 1 },
    integrityFlags: 0,
  };
}

describe("addAttemptWithQuota", () => {
  it("admits attempts until the 30-day limit, then refuses", async () => {
    for (let i = 0; i < 3; i++) {
      const res = await addAttemptWithQuota(attempt(i), 3);
      expect(res.ok).toBe(true);
    }
    const rejected = await addAttemptWithQuota(attempt(99), 3);
    expect(rejected.ok).toBe(false);
    if (!rejected.ok) expect(rejected.attemptsLeft).toBe(0);
    // storage still has exactly 3
    const stored = JSON.parse(await fs.readFile(ATTEMPTS_FILE, "utf-8"));
    expect(stored.length).toBe(3);
  });

  it("counts only attempts in the rolling 30-day window", async () => {
    // an old attempt outside the window does not consume quota
    const stale = { ...attempt(1), createdAt: new Date(Date.now() - 40 * 86_400_000).toISOString() };
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(ATTEMPTS_FILE, JSON.stringify([stale]), "utf-8");
    const res = await addAttemptWithQuota(attempt(2), 3);
    expect(res.ok).toBe(true);
    expect((await attemptsByUser("u_quota_test")).length).toBe(2);
  });

  it("scopes the limit per user+skill", async () => {
    for (let i = 0; i < 3; i++) await addAttemptWithQuota(attempt(i), 3);
    // same skill, different user → fresh quota
    const other = await addAttemptWithQuota({ ...attempt(0), userId: "u_other" }, 3);
    expect(other.ok).toBe(true);
    // same user, different skill → fresh quota
    const otherSkill = await addAttemptWithQuota({ ...attempt(0), skillId: "sql" }, 3);
    expect(otherSkill.ok).toBe(true);
  });
});
