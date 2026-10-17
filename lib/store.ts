// ─────────────────────────────────────────────────────────────
// Test attempts + applications + posted jobs.
// Neon Postgres when DATABASE_URL is set; .data/*.json fallback
// otherwise. The exported API is identical for both backends —
// this file is the only seam that touches storage.
// ─────────────────────────────────────────────────────────────
import { promises as fs } from "fs";
import path from "path";
import { hasDb, query, withTransaction } from "@/lib/db";

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

/**
 * Consume one attempt slot atomically (CWE-362):
 *  1. pg_advisory_xact_lock(hashtext(user+skill)) — serialises
 *     concurrent submissions for the same user+skill.
 *  2. count the attempts in the rolling 30-day window.
 *  3. if under the limit, insert the attempt.
 * Returns { ok:false } with attemptsLeft when the quota is spent.
 */
export async function addAttemptWithQuota(
  a: Omit<Attempt, "id" | "createdAt">,
  maxPer30Days: number
): Promise<{ ok: true; attempt: Attempt } | { ok: false; attemptsLeft: 0 }> {
  const attempt: Attempt = {
    ...a,
    id: `at_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };

  if (hasDb()) {
    return withTransaction(async (client) => {
      // stable lock per (user, skill) for the life of the transaction
      await client.query(`select pg_advisory_xact_lock(hashtext($1))`, [
        `${a.userId}|${a.skillId}`,
      ]);
      const countRes = await client.query<{ n: number }>(
        `select count(*)::int as n from attempts
         where user_id = $1 and skill_id = $2
           and created_at > now() - interval '30 days'`,
        [a.userId, a.skillId]
      );
      const recent = countRes.rows[0]?.n ?? 0;
      if (recent >= maxPer30Days) {
        return { ok: false as const, attemptsLeft: 0 as const };
      }
      const rows = await client.query<AttemptRow>(
        `insert into attempts (id, user_id, skill_id, score, percentile, passed, answers, integrity_flags, created_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9) returning *`,
        [attempt.id, attempt.userId, attempt.skillId, attempt.score, attempt.percentile,
         attempt.passed, JSON.stringify(attempt.answers), attempt.integrityFlags, attempt.createdAt]
      );
      return { ok: true as const, attempt: mapAttempt(rows.rows[0]) };
    });
  }

  // JSON fallback: single-process, no concurrency to guard against
  const attempts = await readJson<Attempt[]>(ATTEMPTS_FILE, []);
  const recent = attempts.filter(
    (x) => x.userId === a.userId && x.skillId === a.skillId
      && Date.now() - new Date(x.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000
  );
  if (recent.length >= maxPer30Days) return { ok: false, attemptsLeft: 0 };
  attempts.push(attempt);
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(ATTEMPTS_FILE, JSON.stringify(attempts.slice(-2000), null, 2));
  return { ok: true, attempt };
}

// ── job applications ─────────────────────────────────────────
export const APPLICATION_STAGES = ["applied", "shortlisted", "challenge", "interview", "offer", "rejected"] as const;
export type ApplicationStage = (typeof APPLICATION_STAGES)[number];

export function applicationStages(): ApplicationStage[] {
  return [...APPLICATION_STAGES] as ApplicationStage[];
}

export type Application = {
  id: string;
  jobId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  /** legacy column, nullable — new rows never write it (PRD F7.1) */
  college?: string | null;
  /** verified scores at apply time, snapshot: skillId → score */
  scores: Record<string, number>;
  matchPercent: number;
  stage: ApplicationStage;
  createdAt: string;
  updatedAt: string;
};

/** Recruiter-facing serializer: drops college in both GET and PATCH. */
export function toRecruiterView(app: Application): Omit<Application, "college"> {
  const { college: _college, ...view } = app;
  void _college;
  return view;
}

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
      `update applications set college = null where college is not null and false; -- (guarded no-op: schema keeps legacy column null-safe)
       select * from applications order by created_at desc limit 5000`
    );
    return rows.map(mapApplication);
  }
  return readJson<Application[]>(APPLICATIONS_FILE, []);
}

export async function addApplication(
  a: Omit<Application, "id" | "createdAt" | "updatedAt" | "college">
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
       values ($1,$2,$3,$4,$5,NULL,$6,$7,$8,$9,$10) returning *`,
      [app.id, app.jobId, app.studentId, app.studentName, app.studentEmail,
       JSON.stringify(app.scores), app.matchPercent, app.stage,
       app.createdAt, app.updatedAt]
    );
    return mapApplication(rows[0]);
  }
  const apps = await readJson<Application[]>(APPLICATIONS_FILE, []);
  apps.push({ ...app, college: null });
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(APPLICATIONS_FILE, JSON.stringify(apps.slice(-5000), null, 2));
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

/**
 * Stage update with ownership in the SQL (CWE-639): the update only
 * matches applications whose job belongs to the recruiter. Returns
 * the updated application or undefined when not found/not owned.
 */
export async function updateApplicationStageForRecruiter(
  id: string,
  stage: ApplicationStage,
  recruiterId: string
): Promise<Application | undefined> {
  if (hasDb()) {
    const rows = await query<ApplicationRow>(
      `update applications
         set stage = $2, updated_at = now()
       where id = $1
         and job_id in (select id from posted_jobs where recruiter_id = $3)
       returning *`,
      [id, stage, recruiterId]
    );
    return rows[0] ? mapApplication(rows[0]) : undefined;
  }
  const apps = await readJson<Application[]>(APPLICATIONS_FILE, []);
  const ownedJobIds = new Set(
    (await readPostedJobs()).filter((j) => j.recruiterId === recruiterId).map((j) => j.id)
  );
  const app = apps.find((x) => x.id === id && ownedJobIds.has(x.jobId));
  if (!app) return undefined;
  app.stage = stage;
  app.updatedAt = new Date().toISOString();
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(APPLICATIONS_FILE, JSON.stringify(apps, null, 2));
  return app;
}

/** Null out any legacy college values (run once via db:disable-demo/db:migrate-college). */
export async function scrubLegacyCollege(): Promise<void> {
  if (hasDb()) {
    await query(`update applications set college = null where college is not null`);
  }
  const apps = await readJson<Application[]>(APPLICATIONS_FILE, []);
  let changed = false;
  for (const app of apps) {
    if (app.college) {
      app.college = null;
      changed = true;
    }
  }
  if (changed) {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(APPLICATIONS_FILE, JSON.stringify(apps, null, 2));
  }
}

/** Duplicate-application guard for the POST /api/applications route. */
export async function findApplication(
  jobId: string,
  studentId: string
): Promise<Application | undefined> {
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
  /** drafts are excluded from the public feed (CWE-863) */
  status: "draft" | "published";
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
  status: string | null;
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
    status: r.status === "draft" ? "draft" : "published",
    createdAt: iso(r.created_at),
  };
}

const POSTED_JOBS_FILE = path.join(DATA_DIR, "posted-jobs.json");

/** Only published jobs reach the public feed. */
export async function readPostedJobs(): Promise<PostedJob[]> {
  if (hasDb()) {
    const rows = await query<PostedJobRow>(
      `select * from posted_jobs where status = 'published' order by created_at desc`
    );
    return rows.map(mapPostedJob);
  }
  return (await readJson<PostedJob[]>(POSTED_JOBS_FILE, []))
    .filter((j) => (j.status ?? "published") === "published")
    .sort((x, y) => y.createdAt.localeCompare(x.createdAt));
}

export async function addPostedJob(j: Omit<PostedJob, "id" | "createdAt">): Promise<PostedJob> {
  const job: PostedJob = {
    ...j,
    id: `pj_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
  };
  if (hasDb()) {
    const rows = await query<PostedJobRow>(
      `insert into posted_jobs (id, recruiter_id, role, company, location, salary, type, skills, description, perks, status, created_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) returning *`,
      [job.id, job.recruiterId, job.role, job.company, job.location, job.salary,
       job.type, JSON.stringify(job.skills), job.description, JSON.stringify(job.perks),
       job.status, job.createdAt]
    );
    return mapPostedJob(rows[0]);
  }
  const jobs = await readJson<PostedJob[]>(POSTED_JOBS_FILE, []);
  jobs.push(job);
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(POSTED_JOBS_FILE, JSON.stringify(jobs, null, 2));
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
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(POSTED_JOBS_FILE, JSON.stringify(next, null, 2));
  return true;
}
