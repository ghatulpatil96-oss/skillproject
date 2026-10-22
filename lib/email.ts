// ─────────────────────────────────────────────────────────────
// Email pipeline — production sends via Resend; local development
// without a key stores to an outbox rendered in /dev-inbox.
// Covers PRD F5.4 notifications with clean HTML templates.
//
// Security: every interpolated value passes escapeHtml(), and
// CTA URLs are validated against the canonical site origin, so a
// malicious name/company/jobTitle can never inject markup or
// redirect users off-site.
// ─────────────────────────────────────────────────────────────
import { promises as fs } from "fs";
import path from "path";
import { getSiteUrl } from "@/lib/site";
import { hasDb, query } from "@/lib/db";
import { validateProductionEmailConfiguration } from "@/lib/email-config";

const DATA_DIR = process.env.SKILLBRIDGE_DATA_DIR ?? path.join(process.cwd(), ".data");
const OUTBOX_FILE = path.join(DATA_DIR, "outbox.json");

export type Email = {
  id: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  kind: string;
  createdAt: string;
  delivered: "resend" | "outbox" | "failed";
  status: "sent" | "failed" | "outbox";
  providerId?: string;
  error?: string;
};

// ── outbox persistence (Postgres when DATABASE_URL is set) ──
async function saveOutboxEmail(email: Email): Promise<void> {
  if (hasDb()) {
    await query(
      `insert into outbox (id, to_email, subject, html, text, kind, delivered, created_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8) on conflict (id) do nothing`,
      [email.id, email.to, email.subject, email.html, email.text, email.kind,
       email.delivered, email.createdAt]
    );
    return;
  }
  const outbox = await readOutboxJson();
  outbox.push(email);
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(OUTBOX_FILE, JSON.stringify(outbox.slice(-200), null, 2));
}

async function logEmailAttempt(input: {
  to: string;
  kind: string;
  status: Email["status"];
  providerId?: string;
  error?: string;
  createdAt: string;
}): Promise<void> {
  if (hasDb()) {
    await query(
      `insert into email_log (to_email, template, status, provider_id, error, created_at)
       values ($1, $2, $3, $4, $5, $6)`,
      [input.to, input.kind, input.status, input.providerId ?? null, input.error ?? null, input.createdAt]
    );
    return;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("[SkillBridge] DATABASE_URL is required to log production email attempts.");
  }
}
async function readOutboxJson(): Promise<Email[]> {
  try {
    return JSON.parse(await fs.readFile(OUTBOX_FILE, "utf-8")) as Email[];
  } catch {
    return [];
  }
}

// ── sanitisation helpers ─────────────────────────────────────
export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function esc(value: unknown): string {
  return escapeHtml(value);
}

/** Only same-origin absolute URLs or site-relative paths survive. */
export function safeCtaUrl(url: string): string {
  const base = getSiteUrl();
  try {
    const resolved = url.startsWith("/") ? new URL(url, base) : new URL(url);
    if (resolved.origin !== new URL(base).origin) return new URL("/", base).toString();
    return resolved.toString();
  } catch {
    return new URL("/", base).toString();
  }
}

// ── HTML template wrapper (brand tokens: cream / ink / coral) ─
function wrap(title: string, bodyHtml: string, cta?: { label: string; url: string }): string {
  const safeCta = cta ? { label: esc(cta.label), url: safeCtaUrl(cta.url) } : undefined;
  return `<!DOCTYPE html>
<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0" /><style>@media(max-width:600px){.email-card{margin:12px auto!important}.email-content{padding:24px 18px!important}.email-header{padding:18px!important}}</style></head><body style="margin:0;padding:0;background:#FFF9F6;font-family:Inter,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div class="email-card" style="width:calc(100% - 24px);max-width:560px;margin:32px auto;background:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid #F0E2D9;">
    <div class="email-header" style="background:#FF8A5E;padding:20px 32px;">
      <span style="color:#0F151D;font-size:20px;font-weight:700;letter-spacing:-0.5px;">SkillBridge<span style="color:#0F151D;">.</span></span>
    </div>
    <div class="email-content" style="padding:32px;">
      <h1 style="margin:0 0 12px;font-size:20px;color:#0F151D;">${esc(title)}</h1>
      <div style="font-size:14px;line-height:1.7;color:#4A5563;">${bodyHtml}</div>
      ${
        safeCta
          ? `<a href="${safeCta.url}" style="display:inline-block;margin-top:24px;background:#FF8A5E;color:#0F151D;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:999px;">${safeCta.label}</a>`
          : ""
      }
    </div>
    <div style="padding:16px 32px;border-top:1px solid #F0E2D9;font-size:11px;color:#7A8494;">
      You're receiving this because you have a SkillBridge account.
      Skill-based hiring for tier 2/3 college students.
    </div>
  </div>
</body></html>`;
}

// ── send ─────────────────────────────────────────────────────
export async function sendEmail(input: {
  to: string;
  subject: string;
  kind: string;
  title: string;
  bodyHtml: string;
  text?: string;
  cta?: { label: string; url: string };
}): Promise<Email> {
  validateProductionEmailConfiguration();
  if (process.env.NODE_ENV === "production" && !hasDb()) {
    throw new Error("[SkillBridge] DATABASE_URL is required for production email logging.");
  }

  const html = wrap(input.title, input.bodyHtml, input.cta);
  const textBody =
    input.text ?? input.bodyHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const text = `${textBody}${
    input.cta ? `\n\n${input.cta.label}: ${safeCtaUrl(input.cta.url)}` : ""
  }`;
  const createdAt = new Date().toISOString();

  const email: Email = {
    id: `e_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    to: input.to,
    subject: input.subject,
    html,
    text,
    kind: input.kind,
    createdAt,
    delivered: "outbox",
    status: "outbox",
  };

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM,
          to: [input.to],
          subject: input.subject,
          html,
          text,
        }),
      });
      let response: {
        id?: unknown;
        message?: unknown;
        name?: unknown;
        error?: { message?: unknown; name?: unknown; code?: unknown } | string;
      } = {};
      let errorMessage: string | undefined;
      try {
        response = (await res.json()) as typeof response;
      } catch {
        errorMessage = `Resend returned an unreadable response (HTTP ${res.status}).`;
      }
      const providerErrorParts =
        typeof response.error === "object" && response.error
          ? [response.error.message, response.error.name, response.error.code]
          : [response.error, response.message, response.name];
      const providerError = providerErrorParts
        .filter((part): part is string => typeof part === "string" && part.length > 0)
        .join(": ") || undefined;
      if (res.ok && !providerError && typeof response.id === "string" && response.id) {
        email.delivered = "resend";
        email.status = "sent";
        email.providerId = response.id;
      } else {
        errorMessage ??=
          providerError ?? `Resend did not accept the email (HTTP ${res.status}).`;
      }
      if (errorMessage) {
        email.status = "failed";
        email.error = errorMessage.slice(0, 500);
        console.error(`[email] Resend send failed for template "${input.kind}": ${email.error}`);
      }
    } catch (err) {
      email.status = "failed";
      email.error = err instanceof Error ? err.message.slice(0, 500) : "Resend request failed.";
      console.error(`[email] Resend request failed for template "${input.kind}".`);
    }
  }

  if (email.status === "outbox") {
    if (process.env.NODE_ENV === "production") {
      email.status = "failed";
      email.error = "Resend is not configured; production email cannot use the development outbox.";
    } else {
      await saveOutboxEmail(email);
    }
  }
  if (email.status === "failed") email.delivered = "failed";
  await logEmailAttempt({
    to: input.to,
    kind: input.kind,
    status: email.status,
    providerId: email.providerId,
    error: email.error,
    createdAt,
  });
  return email;
}

// ── notification templates (PRD F5.4) ────────────────────────
// Every interpolated value is escaped; numbers are coerced via Number().
export const templates = {
  loginNotice(
    name: string,
    details: { time: string; browser: string; operatingSystem: string; location?: string; ip: string }
  ) {
    const locationLine = details.location ? `<li><strong>Approximate location:</strong> ${esc(details.location)}</li>` : "";
    const plainLocation = details.location ? `\nApproximate location: ${details.location}` : "";
    return {
      kind: "login-alert",
      subject: "New login to your SkillBridge account",
      title: "New login to your SkillBridge account",
      bodyHtml: `<p>Hi ${esc(name)},</p>
        <p>Your SkillBridge account was just used to log in. If this was you, no action is needed.</p>
        <ul style="padding-left:20px;line-height:1.8">
          <li><strong>Time:</strong> ${esc(details.time)}</li>
          <li><strong>Browser:</strong> ${esc(details.browser)}</li>
          <li><strong>Operating system:</strong> ${esc(details.operatingSystem)}</li>
          ${locationLine}
          <li><strong>IP address:</strong> ${esc(details.ip)}</li>
        </ul>`,
      text: `Hi ${name},\n\nYour SkillBridge account was just used to log in. If this was you, no action is needed.\n\nTime: ${details.time}\nBrowser: ${details.browser}\nOperating system: ${details.operatingSystem}${plainLocation}\nIP address: ${details.ip}`,
      cta: { label: "Wasn't you? Reset your password", url: "/forgot-password" },
    };
  },

  passwordChanged(
    name: string,
    details: { time: string; browser: string; operatingSystem: string },
    resetUrl = "/forgot-password"
  ) {
    return {
      kind: "password-changed",
      subject: "Your password was changed",
      title: "Your password was changed",
      bodyHtml: `<p>Hi ${esc(name)},</p>
        <p>The password for your SkillBridge account was changed.</p>
        <ul style="padding-left:20px;line-height:1.8">
          <li><strong>Time:</strong> ${esc(details.time)}</li>
          <li><strong>Browser:</strong> ${esc(details.browser)}</li>
          <li><strong>Operating system:</strong> ${esc(details.operatingSystem)}</li>
        </ul>`,
      text: `Hi ${name},\n\nThe password for your SkillBridge account was changed.\n\nTime: ${details.time}\nBrowser: ${details.browser}\nOperating system: ${details.operatingSystem}`,
      cta: { label: "Wasn't you? Reset it now", url: resetUrl },
    };
  },

  passwordReset(name: string, resetUrl: string) {
    return {
      kind: "password-reset",
      subject: "Reset your SkillBridge password",
      title: "Reset your password",
      bodyHtml: `<p>Hi ${esc(name)},</p>
        <p>We received a request to reset your SkillBridge password. This link expires in one hour and can only be used once. If you did not request this, you can ignore this email.</p>`,
      text: `Hi ${name},\n\nWe received a request to reset your SkillBridge password. This link expires in one hour and can only be used once. If you did not request this, you can ignore this email.`,
      cta: { label: "Reset password", url: resetUrl },
    };
  },

  contactMessage(name: string, email: string, topic: string, message: string) {
    return {
      kind: "contact",
      subject: "New SkillBridge contact message",
      title: "New contact form message",
      bodyHtml: `<p><strong>From:</strong> ${esc(name)} &lt;${esc(email)}&gt;</p>
        <p><strong>Topic:</strong> ${esc(topic)}</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:12px 0" />
        <p>${esc(message).replace(/\n/g, "<br/>")}</p>`,
    };
  },

  welcome(name: string, role: string) {
    return {
      kind: "welcome",
      subject: "Welcome to SkillBridge",
      title: `Welcome aboard, ${esc(name)}!`,
      bodyHtml:
        role === "recruiter"
          ? `<p>Your recruiter account is being verified — you'll get an email the moment it's approved (usually within 24h).</p>
             <p>While you wait, you can explore the candidate search and draft your first job post.</p>`
          : `<p>You just joined students from tier 2/3 colleges learning job-ready skills.</p>
             <p><strong>Your next steps:</strong></p>
             <p>&#8226; Pick a roadmap (Frontend, Backend, Data, QA)<br/>
             &#8226; Pass a skill test to earn a verified scorecard<br/>
             &#8226; Appear in recruiter searches scored on your verified tests</p>`,
      cta: { label: role === "recruiter" ? "Open recruiter dashboard" : "Start a roadmap", url: "/roadmaps" },
    };
  },

  testResult(name: string, skill: string, score: number, percentile: number, passed: boolean) {
    const safeScore = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
    const safePercentile = Math.max(0, Math.min(99, Math.round(Number(percentile) || 0)));
    return {
      kind: "test-result",
      subject: passed
        ? `Verified: ${esc(skill)} ${safeScore}/100 — scorecard issued`
        : `Your ${esc(skill)} result: ${safeScore}/100`,
      title: passed ? "New verified scorecard!" : "Test complete — keep going",
      bodyHtml: passed
        ? `<p>Congratulations ${esc(name)}! You scored <strong style="color:#0F9D58;font-size:18px;">${safeScore}/100</strong> (${safePercentile}th percentile) on the <strong>${esc(skill)}</strong> test.</p>
           <p>Your verified scorecard is now live on your profile and visible to recruiters searching for ${esc(skill)}.</p>`
        : `<p>You scored <strong>${safeScore}/100</strong> (${safePercentile}th percentile) on <strong>${esc(skill)}</strong>. You need 70+ to verify.</p>
           <p>Review the explanations, revisit the roadmap, and try again — attempts are limited to 3 per 30 days.</p>`,
      cta: { label: passed ? "View my scorecard" : "Retake test", url: "/profile" },
    };
  },

  applicationReceived(jobTitle: string, company: string, studentName: string) {
    return {
      kind: "application",
      subject: `New application: ${esc(studentName)} → ${esc(jobTitle)}`,
      title: "New applicant with verified skills",
      bodyHtml: `<p><strong>${esc(studentName)}</strong> just applied to <strong>${esc(jobTitle)}</strong> at ${esc(company)}.</p>
                 <p>Their verified skill scores were auto-ranked against your job requirements — check the pipeline to shortlist.</p>`,
      cta: { label: "Review applicant", url: "/recruiter" },
    };
  },

  applicationUpdate(studentName: string, jobTitle: string, company: string, stage: string) {
    return {
      kind: "application-update",
      subject: `Application update: ${esc(jobTitle)} @ ${esc(company)}`,
      title: "Your application moved forward!",
      bodyHtml: `<p>Hi ${esc(studentName)},</p><p>Your application for <strong>${esc(jobTitle)}</strong> at <strong>${esc(company)}</strong> moved to <strong style="color:#0F151D;">${esc(stage)}</strong>.</p>`,
      cta: { label: "Track application", url: "/profile" },
    };
  },

  recruiterApproved(name: string, company: string) {
    return {
      kind: "recruiter-approved",
      subject: "Recruiter account approved — start posting",
      title: "You're verified!",
      bodyHtml: `<p>Hi ${esc(name)},</p><p><strong>${esc(company)}</strong> is now a verified recruiter on SkillBridge. You can post jobs and shortlist verified candidates immediately.</p>`,
      cta: { label: "Post your first job", url: "/recruiter/post" },
    };
  },

  recruiterRejected(name: string, company: string) {
    return {
      kind: "recruiter-rejected",
      subject: "Recruiter verification needs more info",
      title: "We couldn't verify your account yet",
      bodyHtml: `<p>Hi ${esc(name)},</p><p>We couldn't verify <strong>${esc(company)}</strong> with the details provided. Please reply to this email with a company email address or website proof and we'll re-review within 24h.</p>`,
    };
  },

  adminNewRecruiter(company: string, email: string) {
    return {
      kind: "admin-review",
      subject: `Recruiter awaiting verification: ${esc(company)}`,
      title: "Verification queue: new recruiter",
      bodyHtml: `<p><strong>${esc(company)}</strong> (${esc(email)}) signed up as a recruiter and needs review before posting jobs.</p>`,
      cta: { label: "Open verification queue", url: "/admin/recruiters" },
    };
  },
};

export async function listOutbox(limit = 100): Promise<Email[]> {
  if (hasDb()) {
    const rows = await query<{
      id: string; to_email: string; subject: string; html: string; text: string;
      kind: string; delivered: string; created_at: Date | string;
    }>(`select * from outbox order by created_at desc limit $1`, [limit]);
    return rows.map((r) => ({
      id: r.id,
      to: r.to_email,
      subject: r.subject,
      html: r.html,
      text: r.text,
      kind: r.kind,
      createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : new Date(r.created_at).toISOString(),
      delivered: (r.delivered === "resend" ? "resend" : "outbox") as Email["delivered"],
      status: r.delivered === "resend" ? "sent" : "outbox",
    }));
  }
  return (await readOutboxJson()).reverse().slice(0, limit);
}
