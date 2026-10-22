import { createHash, randomBytes } from "node:crypto";
import { dbReady, hasDb, query, requireDb, withTransaction } from "@/lib/db";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function recordPasswordChangeAttempt(userId: string): Promise<number> {
  requireDb();
  const rows = await query<{ attempts: number }>(
    `insert into password_change_attempts (user_id, window_started_at, attempts)
     values ($1, now(), 1)
     on conflict (user_id) do update set
       window_started_at = case
         when password_change_attempts.window_started_at <= now() - interval '15 minutes'
           then now()
         else password_change_attempts.window_started_at
       end,
       attempts = case
         when password_change_attempts.window_started_at <= now() - interval '15 minutes'
           then 1
         else password_change_attempts.attempts + 1
       end
     returning attempts`,
    [userId]
  );
  return rows[0].attempts;
}

export async function createPasswordResetToken(userId: string): Promise<string> {
  requireDb();
  await dbReady();
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashResetToken(token);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS).toISOString();

  await withTransaction(async (client) => {
    const account = await client.query<{ id: string }>(
      `select id from users where id = $1 for update`,
      [userId]
    );
    if (!account.rows[0]) throw new Error("Password reset account was not found.");
    await client.query(
      `update password_reset_tokens
       set used_at = coalesce(used_at, now())
       where user_id = $1 and used_at is null`,
      [userId]
    );
    await client.query(
      `insert into password_reset_tokens (user_id, token_hash, expires_at)
       values ($1, $2, $3)`,
      [userId, tokenHash, expiresAt]
    );
  });
  return token;
}

export async function resetPasswordWithToken(
  token: string,
  passwordHash: string
): Promise<{ userId: string; sessionVersion: number } | undefined> {
  requireDb();
  await dbReady();
  const tokenHash = hashResetToken(token);

  return withTransaction(async (client) => {
    const claimed = await client.query<{ user_id: string }>(
      `update password_reset_tokens
       set used_at = now()
       where token_hash = $1 and used_at is null and expires_at > now()
       returning user_id`,
      [tokenHash]
    );
    const userId = claimed.rows[0]?.user_id;
    if (!userId) return undefined;

    const updated = await client.query<{ session_version: number }>(
      `update users
       set password_hash = $2, session_version = session_version + 1
       where id = $1
       returning session_version`,
      [userId, passwordHash]
    );
    if (!updated.rows[0]) {
      throw new Error("Reset token referenced a missing account.");
    }
    return { userId, sessionVersion: updated.rows[0].session_version };
  });
}

export function ensureAccountSecurityDatabase(): void {
  if (!hasDb()) {
    throw new Error("DATABASE_URL is required for account security operations.");
  }
}
