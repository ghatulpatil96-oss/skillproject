import { NextResponse } from "next/server";
import { getUserFromToken, publicUser, recruitersWithStatus, setRecruiterVerified, tokenFromRequest } from "@/lib/auth";
import { assertSameOrigin, readJson } from "@/lib/security";
import { sendEmail, templates } from "@/lib/email";

async function requireAdmin(req: Request) {
  const user = await getUserFromToken(tokenFromRequest(req));
  if (!user || user.role !== "admin") return null;
  return user;
}

/** GET — the verification queue: real recruiter accounts from the user store. */
export async function GET(req: Request) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Admin access required." }, { status: 401 });
  }

  const users = await recruitersWithStatus();
  return NextResponse.json({
    recruiters: users.map((u) => ({ ...publicUser(u), demo: false as const })),
  });
}

/** POST { userId, action: "approve" | "reject" } — sets verifiedRecruiter server-side + emails. */
export async function POST(req: Request) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Admin access required." }, { status: 401 });
  }
  if (!(await assertSameOrigin(req))) {
    return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 });
  }
  const body = await readJson<{ userId?: string; action?: string }>(req);
  if (!body.ok) {
    return NextResponse.json({ error: "Expected application/json body of at most 10 KB." }, { status: body.status });
  }
  const { userId, action } = body.data;
  if (!userId || typeof userId !== "string" || (action !== "approve" && action !== "reject")) {
    return NextResponse.json({ error: "userId and action (approve|reject) are required." }, { status: 400 });
  }

  const updated = await setRecruiterVerified(userId, action === "approve");
  if (!updated) {
    return NextResponse.json({ error: "Recruiter not found." }, { status: 404 });
  }

  // Decision email sent server-side (never from the browser).
  const tpl =
    action === "approve"
      ? templates.recruiterApproved(updated.name, updated.company ?? updated.name)
      : templates.recruiterRejected(updated.name, updated.company ?? updated.name);
  void sendEmail({ to: updated.email, ...tpl });

  return NextResponse.json({ recruiter: publicUser(updated) });
}
