# Backend setup runbook — Neon (database) · Auth · Resend (email)

This is the 15-minute path from the local JSON MVP to a real backend.
Everything is already wired in code — you only add three environment
variables and run one command.

## How the backends switch

Every store (`lib/auth.ts`, `lib/store.ts`, `lib/email.ts`) checks
`process.env.DATABASE_URL`:

| DATABASE_URL | users | attempts / applications / jobs | email outbox |
|---|---|---|---|
| **set** | Neon `users` table | Neon tables | `outbox` table |
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
2. Add to `.env.local`:

   ```
   RESEND_API_KEY=re_xxxxxxxxxxxx
   ```

3. Restart. Every notification (welcome, test result, application updates,
   recruiter verification) now **actually sends** — and is still recorded in
   the outbox with `delivered: "resend"`.

**Sender address:** until you verify a domain, Resend only delivers to the
email you signed up with, from `onboarding@resend.dev` (the default
`EMAIL_FROM`). For real users:

4. Resend dashboard → **Domains** → add your domain → paste the DNS records
   it shows into your DNS provider → wait for verification.
5. Set `EMAIL_FROM=SkillBridge <hello@yourdomain.in>` and redeploy.

Failed Resend calls are logged to the server console (status + body) and the
email still lands in the outbox, so nothing is silently lost.

---

## Checklist

- [ ] `DATABASE_URL` in `.env.local` → `npm run db:setup` → tables visible in Neon
- [ ] `AUTH_SECRET` set in the production environment (≥32 chars)
- [ ] `DEMO_MODE=false` in production
- [ ] `RESEND_API_KEY` set; domain verified for real senders; `EMAIL_FROM` on your domain
- [ ] `NEXT_PUBLIC_SITE_URL=https://yourdomain` so email links point at production
- [ ] Sign up a test account → row in Neon `users` → welcome email in Resend dashboard
