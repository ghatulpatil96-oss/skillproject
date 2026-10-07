"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/TopBar";

type Email = {
  id: string;
  to: string;
  subject: string;
  html: string;
  kind: string;
  createdAt: string;
  delivered: string;
};

export default function DevInboxPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selected, setSelected] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/emails", { cache: "no-store" });
    const data = (await res.json()) as { emails: Email[] };
    setEmails(data.emails);
    setLoading(false);
  }

  useEffect(() => {
    void load();
    const t = setInterval(load, 5000); // auto-refresh for new notifications
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen">
      <TopBar title="Email notifications" />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold">Notification Inbox</h1>
            <p className="mt-1 text-sm text-ink-2">
              Every email the platform sends — welcome messages, test results, application
              updates, recruiter verification.{" "}
              <span className="font-semibold text-accent">Add RESEND_API_KEY</span> to deliver
              these to real inboxes; without it they land here (free tier friendly).
            </p>
          </div>
          <button onClick={load} className="btn-ghost h-9">↻ Refresh</button>
        </div>

        {loading ? (
          <p className="mt-10 text-center text-sm text-ink-2">Loading…</p>
        ) : emails.length === 0 ? (
          <div className="card mt-8 p-12 text-center">
            <div className="text-4xl">📭</div>
            <p className="mt-3 text-sm text-ink-2">
              No notifications yet. Sign up a new account or complete a skill test to trigger one.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-[380px_1fr]">
            {/* list */}
            <div className="flex flex-col gap-2">
              {emails.map((e) => (
                <button
                  key={e.id}
                  onClick={() => setSelected(e)}
                  className={`card p-4 text-left transition ${
                    selected?.id === e.id ? "border-2 border-accent" : "hover:shadow-card-lift"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="chip bg-tile text-[10px] uppercase text-ink-2">{e.kind}</span>
                    <span className="text-[10px] text-ink-3">
                      {new Date(e.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className="mt-1 truncate text-sm font-bold">{e.subject}</div>
                  <div className="truncate text-xs text-ink-2">to {e.to}</div>
                </button>
              ))}
            </div>

            {/* preview */}
            <div className="card overflow-hidden">
              {selected ? (
                <>
                  <div className="border-b border-line p-4">
                    <h2 className="font-bold">{selected.subject}</h2>
                    <p className="text-xs text-ink-2">
                      To: {selected.to} · delivered via <span className="font-semibold text-accent">{selected.delivered}</span>
                    </p>
                  </div>
                  <iframe
                    title="email preview"
                    srcDoc={selected.html}
                    className="h-[560px] w-full bg-page"
                    sandbox=""
                  />
                </>
              ) : (
                <div className="flex h-full items-center justify-center p-12 text-sm text-ink-2">
                  ← Select an email to preview it
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
