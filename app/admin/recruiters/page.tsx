"use client";

import { useCallback, useEffect, useState } from "react";
import TopBar from "@/components/TopBar";

type QueueRow = {
  id: string;
  name: string;
  email: string;
  company?: string;
  verifiedRecruiter?: boolean;
  demo?: boolean;
};

export default function AdminRecruitersPage() {
  const [rows, setRows] = useState<QueueRow[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/recruiters", { cache: "no-store" });
      if (!res.ok) throw new Error("Could not load the verification queue.");
      const data = (await res.json()) as { recruiters: QueueRow[] };
      setRows(data.recruiters);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load the queue.");
      setRows([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function act(userId: string, action: "approve" | "reject") {
    setBusyId(userId);
    setError(null);
    try {
      const res = await fetch("/api/admin/recruiters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Action failed.");
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="min-h-screen">
      <TopBar title="Recruiter verification" />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-extrabold">Recruiter Verification Queue</h1>
        <p className="mt-1 text-sm text-ink-2">
          New recruiter sign-ups are reviewed before they can post jobs or message
          students — this protects the marketplace from fake listings (PRD F6.1).
          Approve/reject updates the account server-side and emails the recruiter.
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <div className="mt-6 flex flex-col gap-4">
          {rows === null ? (
            <div className="card p-8 text-center text-sm text-ink-2">Loading queue…</div>
          ) : rows.length === 0 ? (
            <div className="card p-8 text-center text-sm text-ink-2">
              No recruiters awaiting review. New recruiter sign-ups appear here.
            </div>
          ) : (
            rows.map((r) => {
              const approved = r.verifiedRecruiter === true;
              const rejected = r.verifiedRecruiter === false && !r.demo;
              return (
                <div key={r.id} className="card p-5">
                  <div className="flex flex-wrap items-start gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-tile font-display text-base font-bold text-accent">
                      {(r.company ?? r.name).slice(0, 1)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-bold">{r.company ?? r.name}</h2>
                        {r.demo && <span className="chip bg-tile text-ink-3">demo row</span>}
                        {approved && <span className="chip bg-verify/10 text-verify">✓ Approved</span>}
                        {rejected && <span className="chip bg-red-100 text-red-700">✕ Rejected</span>}
                      </div>
                      <p className="mt-0.5 text-sm text-ink-2">
                        {r.name} · <span className="font-mono text-xs">{r.email}</span>
                      </p>
                      {r.demo && (
                        <p className="mt-1 text-xs text-ink-3">
                          Sample data — sign up a real recruiter account to exercise the flow end-to-end.
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => act(r.id, "approve")}
                        disabled={approved || !!r.demo || busyId === r.id}
                        className="btn-primary h-10 px-4 disabled:opacity-40"
                      >
                        {busyId === r.id ? "Working…" : approved ? "✓ Approved" : "Approve"}
                      </button>
                      <button
                        onClick={() => act(r.id, "reject")}
                        disabled={rejected || approved || !!r.demo || busyId === r.id}
                        className="btn-dark h-10 px-4 disabled:opacity-40"
                      >
                        {rejected ? "✕ Rejected" : "Reject"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
