"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "./SessionProvider";

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

export default function TopBar({ title }: { title?: string }) {
  const { user, loading } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const role = user?.role ?? "student";
  const nav = user ? (NAV[role] ?? NAV.student) : PUBLIC_NAV;

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    // update header instantly (SessionProvider listens for this)
    window.dispatchEvent(new CustomEvent("sb-session", { detail: null }));
    router.push("/login");
    router.refresh();
  }

  const linkCls = (href: string) => {
    const active = pathname === href || pathname.startsWith(href + "/");
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
            <Link key={n.href} href={n.href} className={linkCls(n.href)}>
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {title && <span className="hidden text-sm font-medium text-ink-3 lg:block">{title}</span>}

          <Link
            href="/dev-inbox"
            className="hidden rounded-lg px-2 py-1.5 text-xs font-semibold text-ink-2 transition hover:bg-tile hover:text-accent sm:block"
            title="Email notifications sent by the platform"
          >
            Inbox
          </Link>

          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-tile" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-lg border border-line py-1 pl-1 pr-3 transition hover:border-ink-3"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent font-display text-sm font-bold text-canvas">
                  {user.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden text-sm font-semibold sm:block">{user.name.split(" ")[0]}</span>
                <span className="chip bg-tile uppercase tracking-wide text-ink-2">{ROLE_LABEL[role]}</span>
              </button>

              {menuOpen && (
                <div className="card absolute right-0 top-12 z-40 w-60 p-2 shadow-card-lift">
                  <div className="px-3 py-2">
                    <p className="text-sm font-bold">{user.name}</p>
                    <p className="truncate text-xs text-ink-3">{user.email}</p>
                    {user.verifiedRecruiter === false && (
                      <span className="chip mt-2 bg-gold/15 text-amber-800">Verification pending</span>
                    )}
                  </div>
                  <div className="my-1 border-t border-line" />
                  <Link href="/profile" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-tile">
                    My profile
                  </Link>
                  <Link href="/dev-inbox" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-tile">
                    Email inbox
                  </Link>
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
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn-ghost h-9">Log in</Link>
              <Link href="/signup" className="btn-primary h-9 px-4">Sign up</Link>
            </div>
          )}

          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink-2 transition hover:bg-tile md:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {(user || mobileOpen) && (
        <nav className="flex gap-1 overflow-x-auto border-t border-line px-3 py-2 md:hidden">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setMobileOpen(false)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium ${
                pathname === n.href ? "bg-accent/10 text-accent" : "text-ink-2"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
