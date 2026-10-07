// ─────────────────────────────────────────────────────────────
// Test attempts + applications + posted jobs.
// Neon Postgres when DATABASE_URL is set; .data/*.json fallback
// otherwise. The exported API is identical for both backends —
// this file is the only seam that touches storage.
// ─────────────────────────────────────────────────────────────
import { promises as fs } from "fs";
import path from "path";
import { hasDb, query } from "@/lib/db";

const DATA_DIR = path.join(process.cwd(), ".data");
const ATTEMPTS_FILE = path.join(DATA_DIR, "attempts.json");
const APPLICATIONS_FILE = path.join(DATA_DIR, "applications.json");

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(file, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, data: unknown) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

const iso = (d: Date | string | null): string =>
  d instanceof Date ? d.toISOString() : new Date(d ?? Date.now()).toISOString();

// ── test attempts ────────────────────────────────────────────
export type Attempt = {
  id: string;
  userId: string;
  skillId: string;
  score: number; // 0–100
  percentile: number;
  passed: boolean; // score >= 70
  answers: Record<string, number>; // questionId → chosen index
  integrityFlags: number; // tab-switch count etc.
  createdAt: string;
};

type AttemptRow = {
  id: string;
  user_id: string;
  skill_id: string;
  score: number;
  percentile: number;
  passed: boolean;
  answers: Record<string, number>;
  integrity_flags: number;
  created_at: Date | string;
};

function mapAttempt(r: AttemptRow): Attempt {
  return {
    id: r.id,
    userId: r.user_id,
    skillId: r.skill_id,
    score: r.score,
    percentile: r.percentile,
    passed: r.passed,
    answers: r.answers ?? {},
    integrityFlags: r.integrity_flags,
    createdAt: iso(r.created_at),
  };
}

export async function readAttempts(): Promise<Attempt[]> {
  if (hasDb()) {
    const rows = await query<AttemptRow>(
      `select * from attempts order by created_at desc limit 5000`
    );
    return rows.map(mapAttempt);
  }
  return readJson<Attempt[]>(ATTEMPTS_FILE, []);
}

export async function addAttempt(a: Omit<Attempt, "id" | "createdAt">): Promise<Attempt> {
  const attempt: Attempt = {
    ...a,
    id: `at_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  if (hasDb()) {
    const rows = await query<AttemptRow>(
      `insert into attempts (id, user_id, skill_id, score, percentile, passed, answers, integrity_flags, created_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9) returning *`,
      [attempt.id, attempt.userId, attempt.skillId, attempt.score, attempt.percentile,
       attempt.passed, JSON.stringify(attempt.answers), attempt.integrityFlags, attempt.createdAt]
    );
    return mapAttempt(rows[0]);
  }
  const attempts = await readJson<Attempt[]>(ATTEMPTS_FILE, []);
  attempts.push(attempt);
  await writeJson(ATTEMPTS_FILE, attempts.slice(-2000));
  return attempt;
}

/** Attempts by one user, newest first. */
export async function attemptsByUser(userId: string): Promise<Attempt[]> {
  if (hasDb()) {
    const rows = await query<AttemptRow>(
      `select * from attempts where user_id = $1 order by created_at desc`,
      [userId]
    );
    return rows.map(mapAttempt);
  }
  return (await readJson<Attempt[]>(ATTEMPTS_FILE, []))
    .filter((a) => a.userId === userId)
    .sort((x, y) => y.createdAt.localeCompare(x.createdAt));
}

// ── job applications ─────────────────────────────────────────
export type ApplicationStage = "applied" | "shortlisted" | "challenge" | "interview" | "offer" | "rejected";

export type Application = {
  id: string;
  jobId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  college?: string; // legacy — never shown to recruiters (PRD F7.1)
  /** verified scores at apply time, snapshot: skillId → score */
  scores: Record<string, number>;
  matchPercent: number;
  stage: ApplicationStage;
  createdAt: string;
  updatedAt: string;
};

type ApplicationRow = {
  id: string;
  job_id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  college: string | null;
  scores: Record<string, number>;
  match_percent: number;
  stage: ApplicationStage;
  created_at: Date | string;
  updated_at: Date | string;
};

function mapApplication(r: ApplicationRow): Application {
  return {
    id: r.id,
    jobId: r.job_id,
    studentId: r.student_id,
    studentName: r.student_name,
    studentEmail: r.student_email,
    college: r.college ?? undefined,
    scores: r.scores ?? {},
    matchPercent: r.match_percent,
    stage: r.stage,
    createdAt: iso(r.created_at),
    updatedAt: iso(r.updated_at),
  };
}

export async function readApplications(): Promise<Application[]> {
  if (hasDb()) {
    const rows = await query<ApplicationRow>(
      `select * from applications order by created_at desc limit 5000`
    );
    return rows.map(mapApplication);
  }
  return readJson<Application[]>(APPLICATIONS_FILE, []);
}

export async function addApplication(
  a: Omit<Application, "id" | "createdAt" | "updatedAt">
): Promise<Application> {
  const app: Application = {
    ...a,
    id: `ap_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  if (hasDb()) {
    const rows = await query<ApplicationRow>(
      `insert into applications (id, job_id, student_id, student_name, student_email, college, scores, match_percent, stage, created_at, updated_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) returning *`,
      [app.id, app.jobId, app.studentId, app.studentName, app.studentEmail,
       app.college ?? null, JSON.stringify(app.scores), app.matchPercent, app.stage,
       app.createdAt, app.updatedAt]
    );
    return mapApplication(rows[0]);
  }
  const apps = await readJson<Application[]>(APPLICATIONS_FILE, []);
  apps.push(app);
  await writeJson(APPLICATIONS_FILE, apps.slice(-5000));
  return app;
}

export async function applicationsForJob(jobId: string): Promise<Application[]> {
  if (hasDb()) {
    const rows = await query<ApplicationRow>(
      `select * from applications where job_id = $1 order by created_at desc`,
      [jobId]
    );
    return rows.map(mapApplication);
  }
  return (await readJson<Application[]>(APPLICATIONS_FILE, []))
    .filter((a) => a.jobId === jobId)
    .sort((x, y) => y.createdAt.localeCompare(x.createdAt));
}

export async function applicationsByStudent(studentId: string): Promise<Application[]> {
  if (hasDb()) {
    const rows = await query<ApplicationRow>(
      `select * from applications where student_id = $1 order by created_at desc`,
      [studentId]
    );
    return rows.map(mapApplication);
  }
  return (await readJson<Application[]>(APPLICATIONS_FILE, []))
    .filter((a) => a.studentId === studentId)
    .sort((x, y) => y.createdAt.localeCompare(x.createdAt));
}

export async function updateApplicationStage(
  id: string,
  stage: ApplicationStage
): Promise<Application | undefined> {
  if (hasDb()) {
    const rows = await query<ApplicationRow>(
      `update applications set stage = $2, updated_at = now() where id = $1 returning *`,
      [id, stage]
    );
    return rows[0] ? mapApplication(rows[0]) : undefined;
  }
  const apps = await readJson<Application[]>(APPLICATIONS_FILE, []);
  const app = apps.find((a) => a.id === id);
  if (!app) return undefined;
  app.stage = stage;
  app.updatedAt = new Date().toISOString();
  await writeJson(APPLICATIONS_FILE, apps);
  return app;
}

export async function findApplication(jobId: string, studentId: string): Promise<Application | undefined> {
  if (hasDb()) {
    const rows = await query<ApplicationRow>(
      `select * from applications where job_id = $1 and student_id = $2 limit 1`,
      [jobId, studentId]
    );
    return rows[0] ? mapApplication(rows[0]) : undefined;
  }
  return (await readJson<Application[]>(APPLICATIONS_FILE, [])).find(
    (a) => a.jobId === jobId && a.studentId === studentId
  );
}

// ── recruiter-posted jobs ────────────────────────────────────
export type PostedJob = {
  id: string;
  role: string;
  company: string;
  recruiterId: string;
  location: string;
  salary: string;
  type: "Full-time" | "Internship";
  skills: { skillId: string; minScore: number }[];
  description: string;
  perks: string[];
  createdAt: string;
};

type PostedJobRow = {
  id: string;
  recruiter_id: string;
  role: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  skills: { skillId: string; minScore: number }[];
  description: string;
  perks: string[];
  created_at: Date | string;
};

function mapPostedJob(r: PostedJobRow): PostedJob {
  return {
    id: r.id,
    recruiterId: r.recruiter_id,
    role: r.role,
    company: r.company,
    location: r.location,
    salary: r.salary,
    type: r.type === "Internship" ? "Internship" : "Full-time",
    skills: r.skills ?? [],
    description: r.description,
    perks: r.perks ?? [],
    createdAt: iso(r.created_at),
  };
}

const POSTED_JOBS_FILE = path.join(DATA_DIR, "posted-jobs.json");

export async function readPostedJobs(): Promise<PostedJob[]> {
  if (hasDb()) {
    const rows = await query<PostedJobRow>(
      `select * from posted_jobs order by created_at desc`
    );
    return rows.map(mapPostedJob);
  }
  return readJson<PostedJob[]>(POSTED_JOBS_FILE, []);
}

export async function addPostedJob(j: Omit<PostedJob, "id" | "createdAt">): Promise<PostedJob> {
  const job: PostedJob = {
    ...j,
    id: `pj_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
  };
  if (hasDb()) {
    const rows = await query<PostedJobRow>(
      `insert into posted_jobs (id, recruiter_id, role, company, location, salary, type, skills, description, perks, created_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) returning *`,
      [job.id, job.recruiterId, job.role, job.company, job.location, job.salary,
       job.type, JSON.stringify(job.skills), job.description, JSON.stringify(job.perks),
       job.createdAt]
    );
    return mapPostedJob(rows[0]);
  }
  const jobs = await readJson<PostedJob[]>(POSTED_JOBS_FILE, []);
  jobs.push(job);
  await writeJson(POSTED_JOBS_FILE, jobs);
  return job;
}

export async function postedJobsByRecruiter(recruiterId: string): Promise<PostedJob[]> {
  if (hasDb()) {
    const rows = await query<PostedJobRow>(
      `select * from posted_jobs where recruiter_id = $1 order by created_at desc`,
      [recruiterId]
    );
    return rows.map(mapPostedJob);
  }
  return (await readJson<PostedJob[]>(POSTED_JOBS_FILE, [])).filter(
    (j) => j.recruiterId === recruiterId
  );
}

export async function deletePostedJob(id: string, recruiterId: string): Promise<boolean> {
  if (hasDb()) {
    const rows = await query<PostedJobRow>(
      `delete from posted_jobs where id = $1 and recruiter_id = $2 returning id`,
      [id, recruiterId]
    );
    return rows.length > 0;
  }
  const jobs = await readJson<PostedJob[]>(POSTED_JOBS_FILE, []);
  const next = jobs.filter((j) => !(j.id === id && j.recruiterId === recruiterId));
  if (next.length === jobs.length) return false;
  await writeJson(POSTED_JOBS_FILE, next);
  return true;
}
