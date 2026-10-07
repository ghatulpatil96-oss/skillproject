import { NextResponse } from "next/server";
import {
  createSessionToken,
  findUserByEmail,
  publicUser,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  verifyPassword,
} from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const { email, password } = (await req.json()) as { email?: string; password?: string };
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    // brute-force guard: 5 attempts / 15 min per IP+email
    const rl = rateLimit(`${clientIp(req)}|${email.toLowerCase()}`);
    if (!rl.ok) {
      return NextResponse.json(
        { error: `Too many attempts. Try again in ${Math.ceil(rl.retryAfterSec / 60)} minute(s).` },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    const user = await findUserByEmail(email);
    // same message for both cases — no user enumeration
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
    }

    const token = createSessionToken(user.id, user.role);
    const res = NextResponse.json({ user: publicUser(user) });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });
    return res;
  } catch (err) {
    console.error("login error", err);
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
}
