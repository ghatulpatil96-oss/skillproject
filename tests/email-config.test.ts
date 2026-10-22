import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { validateProductionEmailConfiguration } from "@/lib/email-config";

const env = process.env as Record<string, string | undefined>;
const originalValues = {
  nodeEnv: process.env.NODE_ENV,
  resendApiKey: process.env.RESEND_API_KEY,
  emailFrom: process.env.EMAIL_FROM,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
};

describe("production email configuration", () => {
  beforeEach(() => {
    env.NODE_ENV = "production";
    delete process.env.RESEND_API_KEY;
    delete process.env.EMAIL_FROM;
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  afterEach(() => {
    env.NODE_ENV = originalValues.nodeEnv;
    if (originalValues.resendApiKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = originalValues.resendApiKey;
    if (originalValues.emailFrom === undefined) delete process.env.EMAIL_FROM;
    else process.env.EMAIL_FROM = originalValues.emailFrom;
    if (originalValues.siteUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = originalValues.siteUrl;
  });

  it("fails clearly when the Resend API key is missing", () => {
    expect(() => validateProductionEmailConfiguration()).toThrow("RESEND_API_KEY is required");
  });

  it("fails clearly when the sender is missing or malformed", () => {
    process.env.RESEND_API_KEY = "test-only-key";
    expect(() => validateProductionEmailConfiguration()).toThrow("EMAIL_FROM is required");
    process.env.EMAIL_FROM = "invalid-sender";
    expect(() => validateProductionEmailConfiguration()).toThrow("Display Name");
  });

  it("requires an HTTPS public site URL for email links", () => {
    process.env.RESEND_API_KEY = "test-only-key";
    process.env.EMAIL_FROM = "SkillBridge <hello@example.com>";
    expect(() => validateProductionEmailConfiguration()).toThrow("NEXT_PUBLIC_SITE_URL is required");
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3100";
    expect(() => validateProductionEmailConfiguration()).toThrow("must use HTTPS");
  });

  it("accepts a verified-domain sender and HTTPS site URL", () => {
    process.env.RESEND_API_KEY = "test-only-key";
    process.env.EMAIL_FROM = "SkillBridge <hello@example.com>";
    process.env.NEXT_PUBLIC_SITE_URL = "https://skillbridge.example";
    expect(() => validateProductionEmailConfiguration()).not.toThrow();
  });
});
