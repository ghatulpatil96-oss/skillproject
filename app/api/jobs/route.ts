import { NextResponse } from "next/server";
import { getUserFromToken, SESSION_COOKIE, type User } from "@/lib/auth";
import { JOBS, type Job } from "@/lib/data";
import { addPostedJob, postedJobsByRecruiter, deletePostedJob, readPostedJobs } from "@/lib/store";

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
    logo: "🏢",
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

/** GET /api/jobs — seed + posted jobs (public). ?mine=1 → this recruiter's raw posts. */
export async function GET(req: Request) {
  const mine = new URL(req.url).searchParams.get("mine");
  if (mine) {
    const user = await userFrom(req);
    if (!user || user.role !== "recruiter") {
      return NextResponse.json({ error: "Recruiter access required." }, { status: 401 });
    }
    return NextResponse.json({ mine: await postedJobsByRecruiter(user.id) });
  }
  const posted = (await readPostedJobs()).map(postedToJob);
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
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 });
  const ok = await deletePostedJob(id, user.id);
  if (!ok) return NextResponse.json({ error: "Job not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}

/** POST /api/jobs — recruiters publish a job (live instantly in the feed). */
export async function POST(req: Request) {
  const user = await userFrom(req);
  if (!user || user.role !== "recruiter") {
    return NextResponse.json({ error: "Recruiter access required." }, { status: 401 });
  }

  const b = (await req.json()) as {
    role?: string;
    location?: string;
    salary?: string;
    type?: string;
    description?: string;
    skills?: { skillId: string; minScore: number }[];
  };

  const role = b.role?.trim() ?? "";
  const skills = (b.skills ?? []).filter((s) => s.skillId && s.minScore >= 0 && s.minScore <= 100);
  if (role.length < 3) {
    return NextResponse.json({ error: "Job title is required." }, { status: 400 });
  }
  if (skills.length === 0) {
    return NextResponse.json({ error: "Add at least one required skill." }, { status: 400 });
  }

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
  });

  return NextResponse.json({ job }, { status: 201 });
}
