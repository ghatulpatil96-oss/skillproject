import { NextResponse } from "next/server";
import { getUserFromToken, SESSION_COOKIE, type User } from "@/lib/auth";
import { JOBS, skillById } from "@/lib/data";
import {
  addApplication,
  applicationsByStudent,
  applicationsForJob,
  attemptsByUser,
  findApplication,
  postedJobsByRecruiter,
  readPostedJobs,
  updateApplicationStage,
  type ApplicationStage,
} from "@/lib/store";
import { sendEmail, templates } from "@/lib/email";

const STAGES: ApplicationStage[] = ["applied", "shortlisted", "challenge", "interview", "offer", "rejected"];

function userFrom(req: Request): Promise<User | null> {
  const token = req.headers.get("cookie")?.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`))?.[1];
  return getUserFromToken(token);
}

/** Look up a job by id across the seed feed and recruiter-posted jobs. */
async function anyJob(jobId: string) {
  return (
    JOBS.find((j) => j.id === jobId) ??
    (await readPostedJobs()).find((j) => j.id === jobId)
  );
}

/** Job ids belonging to one recruiter (seed demo jobs + their own posts). */
async function recruiterJobIds(user: User): Promise<string[]> {
  const own = await postedJobsByRecruiter(user.id);
  const seed = JOBS.filter((j) => j.company === user.company).map((j) => j.id);
  return Array.from(new Set([...seed, ...own.map((j) => j.id)]));
}

/**
 * POST /api/applications — student applies to a job.
 * Snapshots verified scores at apply time so the recruiter sees
 * exactly what the student had when they applied.
 */
export async function POST(req: Request) {
  const user = await userFrom(req);
  if (!user || user.role !== "student") {
    return NextResponse.json({ error: "Log in as a student to apply." }, { status: 401 });
  }

  const { jobId } = (await req.json()) as { jobId?: string };
  const job = await anyJob(jobId ?? "");
  if (!job) return NextResponse.json({ error: "Job not found." }, { status: 404 });

  if (await findApplication(job.id, user.id)) {
    return NextResponse.json({ error: "You already applied to this job." }, { status: 409 });
  }

  // verified-score snapshot + match % (one attempt-history read, reused)
  const history = await attemptsByUser(user.id);
  const scores: Record<string, number> = {};
  let sum = 0;
  for (const reqSkill of job.skills) {
    const best = history
      .filter((a) => a.skillId === reqSkill.skillId && a.passed)
      .sort((a, b) => b.score - a.score)[0];
    scores[reqSkill.skillId] = best?.score ?? 0;
    sum += Math.min(100, Math.round(((best?.score ?? 0) / reqSkill.minScore) * 100));
  }
  const matchPercent = Math.round(sum / Math.max(1, job.skills.length));

  // NOTE: college is deliberately NOT stored — recruiters never see it
  // (anti-bias decision, PRD F7.1).
  const app = await addApplication({
    jobId: job.id,
    studentId: user.id,
    studentName: user.name,
    studentEmail: user.email,
    scores,
    matchPercent,
    stage: "applied",
  });

  // 📧 recruiter notification
  void sendEmail({
    to: "recruiter@skillbridge.local",
    ...templates.applicationReceived(job.role, job.company, user.name),
  });

  return NextResponse.json({ application: app }, { status: 201 });
}

/** GET /api/applications — student: mine; recruiter: their jobs' applicants (?jobId= optional). */
export async function GET(req: Request) {
  const user = await userFrom(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const jobId = url.searchParams.get("jobId");

  if (user.role === "recruiter") {
    const ids = await recruiterJobIds(user);
    const wanted = jobId ? ids.filter((id) => id === jobId) : ids;
    // strip any legacy college field — recruiters never see it
    const all = (await Promise.all(wanted.map((id) => applicationsForJob(id))))
      .flat()
      .map(({ college, ...rest }) => rest);
    return NextResponse.json({ applications: all });
  }

  return NextResponse.json({ applications: await applicationsByStudent(user.id) });
}

/** PATCH /api/applications — recruiter moves an application's stage. */
export async function PATCH(req: Request) {
  const user = await userFrom(req);
  if (!user || user.role !== "recruiter") {
    return NextResponse.json({ error: "Recruiter access required." }, { status: 401 });
  }

  const { id, stage } = (await req.json()) as { id?: string; stage?: ApplicationStage };
  if (!id || !stage || !STAGES.includes(stage)) {
    return NextResponse.json({ error: "id and a valid stage are required." }, { status: 400 });
  }

  const app = await updateApplicationStage(id, stage);
  if (!app) return NextResponse.json({ error: "Application not found." }, { status: 404 });

  const job = await anyJob(app.jobId);
  // 📧 student notification on stage change
  void sendEmail({
    to: app.studentEmail,
    ...templates.applicationUpdate(app.studentName, job?.role ?? app.jobId, job?.company ?? "the company", stage),
  });

  return NextResponse.json({ application: app });
}
