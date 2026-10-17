"use client";

import TopBar from "@/components/TopBar";
import Breadcrumbs from "@/components/Breadcrumbs";

const SEV_STYLE = {
  low: "bg-tile text-ink-2",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-700",
} as const;

type Flag = {
  id: string;
  skill: string;
  reason: string;
  severity: "low" | "medium" | "high";
  when: string;
};

// TODO(real): flags currently come from a server-side attempt reviewer that does
// not exist yet. This page renders whatever array the API returns; until then it
// shows the empty state below.
export default function AdminIntegrityPage() {
  const flags: Flag[] = [];

  return (
    <div className="min-h-screen">
      <TopBar title="Integrity flags" />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Breadcrumbs
          items={[
            { label: "Admin console", href: "/admin" },
            { label: "Integrity flags" },
          ]}
        />
        <h1 className="text-2xl font-extrabold">Assessment Integrity Review</h1>
        <p className="mt-1 text-sm text-ink-2">
          Flags raised during skill tests (tab switches, implausible answer speed).
          Scores flagged high stay hidden from recruiter search until a human
          reviews them (PRD F3.5).
        </p>

        {flags.length === 0 ? (
          <p className="card mt-6 bg-tile p-5 text-sm text-ink-2">
            No flags to review. An automated flag reviewer is not wired up yet.
          </p>
        ) : (
          <div className="mt-6 flex flex-col gap-4">
            {flags.map((f) => (
              <div key={f.id} className="card p-5">
                <div className="flex flex-wrap items-start gap-4">
                  <span className={`chip ${SEV_STYLE[f.severity]}`}>{f.severity}</span>
                  <p className="mt-1 text-sm text-ink-2">{f.reason}</p>
                  <p className="mt-0.5 text-xs text-ink-3">
                    Skill test: {f.skill} · flagged {f.when}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="card mt-6 bg-accent/5 p-5 text-sm text-ink-2">
          <strong className="text-ink">Policy:</strong> flags never auto-accuse. A
          human reviews every flag (PRD §13).
        </div>
      </main>
    </div>
  );
}
