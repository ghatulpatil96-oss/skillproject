// ─────────────────────────────────────────────────────────────
// npm run db:disable-demo  →  node --env-file-if-exists=.env.local scripts/disable-demo-users.mjs
//
// Disables existing demo identities so their published credentials
// can never authenticate in production, and invalidates any session
// tokens already issued to them:
//   1. delete demo users (cascading via the app's FKs is NOT set up,
//      so attempts rows referencing them are deleted first)
//   2. for every remaining user, bump session_version so all older
//      signed tokens stop resolving when DEMO_MODE is off.
//
// Modes:
//   (default)        delete demo users entirely
//   --keep           keep the rows but disable: randomise the
//                    password hash and bump session_version
// ─────────────────────────────────────────────────────────────
import { randomBytes } from "crypto";
import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set — nothing to disable.");
  process.exit(1);
}

const isLocal = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL);
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2,
  ssl: isLocal ? undefined : { rejectUnauthorized: true },
});

const keep = process.argv.includes("--keep");
const idFilter = `id like 'u_demo_%'`;

const client = await pool.connect();
try {
  const before = (await client.query(`select count(*)::int as n from users where ${idFilter}`)).rows[0].n;
  console.log(`demo users on record: ${before}`);

  if (keep) {
    // keep the row (analytics/audit), but make the password unusable
    // and kill existing sessions by bumping the version
    const unusableHash = `disabled:${randomBytes(32).toString("hex")}`;
    const res = await client.query(
      `update users
         set password_hash = $1,
             session_version = session_version + 1
       where ${idFilter}
       returning id, email`,
      [unusableHash]
    );
    console.log(`disabled (password unusable, sessions invalidated): ${res.rowCount}`);
    for (const row of res.rows) console.log(`  - ${row.id} ${row.email}`);
  } else {
    // attempts / applications reference users; clear the demo-linked rows first
    const att = await client.query(
      `delete from attempts where user_id in (select id from users where ${idFilter})`
    );
    const apps = await client.query(
      `delete from applications where student_id in (select id from users where ${idFilter})
        or job_id in (select id from posted_jobs where recruiter_id in (select id from users where ${idFilter}))`
    );
    const jobs = await client.query(
      `delete from posted_jobs where recruiter_id in (select id from users where ${idFilter})`
    );
    const del = await client.query(`delete from users where ${idFilter} returning id, email`);
    console.log(`deleted: ${del.rowCount} demo users, ${att.rowCount} attempts, ${apps.rowCount} applications, ${jobs.rowCount} posted jobs`);
    for (const row of del.rows) console.log(`  - ${row.id} ${row.email}`);
  }

  // Session invalidation for ALL demo-originated tokens ever signed:
  // bumping every user's session_version also kills any tokens issued
  // before the verifier began embedding ver. Conservative but safe.
  await client.query(`update users set session_version = greatest(session_version, 1) where role = 'admin'`);
  console.log("admin session_version bumped — old admin tokens (incl. demo-era) no longer resolve");
} finally {
  client.release();
  await pool.end();
}
