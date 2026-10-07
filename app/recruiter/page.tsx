"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import { JOBS, skillById } from "@/lib/data";
import { RECRUITER } from "@/lib/roles";

const STAGE_LABEL: Record<string, string> = {
  applied: "Applied",
  shortlisted: "Shortlisted",
  challenge: "Challenge",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
};

const NEXT_STAGES = ["shortlisted", "challenge", "interview", "offer", "rejected"] as const;

type Application = {
  id: string;
  jobId: string;
  studentName: string;
  studentEmail: string;
  college?: string;
  scores: Record<string, number>;
  matchPercent: number;
  stage: string;
  createdAt: string;
};

type MyPost = {
  id: string;
  role: string;
  location: string;
  salary: string;
  type: string;
  skills: { skillId: string; minScore: number }[];
  createdAt: string;
};

export default function RecruiterDashboard() {
  const [apps, setApps] = useState<Application[] | null>(null);
  const [myPosts, setMyPosts] = useState<MyPost[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const seedJobs = JOBS.filter((j) => j.company === RECRUITER.company);
  const jobById = (id: string) => seedJobs.find((j) => j.id === id);

  const loadPosts = useCallback(async () => {
    const res = await fetch("/api/jobs?mine=1", { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as { mine: MyPost[] };
      setMyPosts(data.mine);
    }
  }, []);

  const load = useCallback(async () => {
    const res = await fetch("/api/applications", { cache: "no-store" });
    if (!res.ok) {
      setApps([]);
      return;
    }
    const data = (await res.json()) as { applications: Application[] };
    setApps(data.applications);
  }, []);

  useEffect(() => {
    void load();
    void loadPosts();
  }, [load, loadPosts]);

  async function moveStage(id: string, stage: string) {
    setBusyId(id);
    await fetch("/api/applications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, stage }),
    });
    setBusyId(null);
    void load(); // re-fetch so the board reflects the DB
  }

  const activeApps = apps ?? [];
  const shortlistedCount = activeApps.filter((a) => a.stage === "shortlisted").length;

  async function removePost(id: string) {
    setBusyId(id);
    await fetch(`/api/jobs?id=${id}`, { method: "DELETE" });
    setBusyId(null);
    void loadPosts();
  }

  return (
    <div className="min-h-screen">
      <TopBar title="Recruiter" />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {/* header */}
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-accent font-display text-2xl font-bold text-canvas">
            {RECRUITER.name.slice(0, 1)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold">{RECRUITER.name}</h1>
              {RECRUITER.verified && <span className="chip bg-verify/10 text-verify">✓ Verified recruiter</span>}
              <span className="chip bg-accent/10 text-accent">{RECRUITER.plan} plan</span>
            </div>
            <p className="text-sm text-ink-2">
              {RECRUITER.role} at {RECRUITER.company}
            </p>
          </div>
          <Link href="/recruiter/post" className="btn-primary">+ Post a job</Link>
        </div>

        {/* stats */}
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Active jobs", value: seedJobs.length + myPosts.length },
            { label: "Applications", value: activeApps.length },
            { label: "Shortlisted", value: shortlistedCount },
            { label: "Offers out", value: activeApps.filter((a) => a.stage === "offer").length },
          ].map((s) => (
            <div key={s.label} className="card p-5">
              <div className="tnum mt-2 text-3xl font-bold text-accent">{s.value}</div>
              <div className="text-xs font-medium text-ink-2">{s.label}</div>
            </div>
          ))}
        </div>

        {/* pipeline */}
        <section className="card mt-8 p-6">
          <h2 className="text-lg font-bold">Applicant pipeline</h2>
          <p className="mt-1 text-xs text-ink-3">
            Real applications from students — ranked by verified skill match at apply time. Moving a stage emails the student automatically.
          </p>
          {apps === null ? (
            <div className="mt-4 rounded-lg border border-dashed border-line p-8 text-center text-sm text-ink-2">
              Loading applications…
            </div>
          ) : activeApps.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-line p-8 text-center text-sm text-ink-2">
              No applications yet. Post a job — students with matching verified scores will appear here the moment they apply.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {activeApps
                .slice()
                .sort((a, b) => b.matchPercent - a.matchPercent)
                .map((a) => {
                  const job = jobById(a.jobId);
                  return (
                    <div key={a.id} className="rounded-xl border border-line p-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-sm font-bold text-accent">
                          {a.studentName.slice(0, 1)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-bold">{a.studentName}</div>
                          <div className="truncate text-xs text-ink-2">
                            applied to <strong>{job?.role ?? a.jobId}</strong>
                            {job ? ` · ${job.company}` : ""}
                          </div>
                        </div>
                        <span
                          className={`chip ${
                            a.matchPercent >= 100
                              ? "bg-verify/10 text-verify"
                              : a.matchPercent >= 60
                                ? "bg-accent/10 text-accent"
                                : "bg-tile text-ink-2"
                          }`}
                        >
                          {a.matchPercent}% match
                        </span>
                        <span className="chip bg-tile text-ink-2">{STAGE_LABEL[a.stage] ?? a.stage}</span>
                      </div>

                      {/* verified score snapshot vs requirements */}
                      {job && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {job.skills.map((req) => {
                            const got = a.scores[req.skillId] ?? 0;
                            const ok = got >= req.minScore;
                            return (
                              <span
                                key={req.skillId}
                                className={`chip text-[10px] ${ok ? "bg-verify/10 text-verify" : "bg-red-50 text-red-600"}`}
                              >
                                {skillById(req.skillId).name}: {got}/{req.minScore}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
                        <span className="text-xs text-ink-3">Move to:</span>
                        {NEXT_STAGES.filter((s) => s !== a.stage).map((s) => (
                          <button
                            key={s}
                            onClick={() => moveStage(a.id, s)}
                            disabled={busyId === a.id}
                            className={`chip border border-line text-xs transition hover:border-accent hover:text-accent ${
                              s === "rejected" ? "text-red-600 hover:border-red-400" : "text-ink-2"
                            }`}
                          >
                            {STAGE_LABEL[s]}
                          </button>
                        ))}
                        <span className="ml-auto text-[11px] text-ink-3">
                          {new Date(a.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </section>

        {/* my jobs */}
        <section className="card mt-6 p-6">
          <h2 className="text-lg font-bold">My job posts</h2>
          <p className="mt-1 text-xs text-ink-3">Everything here is live in the student feed.</p>
          <div className="mt-4 flex flex-col gap-3">
            {seedJobs.map((job) => {
              const count = activeApps.filter((a) => a.jobId === job.id).length;
              return (
                <Link key={job.id} href={`/jobs?selected=${job.id}`} className="flex items-center gap-4 rounded-xl border border-line p-4 transition hover:border-accent">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-tile font-display text-sm font-bold text-accent">{job.company.slice(0, 1)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold">{job.role}</div>
                    <div className="text-xs text-ink-2">{job.location} · {job.salary} · posted {job.postedDaysAgo}d ago</div>
                  </div>
                  <span className="chip bg-accent/10 text-accent">{count} applicant{count === 1 ? "" : "s"}</span>
                </Link>
              );
            })}
            {myPosts.map((job) => {
              const count = activeApps.filter((a) => a.jobId === job.id).length;
              return (
                <div key={job.id} className="flex items-center gap-4 rounded-xl border border-accent/30 bg-accent/[0.03] p-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 font-display text-sm font-bold text-accent">P</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold">{job.role}</div>
                    <div className="text-xs text-ink-2">
                      {job.location} · {job.salary || "salary not disclosed"} · requires{" "}
                      {job.skills.map((s) => skillById(s.skillId).name).join(", ")}
                    </div>
                  </div>
                  <span className="chip bg-accent/10 text-accent">{count} applicant{count === 1 ? "" : "s"}</span>
                  <button
                    onClick={() => removePost(job.id)}
                    disabled={busyId === job.id}
                    className="text-xs font-semibold text-red-500 hover:underline disabled:opacity-50"
                    title="Remove this post from the feed"
                  >
                    {busyId === job.id ? "Removing…" : "Delete"}
                  </button>
                </div>
              );
            })}
            {seedJobs.length + myPosts.length === 0 && (
              <div className="rounded-lg border border-dashed border-line p-6 text-center text-sm text-ink-2">
                No jobs yet — post your first one.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
