-- Account security and email delivery fields for SkillBridge.
-- Apply to Neon before deploying the application changes.

alter table users add column if not exists session_version int not null default 0;
alter table users add column if not exists email_login_notifications boolean not null default true;

create table if not exists email_log (
  id          bigserial primary key,
  to_email    text not null,
  template    text not null,
  status      text not null check (status in ('sent', 'failed', 'outbox')),
  provider_id text,
  error       text,
  created_at  timestamptz not null default now()
);
create index if not exists email_log_created_idx on email_log (created_at desc);

create table if not exists password_reset_tokens (
  id          bigserial primary key,
  user_id     text not null references users(id) on delete cascade,
  token_hash  text not null unique,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null,
  used_at     timestamptz
);
create index if not exists password_reset_tokens_user_created_idx
  on password_reset_tokens (user_id, created_at desc);

create table if not exists password_change_attempts (
  user_id           text primary key references users(id) on delete cascade,
  window_started_at timestamptz not null,
  attempts          int not null default 0
);
