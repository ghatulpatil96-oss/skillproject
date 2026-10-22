let warnedAboutResendTestSender = false;

export function validateProductionEmailConfiguration(): void {
  if (process.env.NODE_ENV !== "production") return;
  if (!process.env.RESEND_API_KEY) {
    throw new Error("[SkillBridge] RESEND_API_KEY is required in production.");
  }
  if (!process.env.EMAIL_FROM) {
    throw new Error("[SkillBridge] EMAIL_FROM is required in production.");
  }
  const emailFrom = process.env.EMAIL_FROM.trim();
  if (/(?:^|<)onboarding@resend\.dev>?$/i.test(emailFrom) && !warnedAboutResendTestSender) {
    warnedAboutResendTestSender = true;
    console.warn(
      "[SkillBridge] EMAIL_FROM uses onboarding@resend.dev, which only delivers to the email on your Resend account."
    );
  }
  if (!/^.+ <[^<>\s@]+@[^<>\s@]+\.[^<>\s@]+>$/.test(emailFrom)) {
    throw new Error(
      "[SkillBridge] EMAIL_FROM must use the format Display Name <address@verified-domain.com>."
    );
  }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    throw new Error("[SkillBridge] NEXT_PUBLIC_SITE_URL is required in production email links.");
  }
  let parsedSiteUrl: URL;
  try {
    parsedSiteUrl = new URL(siteUrl);
  } catch {
    throw new Error("[SkillBridge] NEXT_PUBLIC_SITE_URL must be an absolute production URL.");
  }
  if (
    parsedSiteUrl.protocol !== "https:" ||
    /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(parsedSiteUrl.host)
  ) {
    throw new Error("[SkillBridge] NEXT_PUBLIC_SITE_URL must use HTTPS and must not point to localhost.");
  }
}
