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
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { sendEmail, templates } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
      college?: string;
      gradYear?: number;
      company?: string;
    };

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? "";

    // ── role whitelist: the public signup form can never mint an admin ──
    const requested = (body.role ?? "student").toLowerCase();
    if (requested === "admin") {
      return NextResponse.json({ error: "Admin accounts cannot be created via signup." }, { status: 403 });
    }
    const role = requested === "recruiter" ? "recruiter" : "student";

    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }
    if (role === "recruiter" && !body.company?.trim()) {
      return NextResponse.json({ error: "Company name is required for recruiters." }, { status: 400 });
    }

    // brute-force guard: 5 signups / 15 min per IP+email
    const rl = rateLimit(`signup|${clientIp(req)}|${email}`);
    if (!rl.ok) {
      return NextResponse.json(
        { error: `Too many attempts. Try again in ${Math.ceil(rl.retryAfterSec / 60)} minute(s).` },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    if (await findUserByEmail(email)) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const user = await createUser({
      name,
      email,
      password,
      role,
      college: body.college?.trim() || undefined,
      gradYear: body.gradYear ? Number(body.gradYear) : undefined,
      company: body.company?.trim(),
    });

    const token = createSessionToken(user.id, user.role);
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
