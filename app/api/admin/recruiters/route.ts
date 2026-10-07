import { NextResponse } from "next/server";
import { getUserFromToken, publicUser, recruitersWithStatus, setRecruiterVerified, tokenFromRequest, DEMO_MODE } from "@/lib/auth";
import { PENDING_RECRUITERS } from "@/lib/roles";
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
  const real = users.map((u) => ({
    ...publicUser(u),
    demo: false as const,
  }));

  // In demo mode, merge the seed queue rows that don't match a real account,
  // clearly labelled demo — they exercise the review UI but can't be approved.
  const demoRows = DEMO_MODE
    ? PENDING_RECRUITERS.filter((p) => !users.some((u) => u.email.toLowerCase() === p.email.toLowerCase())).map((p) => ({
        id: p.id,
        name: p.name,
        email: p.email,
        company: p.company,
        verifiedRecruiter: false,
        demo: true as const,
      }))
    : [];

  return NextResponse.json({ recruiters: [...real, ...demoRows] });
}

/** POST { userId, action: "approve" | "reject" } — sets verifiedRecruiter server-side + emails. */
export async function POST(req: Request) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Admin access required." }, { status: 401 });
  }

  const { userId, action } = (await req.json()) as { userId?: string; action?: string };
  if (!userId || (action !== "approve" && action !== "reject")) {
    return NextResponse.json({ error: "userId and action (approve|reject) are required." }, { status: 400 });
  }

  const updated = await setRecruiterVerified(userId, action === "approve");
  if (!updated) {
    return NextResponse.json({ error: "Recruiter not found." }, { status: 404 });
  }

  // 📧 decision email sent server-side (never from the browser)
  const tpl =
    action === "approve"
      ? templates.recruiterApproved(updated.name, updated.company ?? updated.name)
      : templates.recruiterRejected(updated.name, updated.company ?? updated.name);
  void sendEmail({ to: updated.email, ...tpl });

  return NextResponse.json({ recruiter: publicUser(updated) });
}
