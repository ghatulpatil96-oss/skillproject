-- ─────────────────────────────────────────────────────────────
-- SkillBridge schema (Neon/Postgres) — applied automatically by
-- lib/db.ts on first DB use, and by `npm run db:setup`.
-- Idempotent: safe to run any number of times.
-- ─────────────────────────────────────────────────────────────

create table if not exists users (
  id                  text primary key,
  email               text not null unique,
  name                text not null,
  password_hash       text not null,
  role                text not null check (role in ('student', 'recruiter', 'admin')),
  college             text,
  grad_year           int,
  company             text,
  verified_recruiter  boolean not null default false,
  created_at          timestamptz not null default now()
);

create table if not exists attempts (
  id               text primary key,
  user_id          text not null references users(id),
  skill_id         text not null,
  score            int not null check (score between 0 and 100),
  percentile       int not null check (percentile between 0 and 99),
  passed           boolean not null,
  answers          jsonb not null default '{}',
  integrity_flags  int not null default 0,
  created_at       timestamptz not null default now()
);
create index if not exists attempts_user_created_idx  on attempts (user_id, created_at desc);
create index if not exists attempts_skill_created_idx on attempts (skill_id, created_at desc);

create table if not exists applications (
  id             text primary key,
  job_id         text not null,
  student_id     text not null references users(id),
  student_name   text not null,
  student_email  text not null,
  college        text,
  scores         jsonb not null default '{}',
  match_percent  int not null default 0,
  stage          text not null default 'applied' check
                 (stage in ('applied', 'shortlisted', 'challenge', 'interview', 'offer', 'rejected')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists applications_job_idx     on applications (job_id, created_at desc);
create index if not exists applications_student_idx on applications (student_id, created_at desc);

create table if not exists posted_jobs (
  id            text primary key,
  recruiter_id  text not null references users(id),
  role          text not null,
  company       text not null,
  location      text not null default 'Remote, India',
  salary        text not null default '',
  type          text not null default 'Full-time' check (type in ('Full-time', 'Internship')),
  skills        jsonb not null default '[]',
  description   text not null default '',
  perks         jsonb not null default '[]',
  created_at    timestamptz not null default now()
);
create index if not exists posted_jobs_recruiter_idx on posted_jobs (recruiter_id, created_at desc);

create table if not exists outbox (
  id          text primary key,
  to_email    text not null,
  subject     text not null,
  html        text not null,
  text        text not null,
  kind        text not null,
  delivered   text not null default 'outbox' check (delivered in ('resend', 'outbox')),
  created_at  timestamptz not null default now()
);
create index if not exists outbox_created_idx on outbox (created_at desc);
