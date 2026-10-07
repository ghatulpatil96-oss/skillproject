// ─────────────────────────────────────────────────────────────
// Neon / Postgres access layer.
//
// Auto-detection: when DATABASE_URL is set, every store module
// (lib/auth.ts, lib/store.ts, lib/email.ts) persists to Postgres;
// without it they fall back to the original .data/*.json stores,
// so local dev keeps working with zero configuration.
//
// The schema (scripts/schema.sql) is applied lazily and
// idempotently on the first DB call — no separate migration step
// needed for a fresh Neon project.
// ─────────────────────────────────────────────────────────────
import { Pool } from "pg";
import { readFileSync } from "fs";
import path from "path";

let pool: Pool | null = null;
let readyPromise: Promise<void> | null = null;

export function hasDb(): boolean {
  return !!process.env.DATABASE_URL;
}

function getPool(): Pool {
  if (!pool) {
    const cs = process.env.DATABASE_URL as string;
    const isLocal = /localhost|127\.0\.0\.1/.test(cs);
    pool = new Pool({
      connectionString: cs,
      max: 3,
      // Neon requires TLS; pg honours sslmode in the URL, this is the belt
      ssl: isLocal ? undefined : { rejectUnauthorized: false },
    });
  }
  return pool;
}

/** Simple parameterised query helper. Returns rows. */
export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  await dbReady();
  try {
    const res = await getPool().query(text, params as never[]);
    return res.rows as T[];
  } catch (err) {
    console.error("[db] query failed:", (err as Error).message);
    throw err;
  }
}

/** Applies scripts/schema.sql once per process (idempotent DDL). */
async function applySchema(): Promise<void> {
  const sqlPath = path.join(process.cwd(), "scripts", "schema.sql");
  const sql = readFileSync(sqlPath, "utf-8");
  await getPool().query(sql);
}

export function dbReady(): Promise<void> {
  if (!readyPromise) {
    readyPromise = applySchema().catch((err) => {
      readyPromise = null; // allow retry on next call
      console.error(
        "[db] Could not reach Postgres — check DATABASE_URL. " +
          "Without DATABASE_URL the app falls back to .data JSON stores.",
        (err as Error).message
      );
      throw err;
    });
  }
  return readyPromise;
}

/** Used when DATABASE_URL is present — throws early with a clear message. */
export function requireDb(): void {
  if (!hasDb()) {
    throw new Error("[db] DATABASE_URL is not set — cannot use the Postgres path.");
  }
}
