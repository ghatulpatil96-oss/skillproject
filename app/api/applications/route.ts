import { NextResponse } from "next/server";
import { getUserFromToken, SESSION_COOKIE, type User } from "@/lib/auth";
import { JOBS } from "@/lib/data";
import {
  addApplication,
  applicationsByStudent,
  applicationStages,
  applicationsForJob,
  attemptsByUser,
  findApplication,
  postedJobsByRecruiter,
  readPostedJobs,
  toRecruiterView,
  updateApplicationStageForRecruiter,
  type ApplicationStage,
} from "@/lib/store";
import { assertSameOrigin, readJson } from "@/lib/security";
import { sendEmail, templates } from "@/lib/email";

const STAGES: ApplicationStage[] = applicationStages();

function userFrom(req: Request): Promise<User | null> {
  const token = req.headers.get("cookie")?.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`))?.[1];
  return getUserFromToken(token);
}

/** Look up a published job by id across the seed feed and recruiter posts. */
async function anyJob(jobId: string) {
  return (
    JOBS.find((j) => j.id === jobId) ??
    (await readPostedJobs()).find((j) => j.id === jobId)
  );
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
  if (!(await assertSameOrigin(req))) {
    return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 });
  }
  const read = await readJson<{ jobId?: string }>(req);
  if (!read.ok) {
    return NextResponse.json({ error: read.error }, { status: read.status });
  }

  const job = await anyJob(read.data.jobId ?? "");
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

  // college is deliberately NOT stored — recruiters never see it
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

  // recruiter notification for a real (non-seed) job post
  const posted = (await postedJobsByRecruiter(user.id)).length; // unused here; see below
  void posted;
  const realJob = (await readPostedJobs()).find((j) => j.id === job.id);
  if (realJob) {
    void sendEmail({
      to: realJob.recruiterId, // TODO(real): route via the recruiter's actual email lookup
      ...templates.applicationReceived(job.role, job.company, user.name),
    });
  }
  // seed jobs (JOBS const) accept the application UI-wise but are not wired
  // to any real recruiter identity, so no notification is sent for them.

  return NextResponse.json({ application: app }, { status: 201 });
}

/** GET /api/applications — student: mine; recruiter: their own jobs' applicants. */
export async function GET(req: Request) {
  const user = await userFrom(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const jobId = url.searchParams.get("jobId");

  if (user.role === "recruiter") {
    // authorization = server-owned recruiter_id on posted_jobs only.
    // No company-name matching: a self-declared company grants nothing.
    const own = await postedJobsByRecruiter(user.id);
    const ids = own.map((j) => j.id);
    const wanted = jobId ? ids.filter((id) => id === jobId) : ids;
    const all = (await Promise.all(wanted.map((id) => applicationsForJob(id))))
      .flat()
      .map(toRecruiterView); // drops college in every response
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
  if (!(await assertSameOrigin(req))) {
    return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 });
  }
  const read = await readJson<{ id?: string; stage?: ApplicationStage }>(req);
  if (!read.ok) {
    return NextResponse.json({ error: read.error }, { status: read.status });
  }
  const { id, stage } = read.data;
  if (!id || !stage || !STAGES.includes(stage)) {
    return NextResponse.json({ error: "id and a valid stage are required." }, { status: 400 });
  }

  // ownership lives in the SQL (job must belong to this recruiter);
  // nothing is mutated and nothing is returned when it does not.
  const app = await updateApplicationStageForRecruiter(id, stage, user.id);
  if (!app) return NextResponse.json({ error: "Application not found." }, { status: 404 });

  const job = await anyJob(app.jobId);
  void sendEmail({
    to: app.studentEmail,
    ...templates.applicationUpdate(app.studentName, job?.role ?? app.jobId, job?.company ?? "the company", stage),
  });

  return NextResponse.json({ application: toRecruiterView(app) });
}
