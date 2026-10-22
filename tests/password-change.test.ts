import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUserFromToken: vi.fn(),
  tokenFromRequest: vi.fn(),
  verifyPassword: vi.fn(),
  hashPassword: vi.fn(),
  updatePasswordAndIncrementSession: vi.fn(),
  createSessionToken: vi.fn(),
  recordPasswordChangeAttempt: vi.fn(),
  ensureAccountSecurityDatabase: vi.fn(),
  sendEmail: vi.fn(),
  passwordChanged: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  createSessionToken: mocks.createSessionToken,
  getUserFromToken: mocks.getUserFromToken,
  hashPassword: mocks.hashPassword,
  SESSION_COOKIE: "sb_session",
  SESSION_MAX_AGE: 30 * 24 * 60 * 60,
  tokenFromRequest: mocks.tokenFromRequest,
  updatePasswordAndIncrementSession: mocks.updatePasswordAndIncrementSession,
  verifyPassword: mocks.verifyPassword,
}));

vi.mock("@/lib/account-security", () => ({
  ensureAccountSecurityDatabase: mocks.ensureAccountSecurityDatabase,
  recordPasswordChangeAttempt: mocks.recordPasswordChangeAttempt,
}));

vi.mock("@/lib/email", () => ({
  sendEmail: mocks.sendEmail,
  templates: { passwordChanged: mocks.passwordChanged },
}));

import { POST } from "@/app/api/account/security/password/route";

const user = {
  id: "user-42",
  name: "Asha Student",
  email: "asha@example.com",
  passwordHash: "stored-scrypt-hash",
  role: "student" as const,
  createdAt: new Date().toISOString(),
  sessionVersion: 6,
};

function request(values: Record<string, string>): Request {
  return new Request("http://localhost:3100/api/account/security/password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "http://localhost:3100",
      Cookie: "sb_session=valid-session",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0",
    },
    body: JSON.stringify(values),
  });
}

describe("POST /api/account/security/password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUserFromToken.mockResolvedValue(user);
    mocks.tokenFromRequest.mockReturnValue("valid-session");
    mocks.recordPasswordChangeAttempt.mockResolvedValue(1);
    mocks.verifyPassword.mockResolvedValue(true);
    mocks.hashPassword.mockResolvedValue("new-scrypt-hash");
    mocks.updatePasswordAndIncrementSession.mockResolvedValue(7);
    mocks.createSessionToken.mockReturnValue("renewed-current-session");
    mocks.passwordChanged.mockReturnValue({
      kind: "password-changed",
      subject: "Your password was changed",
      title: "Your password was changed",
      bodyHtml: "<p>changed</p>",
    });
    mocks.sendEmail.mockResolvedValue({ status: "sent", delivered: "resend", providerId: "email-id" });
  });

  it("rejects a wrong current password with a generic error", async () => {
    mocks.verifyPassword.mockResolvedValue(false);
    const response = await POST(request({
      currentPassword: "incorrect",
      newPassword: "Stronger2026!!",
      confirmPassword: "Stronger2026!!",
    }));
    expect(response.status).toBe(400);
    expect((await response.json()).error).toContain("Unable to update password");
    expect(mocks.updatePasswordAndIncrementSession).not.toHaveBeenCalled();
  });

  it("rejects weak or common passwords", async () => {
    const tooShort = await POST(request({
      currentPassword: "correct-current",
      newPassword: "short",
      confirmPassword: "short",
    }));
    expect(tooShort.status).toBe(400);
    expect((await tooShort.json()).error).toContain("10 characters");

    const common = await POST(request({
      currentPassword: "correct-current",
      newPassword: "password123",
      confirmPassword: "password123",
    }));
    expect(common.status).toBe(400);
    expect((await common.json()).error).toContain("common password");
    expect(mocks.verifyPassword).not.toHaveBeenCalled();
  });

  it("limits password-change attempts to five in the database window", async () => {
    mocks.recordPasswordChangeAttempt.mockResolvedValue(6);
    const response = await POST(request({
      currentPassword: "correct-current",
      newPassword: "Stronger2026!!",
      confirmPassword: "Stronger2026!!",
    }));
    expect(response.status).toBe(429);
    expect(mocks.verifyPassword).not.toHaveBeenCalled();
  });

  it("revokes other sessions while renewing the current session", async () => {
    const response = await POST(request({
      currentPassword: "correct-current",
      newPassword: "Stronger2026!!",
      confirmPassword: "Stronger2026!!",
    }));
    expect(response.status).toBe(200);
    expect(mocks.updatePasswordAndIncrementSession).toHaveBeenCalledWith(user.id, "new-scrypt-hash");
    expect(mocks.createSessionToken).toHaveBeenCalledWith(user.id, user.role, 30, 7);
    expect(response.cookies.get("sb_session")?.value).toBe("renewed-current-session");
    expect(mocks.sendEmail).toHaveBeenCalledTimes(1);
  });
});
