// ─────────────────────────────────────────────────────────────
// Email pipeline — sends via Resend when RESEND_API_KEY is set;
// otherwise stores to a JSON outbox rendered in /dev-inbox.
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

const DATA_DIR = path.join(process.cwd(), ".data");
const OUTBOX_FILE = path.join(DATA_DIR, "outbox.json");

export type Email = {
  id: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  kind: string;
  createdAt: string;
  delivered: "resend" | "outbox";
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
    const resolved = url.startsWith("/") ? new URL(base + url) : new URL(url);
    if (resolved.origin !== new URL(base).origin) return base + "/";
    return resolved.toString();
  } catch {
    return base + "/";
  }
}

// ── HTML template wrapper (brand tokens: cream / ink / coral) ─
function wrap(title: string, bodyHtml: string, cta?: { label: string; url: string }): string {
  const safeCta = cta ? { label: esc(cta.label), url: safeCtaUrl(cta.url) } : undefined;
  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#FFF9F6;font-family:Inter,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid #F0E2D9;">
    <div style="background:#FF8A5E;padding:20px 32px;">
      <span style="color:#0F151D;font-size:20px;font-weight:700;letter-spacing:-0.5px;">SkillBridge<span style="color:#0F151D;">.</span></span>
    </div>
    <div style="padding:32px;">
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
  cta?: { label: string; url: string };
}): Promise<Email> {
  const html = wrap(input.title, input.bodyHtml, input.cta);
  const text = input.bodyHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  const email: Email = {
    id: `e_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    to: input.to,
    subject: input.subject,
    html,
    text,
    kind: input.kind,
    createdAt: new Date().toISOString(),
    delivered: "outbox",
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
          from: process.env.EMAIL_FROM ?? "SkillBridge <onboarding@resend.dev>",
          to: [input.to],
          subject: input.subject,
          html,
        }),
      });
      if (res.ok) {
        email.delivered = "resend";
      } else {
        // never fail silently — log status + body so delivery issues surface
        const bodyText = await res.text().catch(() => "");
        console.error(`[email] Resend returned ${res.status} for ${input.kind} → ${input.to}: ${bodyText.slice(0, 300)}`);
      }
    } catch (err) {
      console.error(`[email] Resend request failed for ${input.kind} → ${input.to}:`, err);
    }
  }

  await saveOutboxEmail(email);
  return email;
}

// ── notification templates (PRD F5.4) ────────────────────────
// Every interpolated value is escaped; numbers are coerced via Number().
export const templates = {
  welcome(name: string, role: string) {
    return {
      kind: "welcome",
      subject: "Welcome to SkillBridge 🎉",
      title: `Welcome aboard, ${esc(name)}!`,
      bodyHtml:
        role === "recruiter"
          ? `<p>Your recruiter account is being verified — you'll get an email the moment it's approved (usually within 24h).</p>
             <p>While you wait, you can explore the candidate search and draft your first job post.</p>`
          : `<p>You just joined students from tier 2/3 colleges learning job-ready skills.</p>
             <p><strong>Your next steps:</strong></p>
             <p>1. Pick a roadmap (Frontend, Backend, Data, QA)<br/>
             2. Pass a skill test to earn a verified scorecard<br/>
             3. Get discovered by recruiters hiring on skills</p>`,
      cta: { label: role === "recruiter" ? "Open recruiter dashboard" : "Start a roadmap", url: "/roadmaps" },
    };
  },

  testResult(name: string, skill: string, score: number, percentile: number, passed: boolean) {
    const safeScore = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
    const safePercentile = Math.max(0, Math.min(99, Math.round(Number(percentile) || 0)));
    return {
      kind: "test-result",
      subject: passed
        ? `✅ Verified: ${esc(skill)} ${safeScore}/100 — scorecard issued`
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
      subject: `📨 New application: ${esc(studentName)} → ${esc(jobTitle)}`,
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
      subject: "✅ Recruiter account approved — start posting",
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
      subject: `🚩 Recruiter awaiting verification: ${esc(company)}`,
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
    }));
  }
  return (await readOutboxJson()).reverse().slice(0, limit);
}
