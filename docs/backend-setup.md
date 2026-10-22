# Backend setup runbook — Neon (database) · Auth · Resend (email)

This is the setup path from the local JSON MVP to the production backend.
Production requires Neon, Resend, and the site URL environment variables.

## How the backends switch

Every store (`lib/auth.ts`, `lib/store.ts`, `lib/email.ts`) checks
`process.env.DATABASE_URL`:

| DATABASE_URL | users | attempts / applications / jobs | email outbox |
|---|---|---|---|
| **set** | Neon `users` table | Neon tables | Resend in production; `email_log` records each attempt |
| empty | `.data/users.json` | `.data/*.json` | `.data/outbox.json` |

Sessions do NOT depend on the database: they are HMAC-signed cookies
verified in middleware with Web Crypto (edge-safe) and re-checked against
the user store in server layouts/routes.

---

## 1. Neon (database)

1. Create a free account at **https://neon.tech** → **New Project**
   (any name, region close to your users, e.g. Singapore/Mumbai for India).
2. Open the dashboard → **Connection string** → copy the **pooled** string
   (it looks like `postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require`).
3. Create `.env.local` in the project root:

   ```
   DATABASE_URL=postgresql://…pooler…neondb?sslmode=require
   ```

4. Run the one-command setup (applies the schema and migrates everything
   from `.data/*.json` — users, attempts, applications, posted jobs, outbox):

   ```bash
   npm run db:setup
   ```

5. Restart the dev server. Done — every login, test attempt, application
   and job post now writes to Neon. `.data/` is left untouched as a backup.

Before deploying account-security changes, open the Neon SQL Editor and run
[`scripts/migrations/001_account_security_and_email.sql`](../scripts/migrations/001_account_security_and_email.sql).
This adds the login-email preference, reset-token and password-rate-limit tables,
and the email delivery log. Run it before deploying the matching application code.

Verify: the Neon dashboard → **Tables** should show `users` with your
accounts (including the demo ones). `npm run db:setup` is idempotent —
safe to re-run any time.

## 2. Authentication (already built — just needs env in production)

- Passwords: async scrypt (16-byte salt, 64-byte key), constant-time compare.
- Sessions: HMAC-SHA256 signed cookie `sb_session` carrying `{userId, role, exp}`;
  verified in middleware (Web Crypto, constant-time) and re-checked against
  the DB in `app/recruiter/layout.tsx` / `app/admin/layout.tsx`.
- Login/signup are rate-limited (5 per 15 min per IP+email); signup can
  never create an admin.

For **production** you only need:

```
AUTH_SECRET=<run: node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))">
```

The server refuses to start in production without it (min 32 chars).
Keep `DEMO_MODE=false` in production so no known-password demo accounts
get seeded.

## 3. Resend (email)

1. Create an account at **https://resend.com** → **API Keys** → create one.
2. Verify a sending domain in Resend for delivery to users other than your own
   Resend account email.
3. Configure the environment:

   ```
   RESEND_API_KEY=<Resend API key>
   EMAIL_FROM=SkillBridge <hello@yourdomain.in>
   NEXT_PUBLIC_SITE_URL=https://yourdomain.in
   ```

   Production fails clearly when `RESEND_API_KEY`, `EMAIL_FROM`, or
   `NEXT_PUBLIC_SITE_URL` is missing. Production email links use the configured
   site URL and never fall back to localhost.

**Sender format:** `Display Name <address@your-verified-domain.com>`, for
example `SkillBridge <hello@yourdomain.in>`. `onboarding@resend.dev` is a
Resend testing sender and only delivers to the email address on your own
Resend account; other users will not receive messages from it.

Run a delivery check without exposing the API key:

```bash
npm run email:test -- recipient@example.com
```

The script prints the Resend response ID or the provider error. Each send
attempt is recorded in Neon `email_log` with its status, provider ID, and error.
Production failures are not treated as success and are never routed to the
development outbox.

---

## Checklist

- [ ] `DATABASE_URL` in `.env.local` → `npm run db:setup` → tables visible in Neon
- [ ] `AUTH_SECRET` set in the production environment (≥32 chars)
- [ ] `DEMO_MODE=false` in production
- [ ] Run `scripts/migrations/001_account_security_and_email.sql` on Neon before deploying
- [ ] `RESEND_API_KEY` set; sending domain verified; `EMAIL_FROM` uses `Display Name <verified-address@domain>`
- [ ] `NEXT_PUBLIC_SITE_URL=https://yourdomain` so email links point at production
- [ ] `npm run email:test -- recipient@example.com` prints a Resend ID
- [ ] Sign up a test account → row in Neon `users` → welcome email in Resend dashboard
