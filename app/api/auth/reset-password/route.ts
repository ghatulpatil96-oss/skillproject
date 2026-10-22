import { NextResponse } from "next/server";
import {
  findUserById,
  hashPassword,
} from "@/lib/auth";
import { resetPasswordWithToken } from "@/lib/account-security";
import { passwordResetSchema } from "@/lib/password-policy";
import { requestSecurityDetails } from "@/lib/request-metadata";
import { assertSameOrigin, readJson } from "@/lib/security";
import { sendEmail, templates } from "@/lib/email";

export async function POST(req: Request) {
  if (!(await assertSameOrigin(req))) {
    return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 });
  }
  const body = await readJson<unknown>(req);
  if (!body.ok) {
    return NextResponse.json({ error: body.error }, { status: body.status });
  }
  const parsed = passwordResetSchema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check the password fields." },
      { status: 400 }
    );
  }

  try {
    const passwordHash = await hashPassword(parsed.data.newPassword);
    const reset = await resetPasswordWithToken(parsed.data.token, passwordHash);
    if (!reset) {
      return NextResponse.json(
        { error: "This reset link is invalid, expired, or already used." },
        { status: 400 }
      );
    }

    const user = await findUserById(reset.userId);
    if (user) {
      try {
        const email = await sendEmail({
          to: user.email,
          ...templates.passwordChanged(user.name, requestSecurityDetails(req)),
        });
        if (email.status === "failed") {
          console.error("[reset-password] Password change notification was not delivered.");
        }
      } catch {
        console.error("[reset-password] Password change notification could not be recorded or sent.");
      }
    }

    return NextResponse.json({ ok: true, redirect: "/login?passwordReset=success" });
  } catch {
    console.error("[reset-password] Password reset request failed.");
    return NextResponse.json({ error: "Unable to reset your password right now." }, { status: 500 });
  }
}
