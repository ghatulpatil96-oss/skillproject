import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendEmail, templates } from "@/lib/email";

describe("Resend delivery handling", () => {
  const originalApiKey = process.env.RESEND_API_KEY;
  const originalFrom = process.env.EMAIL_FROM;
  const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  beforeEach(() => {
    process.env.RESEND_API_KEY = "test-only-resend-key";
    process.env.EMAIL_FROM = "SkillBridge <hello@example.com>";
    process.env.NEXT_PUBLIC_SITE_URL = "https://skillbridge.example";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    if (originalApiKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = originalApiKey;
    if (originalFrom === undefined) delete process.env.EMAIL_FROM;
    else process.env.EMAIL_FROM = originalFrom;
    if (originalSiteUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
  });

  it("returns the Resend response id for an accepted email", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "resend_email_id" }), { status: 200 })
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendEmail({
      to: "recipient@example.com",
      kind: "delivery-test",
      subject: "Delivery test",
      title: "Delivery test",
      bodyHtml: "<p>Test body</p>",
      text: "Test body",
    });

    expect(result.status).toBe("sent");
    expect(result.providerId).toBe("resend_email_id");
    const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body as string) as {
      from: string;
      text: string;
    };
    expect(requestBody.from).toBe("SkillBridge <hello@example.com>");
    expect(requestBody.text).toBe("Test body");
  });

  it("reads Resend's error object and does not report a failed send as delivered", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: { message: "Invalid sender" } }), { status: 422 })
      )
    );
    vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await sendEmail({
      to: "recipient@example.com",
      kind: "delivery-test",
      subject: "Delivery test",
      title: "Delivery test",
      bodyHtml: "<p>Test body</p>",
    });

    expect(result.status).toBe("failed");
    expect(result.error).toContain("Invalid sender");
    expect(result.delivered).toBe("failed");
  });

  it("builds the login alert with IST/device details and a production-site reset link", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "login-alert-id" }), { status: 200 })
    );
    vi.stubGlobal("fetch", fetchMock);
    const template = templates.loginNotice("Asha <Student>", {
      time: "22 Oct 2026, 10:30 pm IST (Asia/Kolkata)",
      browser: "Google Chrome",
      operatingSystem: "Windows",
      location: "Pune, IN",
      ip: "203.0.x.x",
    });

    expect(template.subject).toBe("New login to your SkillBridge account");
    const result = await sendEmail({ to: "asha@example.com", ...template });
    expect(result.status).toBe("sent");
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string) as {
      html: string;
      text: string;
    };
    expect(body.html).toContain("Asha &lt;Student&gt;");
    expect(body.html).toContain("Google Chrome");
    expect(body.html).toContain("Windows");
    expect(body.html).toContain("Pune, IN");
    expect(body.html).toContain("https://skillbridge.example/forgot-password");
    expect(body.text).toContain("203.0.x.x");
    expect(body.text).toContain("Wasn't you? Reset your password");
    expect(body.text).not.toContain("localhost");
  });
});
