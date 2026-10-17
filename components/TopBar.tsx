"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSession } from "./SessionProvider";
import type { Role } from "@/lib/types";

const PUBLIC_NAV = [
  { href: "/jobs", label: "Jobs" },
  { href: "/roadmaps", label: "Roadmaps" },
  { href: "/trending", label: "Trending" },
  { href: "/tests", label: "Skill Tests" },
];

const NAV: Record<string, { href: string; label: string }[]> = {
  student: [
    { href: "/jobs", label: "Jobs" },
    { href: "/roadmaps", label: "Roadmaps" },
    { href: "/trending", label: "Trending" },
    { href: "/tests", label: "Skill Tests" },
    { href: "/profile", label: "My Profile" },
  ],
  recruiter: [
    { href: "/recruiter", label: "Dashboard" },
    { href: "/recruiter/candidates", label: "Find Candidates" },
    { href: "/recruiter/post", label: "Post a Job" },
  ],
  admin: [
    { href: "/admin", label: "Overview" },
    { href: "/admin/recruiters", label: "Recruiter Verification" },
    { href: "/admin/integrity", label: "Integrity Flags" },
  ],
};

const ROLE_LABEL: Record<string, string> = {
  student: "Student",
  recruiter: "Recruiter",
  admin: "Admin",
};

const ROLE_HOME: Record<Role, { href: string; label: string }> = {
  student: { href: "/profile", label: "My profile" },
  recruiter: { href: "/recruiter", label: "Recruiter dashboard" },
  admin: { href: "/admin", label: "Admin console" },
};

export default function TopBar({ title }: { title?: string }) {
  const { user, loading } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const role = user?.role ?? "student";
  const nav = user ? (NAV[role] ?? NAV.student) : PUBLIC_NAV;
  const showDevInbox = user?.role === "admin" && process.env.NODE_ENV !== "production";

  useEffect(() => {
    setMenuOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    function closeOnOutsideClick(event: PointerEvent) {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  async function logout() {
    setLoggingOut(true);
    setLogoutError(null);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) {
        setLogoutError("Could not log out. Please try again.");
        return;
      }

      window.dispatchEvent(new CustomEvent("sb-session", { detail: null }));
      router.push("/login");
      router.refresh();
    } catch {
      setLogoutError("Could not log out. Check your connection and try again.");
    } finally {
      setLoggingOut(false);
    }
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const linkCls = (href: string) => {
    const active = isActive(href);
    return `whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition ${
      active ? "bg-accent/10 font-semibold text-accent" : "text-ink-2 hover:bg-tile hover:text-ink"
    }`;
  };

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent font-display text-lg font-bold text-canvas">
            S
          </span>
          <span className="hidden font-display text-lg font-bold tracking-tight sm:block">
            SkillBridge<span className="text-accent">.</span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={linkCls(n.href)}
              aria-current={isActive(n.href) ? "page" : undefined}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {title && <span className="hidden text-sm font-medium text-ink-3 lg:block">{title}</span>}

          {showDevInbox && (
            <Link
              href="/dev-inbox"
              className="hidden rounded-lg px-2 py-1.5 text-xs font-semibold text-ink-2 transition hover:bg-tile hover:text-accent sm:block"
              title="Email notifications sent by the platform"
            >
              Dev inbox
            </Link>
          )}

          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-tile" />
          ) : user ? (
            <div className="relative" ref={accountMenuRef}>
              <button
                onClick={() => {
                  setLogoutError(null);
                  setMenuOpen((o) => !o);
                }}
                className="flex items-center gap-2 rounded-lg border border-line py-1 pl-1 pr-3 transition hover:border-ink-3"
                aria-label={`Account menu for ${user.name}`}
                aria-expanded={menuOpen}
                aria-controls="account-menu"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent font-display text-sm font-bold text-canvas">
                  {user.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden text-sm font-semibold sm:block">{user.name.split(" ")[0]}</span>
                <span className="chip bg-tile uppercase tracking-wide text-ink-2">{ROLE_LABEL[role]}</span>
              </button>

              {menuOpen && (
                <div
                  id="account-menu"
                  className="card absolute right-0 top-12 z-40 w-60 p-2 shadow-card-lift"
                >
                  <div className="px-3 py-2">
                    <p className="text-sm font-bold">{user.name}</p>
                    <p className="truncate text-xs text-ink-3">{user.email}</p>
                    {user.verifiedRecruiter === false && (
                      <span className="chip mt-2 bg-gold/15 text-amber-800">Verification pending</span>
                    )}
                  </div>
                  <div className="my-1 border-t border-line" />
                  <Link
                    href={ROLE_HOME[role].href}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm hover:bg-tile"
                  >
                    {ROLE_HOME[role].label}
                  </Link>
                  {showDevInbox && (
                    <Link
                      href="/dev-inbox"
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm hover:bg-tile"
                    >
                      Developer email inbox
                    </Link>
                  )}
                  {logoutError && (
                    <p role="alert" className="px-3 py-2 text-xs text-red-700">
                      {logoutError}
                    </p>
                  )}
                  <div className="my-1 border-t border-line" />
                  <button
                    onClick={logout}
                    disabled={loggingOut}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50"
                  >
                    {loggingOut ? "Logging out…" : "Log out"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link href="/login" className="btn-ghost h-9">Log in</Link>
              <Link href="/signup" className="btn-primary h-9 px-4">Sign up</Link>
            </div>
          )}

          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink-2 transition hover:bg-tile md:hidden"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="border-t border-line px-4 py-3 md:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setMobileOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                  isActive(n.href)
                    ? "bg-accent/10 font-semibold text-accent"
                    : "text-ink-2 hover:bg-tile hover:text-ink"
                }`}
                aria-current={isActive(n.href) ? "page" : undefined}
              >
                {n.label}
              </Link>
            ))}
            {!user && !loading && (
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-line pt-3">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="btn-ghost h-10"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary h-10 px-4"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
