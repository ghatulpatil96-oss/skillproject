import { NextResponse } from "next/server";
import { getUserFromToken, SESSION_COOKIE, type User } from "@/lib/auth";
import { JOBS, type Job } from "@/lib/data";
import { addPostedJob, postedJobsByRecruiter, deletePostedJob, readPostedJobs } from "@/lib/store";
import { assertSameOrigin, readJson } from "@/lib/security";

function userFrom(req: Request): Promise<User | null> {
  const token = req.headers.get("cookie")?.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`))?.[1];
  return getUserFromToken(token);
}

/** Posted jobs are stored server-side but share the student-facing Job shape. */
function postedToJob(j: {
  id: string;
  role: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  skills: { skillId: string; minScore: number }[];
  description: string;
  createdAt: string;
}): Job {
  return {
    id: j.id,
    role: j.role,
    company: j.company,
    logo: "",
    location: j.location,
    salary: j.salary || "Salary not disclosed",
    type: j.type === "Internship" ? "Internship" : "Full-time",
    skills: j.skills,
    description: j.description,
    perks: [],
    companyType: "Recruiter post",
    postedDaysAgo: Math.max(
      0,
      Math.floor((Date.now() - new Date(j.createdAt).getTime()) / 86_400_000)
    ),
  };
}

/** GET /api/jobs — published jobs only (public). ?mine=1 → this recruiter's raw posts. */
export async function GET(req: Request) {
  const mine = new URL(req.url).searchParams.get("mine");
  if (mine) {
    const user = await userFrom(req);
    if (!user || user.role !== "recruiter") {
      return NextResponse.json({ error: "Recruiter access required." }, { status: 401 });
    }
    return NextResponse.json({ mine: await postedJobsByRecruiter(user.id) });
  }
  const posted = (await readPostedJobs()).map(postedToJob); // drafts already excluded in the store
  // honest feed: production serves only real recruiter posts;
  // development merges the seed jobs so the UI has data to show
  const jobs = process.env.NODE_ENV === "production" ? posted : [...JOBS, ...posted];
  return NextResponse.json({ jobs });
}

/** DELETE /api/jobs?id= — a recruiter removes their own post. */
export async function DELETE(req: Request) {
  const user = await userFrom(req);
  if (!user || user.role !== "recruiter") {
    return NextResponse.json({ error: "Recruiter access required." }, { status: 401 });
  }
  if (!(await assertSameOrigin(req))) {
    return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 });
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 });
  const ok = await deletePostedJob(id, user.id);
  if (!ok) return NextResponse.json({ error: "Job not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}

/**
 * POST /api/jobs — recruiters submit a job.
 * Only a recruiter whose server-stored verifiedRecruiter === true
 * publishes live. Unapproved recruiters save a draft, which is
 * excluded from public GET until an approved publication happens.
 */
export async function POST(req: Request) {
  const user = await userFrom(req);
  if (!user || user.role !== "recruiter") {
    return NextResponse.json({ error: "Recruiter access required." }, { status: 401 });
  }
  if (!(await assertSameOrigin(req))) {
    return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 });
  }
  const read = await readJson<{
    role?: string;
    location?: string;
    salary?: string;
    type?: string;
    description?: string;
    skills?: { skillId: string; minScore: number }[];
  }>(req);
  if (!read.ok) {
    return NextResponse.json({ error: read.error }, { status: read.status });
  }
  const b = read.data;

  const role = b.role?.trim() ?? "";
  const skills = (b.skills ?? []).filter(
    (s) => typeof s.skillId === "string" && Number(s.minScore) >= 0 && Number(s.minScore) <= 100
  );
  if (role.length < 3) {
    return NextResponse.json({ error: "Job title is required." }, { status: 400 });
  }
  if (skills.length === 0) {
    return NextResponse.json({ error: "Add at least one required skill." }, { status: 400 });
  }

  const canPublish = user.verifiedRecruiter === true;
  const job = await addPostedJob({
    role,
    company: user.company ?? user.name,
    recruiterId: user.id,
    location: b.location?.trim() || "Remote, India",
    salary: b.salary?.trim() || "",
    type: b.type === "Internship" ? "Internship" : "Full-time",
    skills,
    description: b.description?.trim() || "No description provided.",
    perks: [],
    status: canPublish ? "published" : "draft",
  });

  return NextResponse.json(
    {
      job,
      published: canPublish,
      message: canPublish
        ? undefined
        : "Saved as a draft. A recruiter check is pending — the listing goes live after approval.",
    },
    { status: 201 }
  );
}
