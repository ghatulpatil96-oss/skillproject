"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import { ROADMAPS } from "@/lib/data";
import { ADMIN } from "@/lib/roles";

export default function AdminOverview() {
  const [pending, setPending] = useState<number | null>(null);

  // real queue length from the user store
  useEffect(() => {
    fetch("/api/admin/recruiters", { cache: "no-store" })
      .then((r) =>
        r.ok
          ? r.json()
          : { recruiters: [] as { demo?: boolean; verifiedRecruiter?: boolean }[] }
      )
      .then((d: { recruiters: { demo?: boolean; verifiedRecruiter?: boolean }[] }) =>
        setPending(
          d.recruiters.filter((r) => !r.demo && r.verifiedRecruiter !== true).length
        )
      )
      .catch(() => setPending(0));
  }, []);

  const topicCount = ROADMAPS.reduce(
    (a, r) => a + r.stages.reduce((n, s) => n + s.topics.length, 0),
    0
  );

  return (
    <div className="min-h-screen">
      <TopBar title="Admin" />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-charcoal font-display text-xl font-bold text-canvas">
            {ADMIN.name.slice(0, 1)}
          </span>
          <div>
            <h1 className="text-2xl font-extrabold">Admin Console</h1>
            <p className="text-sm text-ink-2">Platform health, trust &amp; safety, and content ops</p>
          </div>
        </div>

        {/* action required */}
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Link href="/admin/recruiters" className="card group flex items-center gap-4 p-5 transition hover:shadow-card-lift">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-2xl" aria-hidden>
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 3" strokeLinecap="round" />
              </svg>
            </span>
            <div className="flex-1">
              <div className="font-bold group-hover:text-accent">Recruiter verification</div>
              <div className="text-xs text-ink-2">Unverified recruiters cannot publish jobs</div>
            </div>
            <span className={`chip ${pending && pending > 0 ? "bg-amber-100 text-amber-700" : "bg-tile text-ink-2"}`}>
              {pending ?? "…"} pending
            </span>
          </Link>
          <Link href="/admin/integrity" className="card group flex items-center gap-4 p-5 transition hover:shadow-card-lift">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-2xl" aria-hidden>
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 21V4m0 0h11l-1.5 4L16 12H5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div className="flex-1">
              <div className="font-bold group-hover:text-accent">Assessment integrity</div>
              <div className="text-xs text-ink-2">Flags from attempt records that need review</div>
            </div>
            <span className="chip bg-tile text-ink-2">flags</span>
          </Link>
        </div>

        {/* platform stats — real content counts only; no user counts */}
        <h2 className="mt-8 text-lg font-bold">Platform stats</h2>
        <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-3">
          {[
            { label: "Roadmaps live", value: String(ROADMAPS.length) },
            { label: "Topics with lessons", value: String(topicCount) },
          ].map((s) => (
            <div key={s.label} className="card p-4">
              <div className="text-2xl font-extrabold text-accent">{s.value}</div>
              <div className="mt-1 text-xs text-ink-2">{s.label}</div>
            </div>
          ))}
        </div>

        {/* content ops */}
        <h2 className="mt-8 text-lg font-bold">Content (roadmaps live)</h2>
        <div className="card mt-3 divide-y divide-line">
          {ROADMAPS.map((r) => (
            <div key={r.id} className="flex items-center gap-4 p-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-tile font-display text-sm font-bold text-accent">
                {r.title.slice(0, 1)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold">{r.title}</div>
                <div className="text-xs text-ink-2">
                  {r.stages.length} stages · {r.stages.reduce((a, s) => a + s.topics.length, 0)} topics
                </div>
              </div>
              <span className="chip bg-verify/10 text-verify">● Live</span>
              <Link href={`/roadmaps/${r.id}`} className="text-xs font-semibold text-accent hover:underline">
                View →
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-ink-3">
          In production every action on this page is audit-logged and role-gated (PRD F10.2).
        </p>
      </main>
    </div>
  );
}
