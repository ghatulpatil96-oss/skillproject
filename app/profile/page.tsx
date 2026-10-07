"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import { ROADMAPS, JOBS, skillById } from "@/lib/data";
import { useProgress, roadmapProgress } from "@/lib/progress";
import { useSession } from "@/components/SessionProvider";

const STAGE_STYLE: Record<string, string> = {
  applied: "bg-accent/10 text-accent",
  shortlisted: "bg-verify/10 text-verify",
  challenge: "bg-amber-100 text-amber-700",
  interview: "bg-amber-100 text-amber-700",
  offer: "bg-verify/10 text-verify",
  rejected: "bg-red-50 text-red-600",
};

type Application = {
  id: string;
  jobId: string;
  stage: string;
  matchPercent: number;
  createdAt: string;
};

type Attempt = {
  skillId: string;
  score: number;
  percentile: number;
  passed: boolean;
  createdAt: string;
};

export default function ProfilePage() {
  const progress = useProgress();
  const { user, loading } = useSession();
  const [apps, setApps] = useState<Application[] | null>(null);
  // best attempt per skill — SERVER data (attempts store), not localStorage
  const [best, setBest] = useState<Record<string, Attempt>>({});

  useEffect(() => {
    fetch("/api/applications", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { applications: [] }))
      .then((d: { applications: Application[] }) => setApps(d.applications))
      .catch(() => setApps([]));
  }, []);

  useEffect(() => {
    // scorecards come from the server attempt store; localStorage is only a cache
    fetch("/api/tests/grade", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { attempts: [] }))
      .then((d: { attempts: Attempt[] }) => {
        const map: Record<string, Attempt> = {};
        for (const a of d.attempts) {
          const cur = map[a.skillId];
          if (!cur || (a.passed && !cur.passed) || a.score > cur.score) map[a.skillId] = a;
        }
        setBest(map);
      })
      .catch(() => setBest({}));
  }, []);

  const verifiedSkills = Object.entries(best);
  const jobReady = ROADMAPS.some(
    (r) => roadmapProgress(r.stages, progress.state.completedTopics) === 100
  );

  // recruiter-visible "profile score"
  const profileScore = Math.min(
    100,
    20 +
      verifiedSkills.filter(([, a]) => a.passed).length * 20 +
      Math.round(
        (ROADMAPS.reduce(
          (acc, r) => acc + roadmapProgress(r.stages, progress.state.completedTopics),
          0
        ) /
          ROADMAPS.length) *
          0.4
      )
  );

  const displayName = user?.name ?? "Guest";
  const collegeLine = user
    ? [user.college, user.gradYear ? `Class of ${user.gradYear}` : null].filter(Boolean).join(" · ")
    : "Log in to see your saved progress and scorecards";

  return (
    <div className="min-h-screen">
      <TopBar title="My profile" />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {/* ── identity card ── */}
        <section className="card p-6">
          <div className="flex flex-wrap items-center gap-5">
            <span className="flex h-20 w-20 items-center justify-center rounded-xl bg-accent font-display text-3xl font-bold text-canvas">
              {displayName.slice(0, 1)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold">{displayName}</h1>
                {user?.role === "student" && (
                  <span className="chip bg-verify/10 text-verify">🟢 Open to work</span>
                )}
              </div>
              <p className="text-sm text-ink-2">
                {user?.role === "student" ? "Aspiring developer · " : ""}
                {collegeLine}
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-extrabold text-accent">{profileScore}</div>
              <div className="text-xs text-ink-2">Profile score</div>
            </div>
          </div>
          {jobReady && (
            <div className="mt-4 rounded-lg bg-verify/5 p-3 text-sm font-semibold text-verify">
              <strong>Job-Ready badge earned.</strong> You appear in recruiter &quot;verified only&quot; searches.
            </div>
          )}
          {!user && !loading && (
            <div className="mt-4 flex items-center justify-between rounded-lg bg-list p-3 text-sm">
              <span className="text-ink-2">You&apos;re browsing as a guest.</span>
              <Link href="/login?next=/profile" className="font-semibold text-accent hover:underline">
                Log in →
              </Link>
            </div>
          )}
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* ── verified scorecards (server attempts) ── */}
          <section className="card p-6">
            <h2 className="text-lg font-bold">Verified Skill Scorecards</h2>
            <p className="mt-1 text-xs text-ink-3">
              Recruiter-visible proof from server-graded attempts. Valid 6 months from issue date.
            </p>
            {verifiedSkills.length === 0 ? (
              <div className="mt-6 rounded-lg border border-dashed border-line p-8 text-center">
                <div className="font-display text-3xl font-bold text-ink-3">—</div>
                <p className="mt-2 text-sm text-ink-2">No verified skills yet.</p>
                <Link href="/tests" className="btn-primary mt-4 h-10 px-4">Take your first test</Link>
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                {verifiedSkills.map(([skillId, a]) => {
                  const skill = skillById(skillId);
                  const passed = a.passed || a.score >= 70;
                  return (
                    <div
                      key={skillId}
                      className={`flex items-center gap-4 rounded-xl border-2 p-4 ${
                        passed ? "border-verify/40 bg-verify/5" : "border-line"
                      }`}
                    >
                      <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-tile font-display text-lg font-bold text-accent">
                        {skill.name.slice(0, 1)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold">
                          {skill.name}{" "}
                          {passed && (
                            <span className="chip ml-1 bg-verify/10 text-verify">✓ Verified</span>
                          )}
                        </div>
                        <div className="text-xs text-ink-2">
                          {a.percentile}th percentile · issued{" "}
                          {new Date(a.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-3xl font-extrabold ${passed ? "text-verify" : "text-ink-3"}`}>
                          {a.score}
                        </div>
                        <div className="text-[10px] uppercase tracking-wide text-ink-3">/ 100</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ── roadmap progress ── */}
          <section className="card p-6">
            <h2 className="text-lg font-bold">Roadmap Progress</h2>
            <div className="mt-4 flex flex-col gap-4">
              {ROADMAPS.map((r) => {
                const pct = roadmapProgress(r.stages, progress.state.completedTopics);
                return (
                  <Link key={r.id} href={`/roadmaps/${r.id}`} className="group">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium group-hover:text-accent">
                        {r.title}
                      </span>
                      <span className="text-xs text-ink-2">{pct}%</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-tile">
                      <div
                        className={`h-full rounded-full transition-all ${pct === 100 ? "bg-verify" : "bg-accent"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>

        {/* ── applications ── */}
        <section className="card mt-6 p-6">
          <h2 className="text-lg font-bold">My Applications</h2>
          <p className="mt-1 text-xs text-ink-3">Live status — recruiters update these stages directly.</p>
          {(apps ?? []).length === 0 && progress.state.appliedJobs.length === 0 ? (
            <p className="mt-3 text-sm text-ink-2">
              No applications yet.{" "}
              <Link href="/jobs" className="font-semibold text-accent hover:underline">
                Browse jobs →
              </Link>
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {(apps ?? []).map((a) => {
                const job = JOBS.find((j) => j.id === a.jobId);
                if (!job) return null;
                return (
                  <li key={a.id} className="flex items-center gap-4 py-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-tile font-display text-sm font-bold text-accent">
                      {job.company.slice(0, 1)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold">{job.role}</div>
                      <div className="text-xs text-ink-2">
                        {job.company} · {a.matchPercent}% match ·{" "}
                        {new Date(a.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </div>
                    </div>
                    <span className={`chip capitalize ${STAGE_STYLE[a.stage] ?? "bg-tile text-ink-2"}`}>
                      {a.stage}
                    </span>
                  </li>
                );
              })}
              {/* local-only fallback (logged-out demo applies) */}
              {apps !== null && apps.length === 0
                ? progress.state.appliedJobs.map((jobId) => {
                    const job = JOBS.find((j) => j.id === jobId);
                    if (!job) return null;
                    return (
                      <li key={jobId} className="flex items-center gap-4 py-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-tile font-display text-sm font-bold text-accent">
                          {job.company.slice(0, 1)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold">{job.role}</div>
                          <div className="text-xs text-ink-2">{job.company}</div>
                        </div>
                        <span className="chip bg-accent/10 text-accent">Applied · pending review</span>
                      </li>
                    );
                  })
                : null}
            </ul>
          )}
        </section>

        {/* ── saved jobs ── */}
        {progress.state.savedJobs.length > 0 && (
          <section className="card mt-6 p-6">
            <h2 className="text-lg font-bold">Saved Jobs</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {progress.state.savedJobs.map((jobId) => {
                const job = JOBS.find((j) => j.id === jobId);
                if (!job) return null;
                return (
                  <Link
                    key={jobId}
                    href={`/jobs?selected=${jobId}`}
                    className="rounded-md border border-line bg-canvas px-3 py-1.5 text-sm font-medium shadow-card transition hover:border-accent hover:text-accent"
                  >
                    {job.role}
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <p className="mt-6 text-center text-xs text-ink-3">
          Roadmap checkmarks live in your browser (per account); test attempts and applications are
          stored server-side — recruiters see your verified scores and live application stages.
        </p>
      </main>
    </div>
  );
}
