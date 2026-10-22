import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createSessionToken: vi.fn(),
  findUserByEmail: vi.fn(),
  publicUser: vi.fn(),
  verifyPassword: vi.fn(),
  sendEmail: vi.fn(),
  loginNotice: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  createSessionToken: mocks.createSessionToken,
  findUserByEmail: mocks.findUserByEmail,
  publicUser: mocks.publicUser,
  SESSION_COOKIE: "sb_session",
  SESSION_MAX_AGE: 30 * 24 * 60 * 60,
  verifyPassword: mocks.verifyPassword,
}));

vi.mock("@/lib/email", () => ({
  sendEmail: mocks.sendEmail,
  templates: { loginNotice: mocks.loginNotice },
}));

import { POST } from "@/app/api/auth/login/route";

function loginRequest(email: string): Request {
  return new Request("http://localhost:3100/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "http://localhost:3100",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0",
      "x-real-ip": "203.0.113.42",
    },
    body: JSON.stringify({ email, password: "correct-password" }),
  });
}

function user(email: string, emailLoginNotifications = true) {
  return {
    id: "user-1",
    name: "Asha Student",
    email,
    passwordHash: "salt:hash",
    role: "student" as const,
    createdAt: new Date().toISOString(),
    sessionVersion: 3,
    emailLoginNotifications,
  };
}

describe("login email notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createSessionToken.mockReturnValue("signed-session");
    mocks.findUserByEmail.mockImplementation(async (email: string) => user(email));
    mocks.publicUser.mockImplementation((value: ReturnType<typeof user>) => {
      const { passwordHash: _passwordHash, ...safeUser } = value;
      return safeUser;
    });
    mocks.verifyPassword.mockResolvedValue(true);
    mocks.loginNotice.mockReturnValue({
      kind: "login-alert",
      subject: "New login to your SkillBridge account",
      title: "New login to your SkillBridge account",
      bodyHtml: "<p>login notice</p>",
    });
    mocks.sendEmail.mockResolvedValue({ status: "sent", delivered: "resend", providerId: "email-id" });
  });

  it("sends a login email only after successful credential verification", async () => {
    const email = `success-${Date.now()}@example.com`;
    const response = await POST(loginRequest(email));
    expect(response.status).toBe(200);
    expect(mocks.sendEmail).toHaveBeenCalledTimes(1);
    expect(mocks.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: email, kind: "login-alert" })
    );
  });

  it("does not send on a failed login", async () => {
    mocks.verifyPassword.mockResolvedValue(false);
    const response = await POST(loginRequest(`failure-${Date.now()}@example.com`));
    expect(response.status).toBe(401);
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });

  it("keeps login successful if sending the email fails", async () => {
    mocks.sendEmail.mockRejectedValue(new Error("provider unavailable"));
    const response = await POST(loginRequest(`mail-failure-${Date.now()}@example.com`));
    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain("sb_session");
  });

  it("respects the user's login-email opt-out", async () => {
    const email = `opt-out-${Date.now()}@example.com`;
    mocks.findUserByEmail.mockResolvedValue(user(email, false));
    const response = await POST(loginRequest(email));
    expect(response.status).toBe(200);
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });
});
