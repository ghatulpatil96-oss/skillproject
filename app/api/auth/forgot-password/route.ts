import { NextResponse } from "next/server";
import { createPasswordResetToken } from "@/lib/account-security";
import { findUserByEmail } from "@/lib/auth";
import { sendEmail, templates } from "@/lib/email";
import { assertSameOrigin, readJson } from "@/lib/security";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const RESPONSE_MESSAGE = "If that email exists, we've sent a link.";
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

function response() {
  return NextResponse.json({ message: RESPONSE_MESSAGE });
}

export async function POST(req: Request) {
  if (!(await assertSameOrigin(req))) {
    return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 });
  }
  const limit = rateLimit(`forgot-password|${clientIp(req)}`, 5, 15 * 60 * 1000);
  if (!limit.ok) return response();

  const body = await readJson<{ email?: string }>(req);
  if (!body.ok) return response();
  const email = body.data.email?.trim().toLowerCase() ?? "";
  if (email.length > 254 || !EMAIL_RE.test(email)) return response();

  try {
    const user = await findUserByEmail(email);
    if (user) {
      const token = await createPasswordResetToken(user.id);
      const resetUrl = `/reset-password#token=${encodeURIComponent(token)}`;
      try {
        const emailResult = await sendEmail({
          to: user.email,
          ...templates.passwordReset(user.name, resetUrl),
        });
        if (emailResult.status === "failed") {
          console.error("[forgot-password] Reset email was not delivered.");
        }
      } catch {
        console.error("[forgot-password] Reset email could not be recorded or sent.");
      }
    }
  } catch {
    console.error("[forgot-password] Password reset request could not be processed.");
  }
  return response();
}
