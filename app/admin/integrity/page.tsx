"use client";

import { useState } from "react";
import TopBar from "@/components/TopBar";
import { INTEGRITY_FLAGS } from "@/lib/roles";

const SEV_STYLE = {
  low: "bg-tile text-ink-2",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-700",
} as const;

export default function AdminIntegrityPage() {
  // review state is session-local: real flags will live server-side (PRD F3.5)
  const [reviewed, setReviewed] = useState<string[]>([]);

  return (
    <div className="min-h-screen">
      <TopBar title="Integrity flags" />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-extrabold">Assessment Integrity Review</h1>
        <p className="mt-1 text-sm text-ink-2">
          Session flags raised by the test player (tab switches, implausible answer
          speed). Score trust is the product — review before scores are treated as
          verified (PRD F3.5, risk #1).
        </p>

        <div className="mt-6 flex flex-col gap-4">
          {INTEGRITY_FLAGS.map((f) => {
            const dismissed = reviewed.includes(f.id);
            return (
              <div key={f.id} className={`card p-5 ${dismissed ? "opacity-60" : ""}`}>
                <div className="flex flex-wrap items-start gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-tile text-2xl">
                    {f.severity === "high" ? "🚩" : f.severity === "medium" ? "⚠️" : "ℹ️"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-bold">{f.candidate}</h2>
                      <span className={`chip ${SEV_STYLE[f.severity]}`}>{f.severity}</span>
                      {dismissed && <span className="chip bg-verify/10 text-verify">Reviewed</span>}
                    </div>
                    <p className="mt-1 text-sm text-ink-2">{f.reason}</p>
                    <p className="mt-0.5 text-xs text-ink-3">
                      Skill test: {f.skill} · flagged {f.when}
                    </p>
                  </div>
                  <button
                    onClick={() => setReviewed((r) => [...r, f.id])}
                    disabled={dismissed}
                    className="btn-ghost h-10"
                  >
                    {dismissed ? "✓ Reviewed" : "Mark reviewed"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="card mt-6 bg-accent/5 p-5 text-sm text-ink-2">
          <strong className="text-ink">What happens on a real flag:</strong> scores from
          high-severity sessions are hidden from recruiter search until reviewed,
          repeat offenders get attempt blocks, and the candidate can appeal. Flags
          never auto-accuse — a human decides (PRD §13 mitigation).
        </div>
      </main>
    </div>
  );
}
