// ─────────────────────────────────────────────────────────────
// Post-login redirect validation (CWE-79 / open-redirect guard).
// safeNext(next): accept only same-origin app paths, return
// pathname+search, else fall back to the role's home page.
// ─────────────────────────────────────────────────────────────
import type { Role } from "@/lib/types";

const ROLE_HOME: Record<Role, string> = {
  student: "/roadmaps",
  recruiter: "/recruiter",
  admin: "/admin",
};

export function roleHome(role: Role): string {
  return ROLE_HOME[role] ?? "/";
}

export function safeNextForRole(
  next: string | null | undefined,
  role: Role,
  expectedOrigin?: string,
  fallback = roleHome(role)
): string {
  const target = safeNext(next, expectedOrigin);
  if (target === "/") return fallback;

  const pathname = target.split("?")[0];
  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");
  const isRecruiterPath =
    pathname === "/recruiter" || pathname.startsWith("/recruiter/");

  if (role === "student" && (isAdminPath || isRecruiterPath)) return fallback;
  if (role === "recruiter" && isAdminPath) return fallback;

  return target;
}

/**
 * Validate a `next` query parameter.
 * Accepts only paths that start with a single "/", never "//" or
 * "/\", and parse to the same origin under new URL(next, origin).
 * Returns pathname + search only (never the raw input).
 */
export function safeNext(
  next: string | null | undefined,
  expectedOrigin?: string
): string {
  if (!next || typeof next !== "string") return "/";
  if (!next.startsWith("/")) return "/";
  if (next.startsWith("//") || next.startsWith("/\\")) return "/";

  const origin = expectedOrigin ?? "http://localhost:3100";
  try {
    const u = new URL(next, origin);
    if (u.origin !== origin) return "/";
    return `${u.pathname}${u.search}`;
  } catch {
    return "/";
  }
}
