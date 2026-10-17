import { NextResponse } from "next/server";
import {
  createUser,
  findUserByEmail,
  createSessionToken,
  publicUser,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  DEMO_MODE,
} from "@/lib/auth";
import { authRateLimit } from "@/lib/rate-limit";
import { assertSameOrigin, readJson } from "@/lib/security";
import { sendEmail, templates } from "@/lib/email";

const MAX_EMAIL_LENGTH = 254; // RFC 5321 limit

/**
 * Linear-time email check (CWE-1333): no nested/backtracking
 * quantifiers. Characters outside the local part dots are validated
 * by character class, so the worst case is one pass over the string.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

export async function POST(req: Request) {
  try {
    if (!(await assertSameOrigin(req))) {
      return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 });
    }
    const body = await readJson<{
      name?: string;
      email?: string;
      password?: string;
      role?: string;
      gradYear?: number;
      company?: string;
    }>(req);
    if (!body.ok) {
      return NextResponse.json({ error: body.error }, { status: body.status });
    }
    const { name: rawName, email: rawEmail, password = "", company: rawCompany } = body.data;

    // ── role whitelist: the public signup form can never mint an admin ──
    const requested = (body.data.role ?? "student").toLowerCase();
    if (requested === "admin") {
      return NextResponse.json({ error: "Admin accounts cannot be created via signup." }, { status: 403 });
    }
    const role = requested === "recruiter" ? "recruiter" : "student";

    const name = rawName?.trim();
    const email = rawEmail?.trim().toLowerCase();
    const company = rawCompany?.trim();

    const nameOk = !!name && name.length >= 2;
    const emailOk = !!email && email.length <= MAX_EMAIL_LENGTH && EMAIL_RE.test(email);
    const companyOk = role !== "recruiter" || (!!company && company.length > 0);
    if (!nameOk || !emailOk || !companyOk || password.length < 8) {
      let error = "Please check your details: name (2+ chars), a valid email, a password of 8+ characters";
      if (role === "recruiter") error += ", and a company name";
      return NextResponse.json({ error }, { status: 400 });
    }

    // rate limit FIRST — before any expensive work beyond field checks
    const rl = authRateLimit(req, email!);
    if (!rl.ok) {
      return NextResponse.json(
        { error: `Too many attempts. Try again in ${Math.ceil(rl.retryAfterSec / 60)} minute(s).` },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    if (await findUserByEmail(email!)) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    // NOTE: college is deliberately NOT collected (recruiters never see it).
    const user = await createUser({
      name: name!,
      email: email!,
      password,
      role,
      gradYear: body.data.gradYear ? Number(body.data.gradYear) : undefined,
      company,
    });

    const token = createSessionToken(user.id, user.role, 30, user.sessionVersion ?? 0);
    const res = NextResponse.json({ user: publicUser(user) }, { status: 201 });

    // welcome email (+ admin ping for recruiter verification). In production
    // without a mail provider the admin ping goes to the configured admin
    // address; the demo admin address only exists in demo mode.
    void sendEmail({ to: user.email, ...templates.welcome(user.name, user.role) });
    if (user.role === "recruiter") {
      const adminTo = DEMO_MODE ? "admin@skillbridge.local" : (process.env.ADMIN_EMAIL ?? "admin@skillbridge.in");
      void sendEmail({ to: adminTo, ...templates.adminNewRecruiter(user.company ?? user.name, user.email) });
    }

    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });
    return res;
  } catch (err) {
    console.error("signup error", err);
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
}
