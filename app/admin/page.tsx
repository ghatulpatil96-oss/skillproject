"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import { ADMIN, INTEGRITY_FLAGS } from "@/lib/roles";
import { ROADMAPS } from "@/lib/data";

export default function AdminOverview() {
  const [pending, setPending] = useState<number | null>(null);

  // real queue length from the user store (demo rows excluded)
  useEffect(() => {
    fetch("/api/admin/recruiters", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { recruiters: [] }))
      .then((d: { recruiters: { demo?: boolean; verifiedRecruiter?: boolean }[] }) =>
        setPending(d.recruiters.filter((r) => !r.demo && r.verifiedRecruiter !== true).length)
      )
      .catch(() => setPending(0));
  }, []);

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
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-2xl">🕐</span>
            <div className="flex-1">
              <div className="font-bold group-hover:text-accent">Recruiter verification</div>
              <div className="text-xs text-ink-2">Fake recruiters poison the marketplace — verify before they post</div>
            </div>
            <span className={`chip ${pending && pending > 0 ? "bg-amber-100 text-amber-700" : "bg-tile text-ink-2"}`}>
              {pending ?? "…"} pending
            </span>
          </Link>
          <Link href="/admin/integrity" className="card group flex items-center gap-4 p-5 transition hover:shadow-card-lift">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-2xl">🚩</span>
            <div className="flex-1">
              <div className="font-bold group-hover:text-accent">Assessment integrity</div>
              <div className="text-xs text-ink-2">Flagged test sessions that need review</div>
            </div>
            <span className="chip bg-tile text-ink-2">{INTEGRITY_FLAGS.length} demo flags</span>
          </Link>
        </div>

        {/* platform stats — computed from real stores where they exist */}
        <h2 className="mt-8 text-lg font-bold">Platform stats</h2>
        <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-3">
          {[
            { label: "Roadmaps live", value: String(ROADMAPS.length) },
            {
              label: "Topics with lessons",
              value: String(ROADMAPS.reduce((a, r) => a + r.stages.reduce((n, s) => n + s.topics.length, 0), 0)),
            },
            { label: "Demo integrity flags", value: String(INTEGRITY_FLAGS.length) },
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
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-tile font-display text-sm font-bold text-accent">{r.title.slice(0, 1)}</span>
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
          MVP demo console — in production every action here is audit-logged and role-gated (PRD F10.2).
        </p>
      </main>
    </div>
  );
}
