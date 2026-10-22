import { NextResponse } from "next/server";
import {
  createSessionToken,
  findUserByEmail,
  publicUser,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  verifyPassword,
} from "@/lib/auth";
import { authRateLimit } from "@/lib/rate-limit";
import { assertSameOrigin, readJson } from "@/lib/security";
import { sendEmail, templates } from "@/lib/email";
import { requestSecurityDetails } from "@/lib/request-metadata";

export async function POST(req: Request) {
  try {
    if (!(await assertSameOrigin(req))) {
      return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 });
    }
    const body = await readJson<{ email?: string; password?: string }>(req);
    if (!body.ok) {
      return NextResponse.json({ error: body.error }, { status: body.status });
    }
    const { email = "", password = "" } = body.data;
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    // brute-force guard, BEFORE any validation work:
    //  • per IP+email bucket (slows scanner churn)
    //  • per-account email bucket (header rotation cannot reset it)
    const rl = authRateLimit(req, email.toLowerCase());
    if (!rl.ok) {
      return NextResponse.json(
        { error: `Too many attempts. Try again in ${Math.ceil(rl.retryAfterSec / 60)} minute(s).` },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    const found = await findUserByEmail(email);
    // same message for all failures — no user or demo-mode enumeration
    if (!found || !(await verifyPassword(password, found.passwordHash))) {
      return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
    }

    const token = createSessionToken(found.id, found.role, 30, found.sessionVersion ?? 0);
    const res = NextResponse.json({ user: publicUser(found) });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });
    if (found.emailLoginNotifications !== false) {
      try {
        const email = await sendEmail({
          to: found.email,
          ...templates.loginNotice(found.name, requestSecurityDetails(req)),
        });
        if (email.status === "failed") {
          console.error("[login] Login notification email was not delivered.");
        }
      } catch {
        console.error("[login] Login notification email could not be recorded or sent.");
      }
    }
    return res;
  } catch (err) {
    console.error("login error", err);
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
}
