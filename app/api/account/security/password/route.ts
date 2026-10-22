import { NextResponse } from "next/server";
import {
  createSessionToken,
  getUserFromToken,
  hashPassword,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  tokenFromRequest,
  updatePasswordAndIncrementSession,
  verifyPassword,
} from "@/lib/auth";
import { ensureAccountSecurityDatabase, recordPasswordChangeAttempt } from "@/lib/account-security";
import { passwordChangeSchema } from "@/lib/password-policy";
import { requestSecurityDetails } from "@/lib/request-metadata";
import { assertSameOrigin, readJson } from "@/lib/security";
import { sendEmail, templates } from "@/lib/email";

export async function POST(req: Request) {
  if (!(await assertSameOrigin(req))) {
    return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 });
  }
  const user = await getUserFromToken(tokenFromRequest(req));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    ensureAccountSecurityDatabase();
    const attempts = await recordPasswordChangeAttempt(user.id);
    if (attempts > 5) {
      return NextResponse.json(
        { error: "Too many password change attempts. Try again in 15 minutes." },
        { status: 429 }
      );
    }

    const body = await readJson<unknown>(req);
    if (!body.ok) {
      return NextResponse.json({ error: body.error }, { status: body.status });
    }
    const parsed = passwordChangeSchema.safeParse(body.data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Please check the password fields." },
        { status: 400 }
      );
    }

    if (!(await verifyPassword(parsed.data.currentPassword, user.passwordHash))) {
      return NextResponse.json(
        { error: "Unable to update password. Verify your current password and try again." },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(parsed.data.newPassword);
    const sessionVersion = await updatePasswordAndIncrementSession(user.id, passwordHash);
    if (sessionVersion === undefined) {
      return NextResponse.json({ error: "Unable to update your account." }, { status: 404 });
    }

    const response = NextResponse.json({ ok: true });
    const renewedToken = createSessionToken(user.id, user.role, 30, sessionVersion);
    response.cookies.set(SESSION_COOKIE, renewedToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });

    try {
      const email = await sendEmail({
        to: user.email,
        ...templates.passwordChanged(user.name, requestSecurityDetails(req)),
      });
      if (email.status === "failed") {
        console.error("[account-security] Password change notification was not delivered.");
      }
    } catch {
      console.error("[account-security] Password change notification could not be recorded or sent.");
    }

    return response;
  } catch {
    console.error("[account-security] Password change request failed.");
    return NextResponse.json({ error: "Unable to change your password right now." }, { status: 500 });
  }
}
