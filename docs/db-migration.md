# Database migration plan — JSON stores → Postgres (Supabase)

**Status: plan only. No migration has been run.** The current MVP persists to
`$PWD/.data/*.json` via `lib/auth.ts`, `lib/store.ts` and `lib/email.ts`.
That works on a long-lived Node box but **cannot run on serverless hosting**
(Vercel/Lambda): the filesystem is ephemeral, writes race without locks, and
every read scans and rewrites whole files.

Target: **Supabase Postgres** (free tier fits the ₹0 stack). Access through
`@supabase/supabase-js` with the **service-role key server-side only** —
never exposed to the browser. Row Level Security (RLS) stays ON with
deny-by-default policies; all reads/writes flow through our API routes so
authz stays in one place (middleware + layouts + route handlers).

---

## 1. Tables

```sql
-- lib/auth.ts user store (.data/users.json)
create table users (
  id            text primary key,                    -- keep existing "u_…" ids
  email         text not null unique,
  name          text not null,
  password_hash text not null,                       -- scrypt "salt:hash"
  role          text not null check (role in ('student','recruiter','admin')),
  college       text,
  grad_year     int,
  company       text,
  verified_recruiter boolean not null default false,
  created_at    timestamptz not null default now()
);

-- lib/store.ts attempts (.data/attempts.json)
create table attempts (
  id              text primary key,                  -- "at_…"
  user_id         text not null references users(id),
  skill_id        text not null,
  score           int   not null check (score between 0 and 100),
  percentile      int   not null check (percentile between 0 and 99),
  passed          boolean not null,
  answers         jsonb  not null default '{}',      -- questionId → index
  integrity_flags int    not null default 0,
  created_at      timestamptz not null default now()
);
create index attempts_user_created_idx  on attempts (user_id, created_at desc);
create index attempts_skill_created_idx on attempts (skill_id, created_at desc);
-- F3.4 attempt window + percentile queries use these two indexes.

-- lib/store.ts applications (.data/applications.json)
create table applications (
  id            text primary key,                    -- "ap_…"
  job_id        text not null,
  student_id    text not null references users(id),
  student_name  text not null,
  student_email text not null,
  college       text,
  scores        jsonb not null default '{}',         -- apply-time snapshot
  match_percent int   not null default 0,
  stage         text not null default 'applied' check
                (stage in ('applied','shortlisted','challenge','interview','offer','rejected')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index applications_job_idx     on applications (job_id, created_at desc);
create index applications_student_idx on applications (student_id, created_at desc);

-- lib/store.ts posted jobs (.data/posted-jobs.json)
create table posted_jobs (
  id           text primary key,                     -- "pj_…"
  recruiter_id text not null references users(id),
  role         text not null,
  company      text not null,
  location     text not null default 'Remote, India',
  salary       text not null default '',
  type         text not null default 'Full-time' check (type in ('Full-time','Internship')),
  skills       jsonb not null default '[]',          -- [{skillId, minScore}]
  description  text not null default '',
  perks        jsonb not null default '[]',
  created_at   timestamptz not null default now()
);
create index posted_jobs_recruiter_idx on posted_jobs (recruiter_id, created_at desc);

-- lib/email.ts outbox (.data/outbox.json)
create table outbox (
  id          text primary key,                      -- "e_…"
  to_email    text not null,
  subject     text not null,
  html        text not null,
  text        text not null,
  kind        text not null,
  delivered   text not null default 'outbox' check (delivered in ('resend','outbox')),
  created_at  timestamptz not null default now()
);
create index outbox_created_idx on outbox (created_at desc);
```

Optional later: `test_sessions` (persist the signed-ticket start server-side
instead of HMAC tickets), `integrity_flags`, `saved_jobs` (promote from
localStorage), `audit_log` for admin actions.

---

## 2. Function-by-function mapping

### lib/auth.ts

| Today (JSON) | Postgres version |
|---|---|
| `readUsers()` / `writeUsers()` | `select * from users` / `update … where id=` (row-level writes; no more read-modify-write of a whole file) |
| `buildDemoUsers()` seeding | one-off SQL seed script (still gated by `DEMO_MODE`) |
| `findUserByEmail()` | `select … where email = lower($1)` |
| `createUser()` | `insert into users …` (id generated in app or `gen_random_uuid()`) |
| `hashPassword` / `verifyPassword` | unchanged app-side scrypt (async already); alternative: Supabase Auth `signUp`/`signInWithPassword` if we want managed sessions later |
| `getUserFromToken()` | session cookie stays an HMAC token (middleware-compatible); it maps to `select * from users where id = payload.userId` |
| `setRecruiterVerified()` | `update users set verified_recruiter = $2 where id = $1 and role = 'recruiter'` |
| `recruitersWithStatus()` | `select … from users where role = 'recruiter'` |

### lib/store.ts

| Today | Postgres version |
|---|---|
| `readAttempts` / `addAttempt` | `insert into attempts …` / `select … order by created_at desc` |
| `attemptsByUser(userId)` | indexed select; the 3-per-30-days check becomes `select count(*) where user_id=$1 and skill_id=$2 and created_at > now() - interval '30 days'` |
| `readAttempts()` for percentile | `select score from attempts where skill_id=$1` (or a `percentile_cont` window function) |
| `readApplications` / `addApplication` / `applicationsForJob` / `applicationsByStudent` / `updateApplicationStage` / `findApplication` | direct inserts/indexed selects; `update_application_stage` also bumps `updated_at` |
| `readPostedJobs` / `addPostedJob` / `postedJobsByRecruiter` / `deletePostedJob` | same shape; delete keeps `and recruiter_id = $2` ownership check in SQL |

### lib/email.ts

| Today | Postgres version |
|---|---|
| `readOutbox` / `writeOutbox` | `insert into outbox …`; listing is indexed select |
| Resend send path | unchanged; on success `update outbox set delivered='resend'` |
| (new idea) delivery worker | a cron queries `outbox where delivered='outbox'` and retries — turns the outbox into a real queue |

---

## 3. Migration order (when we decide to go)

1. **Data layer seam first** — the store functions are already the seam; back
   them with a `lib/db.ts` (Supabase client) behind the same exported
   signatures so no route changes.
2. **Schema + seed** — run the SQL above; migrate existing `.data/*.json` with
   a one-off import script (ids preserved).
3. **Dual-write behind a flag** (`DATA_BACKEND=json|pg`) and diff reads for a
   few days on the demo deploy.
4. **Cut over + drop file writes**; keep `.data/` export as backup.
5. Sessions: keep the HMAC cookie + `AUTH_SECRET` — middleware is already
   DB-free by design, so the edge layer needs **no changes**.

## 4. Gotchas

- Keep `AUTH_SECRET`/service-role keys in server env only; RLS deny-by-default
  means a leaked anon key reads nothing.
- `answers`/`skills`/`perks` jsonb columns: fine now; normalize later only if
  we need to query inside them.
- Percentile queries on attempts want the `(skill_id, created_at)` index —
  included above.
- The JSON stores currently cap history (attempts 2000, outbox 200) — Postgres
  removes those caps; add `limit` to listing queries.
