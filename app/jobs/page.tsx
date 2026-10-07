"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TopBar from "@/components/TopBar";
import { JOBS, SKILLS, skillById, type Job } from "@/lib/data";
import { useProgress } from "@/lib/progress";

const LOCATIONS = ["All locations", "Remote, India", "Bengaluru, Karnataka", "Hyderabad, Telangana", "Pune, Maharashtra", "Gurugram, Haryana"];
const TYPES = ["All types", "Full-time", "Internship"];

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-ink-2">Loading jobs…</div>}>
      <JobsInner />
    </Suspense>
  );
}

function JobsInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [type, setType] = useState(TYPES[0]);
  const [minMatch, setMinMatch] = useState(0);
  const [applying, setApplying] = useState(false);
  const [applyMsg, setApplyMsg] = useState<string | null>(null);
  const progress = useProgress();
  // verified scores come from the SERVER attempt store (never localStorage)
  const [myScores, setMyScores] = useState<Record<string, { score: number }>>({});

  useEffect(() => {
    fetch("/api/tests/grade", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { attempts: [] }))
      .then((d: { attempts: { skillId: string; score: number; passed: boolean }[] }) => {
        const map: Record<string, { score: number }> = {};
        for (const a of d.attempts) {
          const cur = map[a.skillId];
          if (!cur || a.score > cur.score) map[a.skillId] = { score: a.score };
        }
        setMyScores(map);
      })
      .catch(() => setMyScores({}));
  }, []);

  // dev: seed jobs render instantly; production starts empty (real posts only)
  const IS_DEV = process.env.NODE_ENV !== "production";
  const [jobs, setJobs] = useState<Job[]>(IS_DEV ? JOBS : []);
  useEffect(() => {
    fetch("/api/jobs", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { jobs: [] }))
      .then((d: { jobs: Job[] }) => {
        // dedupe by id in case of fast refresh overlap
        const seen = new Set<string>();
        setJobs(d.jobs.filter((j) => !seen.has(j.id) && seen.add(j.id)));
      })
      .catch(() => setJobs(IS_DEV ? JOBS : []));
  }, []);

  const [selectedId, setSelectedId] = useState(params.get("selected") ?? "");
  const selected = jobs.find((j) => j.id === selectedId) ?? jobs[0];

  if (!selected) {
    return (
      <div className="min-h-screen">
        <TopBar title="Job feed" />
        <main className="mx-auto max-w-2xl px-4 py-24 text-center">
          <h1 className="text-2xl font-extrabold">No jobs posted yet</h1>
          <p className="mt-2 text-sm text-ink-2">
            Verified recruiters post roles here the moment they go live.
          </p>
        </main>
      </div>
    );
  }

  /** match % = verified-skill coverage of the job's requirements */
  const matchFor = useMemo(() => {
    const map = new Map<string, number>();
    for (const job of jobs) {
      let sum = 0;
      for (const req of job.skills) {
        const score = myScores[req.skillId]?.score ?? 0;
        sum += Math.min(100, Math.round((score / req.minScore) * 100));
      }
      map.set(job.id, Math.round(sum / job.skills.length));
    }
    return map;
  }, [myScores, jobs]);

  const filtered = jobs.filter((j) => {
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      j.role.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      j.skills.some((s) => skillById(s.skillId).name.toLowerCase().includes(q));
    const matchesLoc = location === LOCATIONS[0] || j.location === location;
    const matchesType = type === TYPES[0] || j.type === type;
    return matchesQuery && matchesLoc && matchesType && matchFor.get(j.id)! >= minMatch;
  });

  return (
    <div className="min-h-screen">
      <TopBar title="Job feed" />

      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 p-4 lg:flex-row">
        {/* ── Center: search + list (master) ── */}
        <section className="order-1 w-full lg:order-2 lg:flex-1">
          {/* header */}
          <div className="mb-4 text-center">
            <h1 className="text-2xl font-extrabold tracking-tight">SKILLBRIDGE JOBS</h1>
            <p className="mt-1 text-xs text-ink-3">
              {jobs.length} jobs posted · hired on verified skills, not resumes
            </p>
          </div>

          {/* search bar */}
          <div className="card flex items-center gap-2 p-2">
            <span className="pl-2 text-ink-3" aria-hidden>⌕</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Role, company or skill — try “React”"
              className="h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-ink-3"
            />
            <span className="hidden pr-2 text-xs font-medium text-ink-3 sm:block">Advanced</span>
          </div>

          {/* filter bar */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="flex h-9 w-12 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
              {filtered.length}
            </span>
            <select value={location} onChange={(e) => setLocation(e.target.value)} className="input h-9 w-auto flex-1 min-w-36 text-sm">
              {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
            </select>
            <select value={type} onChange={(e) => setType(e.target.value)} className="input h-9 w-auto flex-1 min-w-32 text-sm">
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            <select
              value={minMatch}
              onChange={(e) => setMinMatch(Number(e.target.value))}
              className="input h-9 w-auto flex-1 min-w-40 text-sm"
              title="Only show jobs where your match score is at least this"
            >
              <option value={0}>Any match %</option>
              <option value={50}>50%+ match</option>
              <option value={75}>75%+ match</option>
              <option value={100}>100% match</option>
            </select>
          </div>

          {/* job cards */}
          <div className="mt-4 flex flex-col gap-3">
            {filtered.length === 0 && (
              <div className="card p-10 text-center text-sm text-ink-2">
                <div className="font-display text-3xl font-bold text-ink-3">⌕</div>
                No jobs match your filters. Try clearing them.
              </div>
            )}
            {filtered.map((job) => {
              const isSel = job.id === selected.id;
              const match = matchFor.get(job.id)!;
              return (
                <button
                  key={job.id}
                  onClick={() => setSelectedId(job.id)}
                  className={`card w-full p-4 text-left transition ${
                    isSel ? "border-2 border-accent shadow-card-lift" : "hover:shadow-card-lift"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-tile font-display text-base font-bold text-accent">
                      {job.company.slice(0, 1)}
                    </span>
                    <div className="min-w-0 flex-[2]">
                      <div className="truncate font-bold">{job.role}</div>
                      <div className="text-xs text-ink-2">{job.company} · {job.type}</div>
                    </div>
                    <div className="hidden min-w-0 flex-1 sm:block">
                      <div className="truncate text-sm font-medium">{job.location}</div>
                      <div className="text-xs text-ink-3">{job.companyType === "Recruiter post" ? "Recruiter post" : "Location"}</div>
                    </div>
                    <div className="flex-1 text-right">
                      <div className="text-sm font-semibold">{job.salary}</div>
                      <div className="text-xs text-ink-3">
                        {match >= 100 ? "100% match ✅" : `${match}% match`}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Right: detail panel (detail) ── */}
        <aside className="order-2 w-full lg:order-3 lg:w-96">
          <div className="card sticky top-20 flex flex-col p-6">
            <div className="text-center">
              <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-xl bg-tile font-display text-3xl font-bold text-accent">
                {selected.company.slice(0, 1)}
              </span>
              <h2 className="mt-3 text-2xl font-extrabold">{selected.company}</h2>
              <p className="text-xs text-ink-2">{selected.companyType}</p>
            </div>

            <div className="mt-5 flex items-start justify-between border-t border-line pt-4">
              <div>
                <h3 className="font-bold">{selected.role}</h3>
                <p className="text-sm text-ink-2">{selected.location} · {selected.salary}</p>
                <p className="mt-0.5 text-xs text-ink-3">Posted {selected.postedDaysAgo}d ago</p>
              </div>
              <button
                onClick={() => progress.toggleSavedJob(selected.id)}
                aria-pressed={progress.state.savedJobs.includes(selected.id)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                  progress.state.savedJobs.includes(selected.id)
                    ? "border-accent bg-accent text-white"
                    : "border-line text-ink-2 hover:border-accent hover:text-accent"
                }`}
                title="Save job"
              >
                {progress.state.savedJobs.includes(selected.id) ? "★" : "☆"}
              </button>
            </div>

            {/* skill requirements vs your verified scores */}
            <div className="mt-4 border-t border-line pt-4">
              <h4 className="label !mb-2">Skill requirements</h4>
              <ul className="flex flex-col gap-2">
                {selected.skills.map((req) => {
                  const skill = skillById(req.skillId);
                  const score = myScores[req.skillId]?.score;
                  const ok = (score ?? 0) >= req.minScore;
                  return (
                    <li key={req.skillId} className="flex items-center justify-between text-sm">
                      <span>{skill.name}</span>
                      {score !== undefined ? (
                        <span className={`chip ${ok ? "bg-verify/10 text-verify" : "bg-red-50 text-red-600"}`}>
                          {score}/100 · need {req.minScore}
                        </span>
                      ) : (
                        <a href={`/tests/${req.skillId}`} className="chip bg-accent/10 text-accent hover:bg-accent/20">
                          Take test →
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="mt-4 border-t border-line pt-4">
              <h4 className="label !mb-2">Description</h4>
              <p className="text-sm leading-relaxed text-ink-2">{selected.description}</p>
              <h4 className="label !mb-2 mt-4">Perks</h4>
              <div className="flex flex-wrap gap-2">
                {selected.perks.map((p) => (
                  <span key={p} className="chip bg-tile text-ink-2">{p}</span>
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={async () => {
                  setApplying(true);
                  setApplyMsg(null);
                  const res = await fetch("/api/applications", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ jobId: selected.id }),
                  });
                  setApplying(false);
                  if (res.status === 401) {
                    // not logged in → login, come straight back here
                    router.push(`/login?next=${encodeURIComponent(`/jobs?selected=${selected.id}`)}`);
                    return;
                  }
                  const data = (await res.json().catch(() => ({}))) as { error?: string; application?: { id: string } };
                  if (!res.ok) {
                    setApplyMsg(data.error ?? "Could not apply. Try again.");
                    return;
                  }
                  progress.applyToJob(selected.id); // instant UI state
                  setApplyMsg("Application sent — the recruiter was notified by email.");
                }}
                disabled={progress.state.appliedJobs.includes(selected.id) || applying}
                className="btn-primary flex-1"
              >
                {progress.state.appliedJobs.includes(selected.id)
                  ? "Applied ✓"
                  : applying
                    ? "Sending…"
                    : "Apply now"}
              </button>
              <button className="btn-dark flex-1">Notify me</button>
            </div>
            {applyMsg && (
              <p className={`mt-3 rounded-lg px-3 py-2 text-xs ${applyMsg.includes("sent") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                {applyMsg}
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
