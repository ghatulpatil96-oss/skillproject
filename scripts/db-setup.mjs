// ─────────────────────────────────────────────────────────────
// npm run db:setup  →  node --env-file-if-exists=.env.local scripts/db-setup.mjs
//
// 1. applies scripts/schema.sql (idempotent)
// 2. migrates every existing .data/*.json record into Neon
//    (idempotent — conflicts on id/email are skipped)
// Run it again any time; it only adds what's missing.
// ─────────────────────────────────────────────────────────────
import { readFileSync, existsSync } from "fs";
import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error(
    "DATABASE_URL is not set.\n" +
      "1. Create a free project at https://neon.tech\n" +
      "2. Copy the pooled connection string\n" +
      "3. Put it in .env.local as DATABASE_URL=postgres://…\n" +
      "4. Run `npm run db:setup` again."
  );
  process.exit(1);
}

const isLocal = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL);
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2,
  ssl: isLocal ? undefined : { rejectUnauthorized: false },
});

function readJson(name) {
  const p = `.data/${name}.json`;
  if (!existsSync(p)) return [];
  try {
    return JSON.parse(readFileSync(p, "utf-8"));
  } catch {
    return [];
  }
}

async function main() {
  console.log("• applying schema…");
  await pool.query(readFileSync("scripts/schema.sql", "utf-8"));

  let counts = {};

  // ── users ──
  for (const u of readJson("users")) {
    await pool.query(
      `insert into users (id, email, name, password_hash, role, college, grad_year, company, verified_recruiter, created_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       on conflict (id) do nothing`,
      [u.id, u.email.toLowerCase(), u.name, u.passwordHash, u.role, u.college ?? null,
       u.gradYear ?? null, u.company ?? null, u.verifiedRecruiter ?? false, u.createdAt ?? null]
    );
  }
  counts.users = (await pool.query("select count(*)::int as n from users")).rows[0].n;

  // ── attempts ──
  for (const a of readJson("attempts")) {
    await pool.query(
      `insert into attempts (id, user_id, skill_id, score, percentile, passed, answers, integrity_flags, created_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9) on conflict (id) do nothing`,
      [a.id, a.userId, a.skillId, a.score, a.percentile, a.passed,
       JSON.stringify(a.answers ?? {}), a.integrityFlags ?? 0, a.createdAt ?? null]
    );
  }
  counts.attempts = (await pool.query("select count(*)::int as n from attempts")).rows[0].n;

  // ── applications ──
  for (const a of readJson("applications")) {
    await pool.query(
      `insert into applications (id, job_id, student_id, student_name, student_email, college, scores, match_percent, stage, created_at, updated_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) on conflict (id) do nothing`,
      [a.id, a.jobId, a.studentId, a.studentName, a.studentEmail, a.college ?? null,
       JSON.stringify(a.scores ?? {}), a.matchPercent ?? 0, a.stage ?? "applied",
       a.createdAt ?? null, a.updatedAt ?? null]
    );
  }
  counts.applications = (await pool.query("select count(*)::int as n from applications")).rows[0].n;

  // ── posted jobs ──
  for (const j of readJson("posted-jobs")) {
    await pool.query(
      `insert into posted_jobs (id, recruiter_id, role, company, location, salary, type, skills, description, perks, created_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) on conflict (id) do nothing`,
      [j.id, j.recruiterId, j.role, j.company, j.location, j.salary ?? "",
       j.type ?? "Full-time", JSON.stringify(j.skills ?? []), j.description ?? "",
       JSON.stringify(j.perks ?? []), j.createdAt ?? null]
    );
  }
  counts.posted_jobs = (await pool.query("select count(*)::int as n from posted_jobs")).rows[0].n;

  // ── outbox ──
  for (const e of readJson("outbox")) {
    await pool.query(
      `insert into outbox (id, to_email, subject, html, text, kind, delivered, created_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8) on conflict (id) do nothing`,
      [e.id, e.to, e.subject, e.html, e.text, e.kind, e.delivered ?? "outbox", e.createdAt ?? null]
    );
  }
  counts.outbox = (await pool.query("select count(*)::int as n from outbox")).rows[0].n;

  console.log("✓ Neon ready. Row counts:", counts);
  console.log("  (.data/*.json is left untouched as a backup)");
}

main()
  .catch((err) => {
    console.error("db:setup failed:", err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
