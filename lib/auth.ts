// ─────────────────────────────────────────────────────────────
// Auth core — password hashing (node:crypto scrypt, async),
// signed session cookies (HMAC, timing-safe compare, role inside
// the payload), and a user store that runs on Neon Postgres when
// DATABASE_URL is set (falls back to .data/users.json otherwise).
// Zero-dependency sessions so the edge middleware stays DB-free.
//
// Demo-account policy (CWE-798):
//  • Demo users (id prefix `u_demo_`) exist only when DEMO_MODE is on.
//  • When demo mode is OFF they are rejected at login AND at session
//    lookup, so imported demo identities can never authenticate.
//  • session_version lets scripts/disable-demo-users.mjs invalidate
//    already-issued sessions for disabled demo accounts.
// ─────────────────────────────────────────────────────────────
import { createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { promises as fs } from "fs";
import path from "path";
import type { Role } from "@/lib/types";
import { hasDb, query } from "@/lib/db";

const scrypt = promisify(scryptCb) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number
) => Promise<Buffer>;

const DATA_DIR = process.env.SKILLBRIDGE_DATA_DIR ?? path.join(process.cwd(), ".data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
export const SESSION_COOKIE = "sb_session";

export type { Role };
export type { Role as RoleType };

/** Demo identities are prefixed so they can be recognised everywhere. */
export function isDemoUserId(id: string): boolean {
  return id.startsWith("u_demo_");
}

// ── session secret (fail fast in production) ─────────────────
const DEV_SECRET_FALLBACK = "skillbridge-dev-secret-change-in-production";

function resolveSecret(): string {
  const s = process.env.AUTH_SECRET;
  if (process.env.NODE_ENV === "production") {
    if (!s || s.length < 32) {
      throw new Error(
        "[SkillBridge] AUTH_SECRET is required in production and must be at least 32 characters. " +
          "Set it in the environment and restart the server."
      );
    }
    return s;
  }
  return s ?? DEV_SECRET_FALLBACK;
}

const SECRET = resolveSecret();

// Demo accounts (and demo seed data elsewhere) exist only in local
// development. PRODUCTION NEVER SEEDS DEMO USERS — irrespective of
// any DEMO_MODE value baked into the environment. The purge script
// (scripts/purge-demo-data.ts) removes any demo rows already in the DB.
export const DEMO_MODE =
  process.env.NODE_ENV !== "production" && process.env.DEMO_MODE !== "false";

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: string;
  // student fields
  college?: string;
  gradYear?: number;
  // recruiter fields
  company?: string;
  verifiedRecruiter?: boolean;
  // bumped by disable scripts; > version in the token payload → session dead
  sessionVersion?: number;
  emailLoginNotifications?: boolean;
};

export type SessionPayload = { userId: string; role: Role; exp: number; ver?: number }; // exp = epoch ms

// ── passwords (async scrypt — never blocks the event loop) ───
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, 64);
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = await scrypt(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

// ── session tokens (base64url(payload).hmac) ─────────────────
function b64url(input: string): string {
  return Buffer.from(input, "utf-8").toString("base64url");
}
function sign(data: string): string {
  return createHmac("sha256", SECRET).update(data).digest("base64url");
}

/** Sign arbitrary server-side payloads (e.g. anti-cheat test tickets). */
export function signPayload(data: string): string {
  return sign(data);
}

/** Constant-time signature check for signed payloads. */
export function signatureMatches(data: string, signature: string): boolean {
  const expected = Buffer.from(sign(data));
  const got = Buffer.from(signature);
  return expected.length === got.length && timingSafeEqual(expected, got);
}

export function createSessionToken(
  userId: string,
  role: Role,
  days = 30,
  sessionVersion = 0
): string {
  const payload: SessionPayload = {
    userId,
    role,
    exp: Date.now() + days * 24 * 60 * 60 * 1000,
    ver: sessionVersion,
  };
  const body = b64url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  // constant-time compare — never String === on signatures
  if (!signatureMatches(body, sig)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf-8")) as SessionPayload;
    if (!payload.userId || !payload.role || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Pull the session cookie value out of a Request (API routes). */
export function tokenFromRequest(req: Request): string | undefined {
  const cookie = req.headers.get("cookie");
  if (!cookie) return undefined;
  return cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`))?.[1];
}

// ── user store — Postgres (Neon) ─────────────────────────────
const DEMO_PASSWORD = "skillbridge123";

type UserRow = {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  role: Role;
  college: string | null;
  grad_year: number | null;
  company: string | null;
  verified_recruiter: boolean | null;
  session_version: number | null;
  email_login_notifications: boolean | null;
  created_at: Date | string;
};

function mapUser(r: UserRow): User {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    passwordHash: r.password_hash,
    role: r.role,
    createdAt: (r.created_at instanceof Date ? r.created_at : new Date(r.created_at)).toISOString(),
    college: r.college ?? undefined,
    gradYear: r.grad_year ?? undefined,
    company: r.company ?? undefined,
    verifiedRecruiter: r.verified_recruiter ?? undefined,
    sessionVersion: r.session_version ?? 0,
    emailLoginNotifications: r.email_login_notifications ?? true,
  };
}

type DemoSeed = {
  id: string;
  name: string;
  email: string;
  role: Role;
  college?: string;
  gradYear?: number;
  company?: string;
  verified?: boolean;
};

const DEMO_SEED: DemoSeed[] = [
  { id: "u_demo_student", name: "Ananya Sharma", email: "ananya@student.in", role: "student", college: "COEP Pune", gradYear: 2027 },
  { id: "u_demo_recruiter", name: "Riya Mehta", email: "riya@pixelforge.dev", role: "recruiter", company: "PixelForge Labs", verified: true },
  { id: "u_demo_admin", name: "Saurabh K.", email: "admin@skillbridge.local", role: "admin" },
];

let demoSeeded = false;
async function seedDemoUsersOnce() {
  if (demoSeeded || !DEMO_MODE) return;
  demoSeeded = true;
  const hash = await hashPassword(DEMO_PASSWORD);
  const now = new Date().toISOString();
  for (const d of DEMO_SEED) {
    await query(
      `insert into users (id, email, name, password_hash, role, college, grad_year, company, verified_recruiter, created_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) on conflict (id) do nothing`,
      [d.id, d.email, d.name, hash, d.role, d.college ?? null, d.gradYear ?? null,
       d.company ?? null, d.verified ?? false, now]
    );
  }
}

// ── user store — JSON fallback (.data/users.json) ────────────
async function buildDemoUsers(): Promise<User[]> {
  const now = new Date().toISOString();
  const hash = await hashPassword(DEMO_PASSWORD);
  const mk = (over: Partial<User> & { id: string; name: string; email: string; role: Role }): User => ({
    passwordHash: hash,
    createdAt: now,
    ...over,
  });
  return DEMO_SEED.map((d) =>
    mk({
      id: d.id,
      name: d.name,
      email: d.email,
      role: d.role,
      college: d.college,
      gradYear: d.gradYear,
      company: d.company,
      verifiedRecruiter: d.role === "recruiter" ? (d.verified ?? false) : undefined,
    })
  );
}

async function readUsersJson(): Promise<User[]> {
  let users: User[] = [];
  try {
    users = JSON.parse(await fs.readFile(USERS_FILE, "utf-8")) as User[];
  } catch {
    users = [];
  }
  if (DEMO_MODE) {
    const has = (id: string) => users.some((u) => u.id === id);
    if (DEMO_SEED.some((d) => !has(d.id))) {
      const demos = await buildDemoUsers();
      users = [...users, ...demos.filter((d) => !has(d.id))];
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
    }
  }
  return users;
}

/**
 * Production auth guard: a demo identity may only authenticate or
 * resolve a session while DEMO_MODE is on. Every login path and
 * session lookup must call this.
 */
function demoUserAllowed(user: User): boolean {
  if (!isDemoUserId(user.id)) return true;
  return DEMO_MODE;
}

// ── exported store API (branches on backend) ─────────────────
export async function getUserFromToken(token: string | undefined): Promise<User | null> {
  const payload = verifySessionToken(token);
  if (!payload) return null;

  let user: User | null | undefined;
  if (hasDb()) {
    await seedDemoUsersOnce();
    const rows = await query<UserRow>(`select * from users where id = $1`, [payload.userId]);
    user = rows[0] ? mapUser(rows[0]) : null;
  } else {
    user = (await readUsersJson()).find((u) => u.id === payload.userId) ?? null;
  }

  if (!user || !demoUserAllowed(user)) return null;

  // session_version — an admin script can bump it to kill old tokens
  const storedVersion = user.sessionVersion ?? 0;
  if ((payload.ver ?? 0) < storedVersion) return null;

  return user;
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  let user: User | undefined;
  if (hasDb()) {
    await seedDemoUsersOnce();
    const rows = await query<UserRow>(`select * from users where email = lower($1)`, [email]);
    user = rows[0] ? mapUser(rows[0]) : undefined;
  } else {
    user = (await readUsersJson()).find((u) => u.email.toLowerCase() === email.toLowerCase());
  }
  if (user && !demoUserAllowed(user)) return undefined;
  return user;
}

export async function findUserById(id: string): Promise<User | undefined> {
  let user: User | undefined;
  if (hasDb()) {
    const rows = await query<UserRow>(`select * from users where id = $1`, [id]);
    user = rows[0] ? mapUser(rows[0]) : undefined;
  } else {
    user = (await readUsersJson()).find((candidate) => candidate.id === id);
  }
  if (user && !demoUserAllowed(user)) return undefined;
  return user;
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  role: Role;
  gradYear?: number;
  company?: string;
}): Promise<User> {
  const id = `u_${Date.now().toString(36)}_${randomBytes(3).toString("hex")}`;
  const passwordHash = await hashPassword(input.password);
  const createdAt = new Date().toISOString();

  // college is NOT collected or stored any more (recruiter-bias decision).
  const created: User = {
    id,
    name: input.name,
    email: input.email.toLowerCase(),
    passwordHash,
    role: input.role,
    createdAt,
    gradYear: input.gradYear,
    company: input.company,
    verifiedRecruiter: input.role === "recruiter" ? false : undefined,
    sessionVersion: 0,
    emailLoginNotifications: true,
  };

  if (hasDb()) {
    const rows = await query<UserRow>(
      `insert into users (id, email, name, password_hash, role, grad_year, company, verified_recruiter, email_login_notifications, created_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) returning *`,
      [id, created.email, input.name, passwordHash, input.role,
       input.gradYear ?? null, input.company ?? null,
       input.role === "recruiter" ? false : false, true, createdAt]
    );
    return mapUser(rows[0]);
  }

  const users = await readUsersJson();
  users.push(created);
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
  return created;
}

export async function setRecruiterVerified(userId: string, verified: boolean): Promise<User | undefined> {
  if (hasDb()) {
    const rows = await query<UserRow>(
      `update users set verified_recruiter = $2 where id = $1 and role = 'recruiter' returning *`,
      [userId, verified]
    );
    return rows[0] ? mapUser(rows[0]) : undefined;
  }
  const users = await readUsersJson();
  const user = users.find((u) => u.id === userId && u.role === "recruiter");
  if (!user) return undefined;
  user.verifiedRecruiter = verified;
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
  return user;
}

export async function setEmailLoginNotifications(userId: string, enabled: boolean): Promise<boolean> {
  if (hasDb()) {
    const rows = await query<{ id: string }>(
      `update users set email_login_notifications = $2 where id = $1 returning id`,
      [userId, enabled]
    );
    return rows.length > 0;
  }
  const users = await readUsersJson();
  const user = users.find((candidate) => candidate.id === userId);
  if (!user) return false;
  user.emailLoginNotifications = enabled;
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
  return true;
}

export async function updatePasswordAndIncrementSession(
  userId: string,
  passwordHash: string
): Promise<number | undefined> {
  if (hasDb()) {
    const rows = await query<{ session_version: number }>(
      `update users
       set password_hash = $2, session_version = session_version + 1
       where id = $1
       returning session_version`,
      [userId, passwordHash]
    );
    return rows[0]?.session_version;
  }
  const users = await readUsersJson();
  const user = users.find((candidate) => candidate.id === userId);
  if (!user) return undefined;
  user.passwordHash = passwordHash;
  user.sessionVersion = (user.sessionVersion ?? 0) + 1;
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
  return user.sessionVersion;
}

export async function incrementSessionVersion(userId: string): Promise<number | undefined> {
  if (hasDb()) {
    const rows = await query<{ session_version: number }>(
      `update users set session_version = session_version + 1 where id = $1 returning session_version`,
      [userId]
    );
    return rows[0]?.session_version;
  }
  const users = await readUsersJson();
  const user = users.find((candidate) => candidate.id === userId);
  if (!user) return undefined;
  user.sessionVersion = (user.sessionVersion ?? 0) + 1;
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
  return user.sessionVersion;
}

export async function recruitersWithStatus(): Promise<User[]> {
  if (hasDb()) {
    const rows = await query<UserRow>(`select * from users where role = 'recruiter'`);
    return rows.map(mapUser);
  }
  return (await readUsersJson()).filter((u) => u.role === "recruiter");
}

export function publicUser(u: User) {
  const { passwordHash, ...rest } = u;
  return rest;
}

export const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // seconds
