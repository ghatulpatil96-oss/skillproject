import { createHash } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  tokenHash: "",
  userId: "user-42",
  expiresAt: 0,
  used: false,
  sessionVersion: 4,
  passwordHash: null as string | null,
}));

vi.mock("@/lib/db", () => ({
  dbReady: vi.fn().mockResolvedValue(undefined),
  hasDb: vi.fn().mockReturnValue(true),
  requireDb: vi.fn(),
  query: vi.fn(),
  withTransaction: vi.fn(async (callback: (client: { query: (sql: string, params: unknown[]) => Promise<{ rows: unknown[] }> }) => Promise<unknown>) => {
    const client = {
      query: async (sql: string, params: unknown[] = []) => {
        if (sql.includes("update password_reset_tokens")) {
          if (
            params[0] === state.tokenHash &&
            !state.used &&
            state.expiresAt > Date.now()
          ) {
            state.used = true;
            return { rows: [{ user_id: state.userId }] };
          }
          return { rows: [] };
        }
        if (sql.includes("update users")) {
          state.passwordHash = String(params[1]);
          state.sessionVersion += 1;
          return { rows: [{ session_version: state.sessionVersion }] };
        }
        return { rows: [] };
      },
    };
    return callback(client);
  }),
}));

import { resetPasswordWithToken } from "@/lib/account-security";

const rawToken = "test-reset-token-value-that-is-long-enough-for-hashing";

describe("password reset token lifetime and use", () => {
  beforeEach(() => {
    state.tokenHash = createHash("sha256").update(rawToken).digest("hex");
    state.userId = "user-42";
    state.expiresAt = Date.now() + 60_000;
    state.used = false;
    state.sessionVersion = 4;
    state.passwordHash = null;
  });

  it("rejects expired reset tokens", async () => {
    state.expiresAt = Date.now() - 1;
    const reset = await resetPasswordWithToken(rawToken, "new-password-hash");
    expect(reset).toBeUndefined();
    expect(state.used).toBe(false);
    expect(state.passwordHash).toBeNull();
  });

  it("allows a valid token once and rejects reuse", async () => {
    const first = await resetPasswordWithToken(rawToken, "new-password-hash");
    const second = await resetPasswordWithToken(rawToken, "another-password-hash");
    expect(first).toEqual({ userId: "user-42", sessionVersion: 5 });
    expect(second).toBeUndefined();
    expect(state.passwordHash).toBe("new-password-hash");
    expect(state.sessionVersion).toBe(5);
  });
});
