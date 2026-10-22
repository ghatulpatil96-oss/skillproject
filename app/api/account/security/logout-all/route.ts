import { NextResponse } from "next/server";
import { getUserFromToken, incrementSessionVersion, SESSION_COOKIE, tokenFromRequest } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/security";

export async function POST(req: Request) {
  if (!(await assertSameOrigin(req))) {
    return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 });
  }
  const user = await getUserFromToken(tokenFromRequest(req));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const sessionVersion = await incrementSessionVersion(user.id);
    if (sessionVersion === undefined) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      path: "/",
    });
    return response;
  } catch {
    console.error("[account-security] Could not revoke sessions.");
    return NextResponse.json({ error: "Could not log out of all devices." }, { status: 500 });
  }
}
