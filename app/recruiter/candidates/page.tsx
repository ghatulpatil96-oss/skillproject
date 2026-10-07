"use client";

import { useState } from "react";
import TopBar from "@/components/TopBar";
import { SKILLS, skillById } from "@/lib/data";
import { CANDIDATES } from "@/lib/roles";

export default function CandidateSearchPage() {
  // seed candidates + session-local shortlist — real candidate search
  // will read server-side attempts and applications (PRD F7)
  const [shortlisted, setShortlisted] = useState<string[]>([]);
  const [skillFilter, setSkillFilter] = useState("all");
  const [minScore, setMinScore] = useState(60);
  const [jobReadyOnly, setJobReadyOnly] = useState(false);
  const [query, setQuery] = useState("");

  const results = CANDIDATES.filter((c) => {
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || c.name.toLowerCase().includes(q) || c.targetRole.toLowerCase().includes(q);
    const matchesSkill =
      skillFilter === "all" ||
      c.skills.some((s) => s.skillId === skillFilter && s.score >= minScore);
    const matchesReady = !jobReadyOnly || c.jobReady;
    return matchesQuery && matchesSkill && matchesReady;
  }).sort((a, b) => b.profileScore - a.profileScore);

  const isShortlisted = (id: string) => shortlisted.includes(id);

  return (
    <div className="min-h-screen">
      <TopBar title="Find candidates" />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-extrabold">Find Candidates</h1>
          <span className="chip bg-tile text-ink-3">demo data</span>
        </div>
        <p className="mt-1 text-sm text-ink-2">
          Search by <strong>verified skill scores</strong> — college names and tiers are
          hidden from recruiters by design. Shortlisted candidates move to your pipeline.
        </p>

        {/* filters */}
        <div className="card mt-6 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name or target role…"
            className="input"
          />
          <select value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)} className="input">
            <option value="all">Any verified skill</option>
            {SKILLS.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} className="input">
            {[40, 50, 60, 70, 80, 90].map((n) => (
              <option key={n} value={n}>Score ≥ {n}</option>
            ))}
          </select>
          <label className="flex cursor-pointer items-center gap-2 rounded-[10px] border border-line px-4 text-sm">
            <input
              type="checkbox"
              checked={jobReadyOnly}
              onChange={(e) => setJobReadyOnly(e.target.checked)}
              className="h-4 w-4 accent-[#0F9D58]"
            />
            Job-Ready only
          </label>
        </div>

        <p className="mt-4 text-xs text-ink-3">
          {results.length} of {CANDIDATES.length} candidates match
        </p>

        {/* results */}
        <div className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {results.map((c) => (
            <div key={c.id} className="card flex flex-col p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent font-display text-base font-bold text-canvas">
                  {c.name.slice(0, 1)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-bold">{c.name}</h3>
                    {c.jobReady && <span className="chip bg-verify/10 text-verify">Job-Ready</span>}
                  </div>
                  <p className="truncate text-xs text-ink-2">{c.targetRole} · {c.location}</p>
                  <p className="truncate text-xs text-ink-3">Class of {c.gradYear}</p>
                </div>
              </div>

              {/* verified skills */}
              <div className="mt-4 flex flex-col gap-2">
                {c.skills.map((s) => {
                  const skill = skillById(s.skillId);
                  const strong = s.score >= 70;
                  return (
                    <div key={s.skillId} className="flex items-center gap-2 text-xs">
                      <span className="w-28 truncate text-ink-2">{skill.name}</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-tile">
                        <div
                          className={`h-full rounded-full ${strong ? "bg-verify" : "bg-accent"}`}
                          style={{ width: `${s.score}%` }}
                        />
                      </div>
                      <span className={`w-14 text-right font-bold ${strong ? "text-verify" : "text-ink-2"}`}>
                        {s.score}/100
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs text-ink-3">
                <span>Roadmap: {c.roadmap.pct}% · Profile score {c.profileScore}</span>
                <span>{c.lastActiveDays === 0 ? "Active today" : `${c.lastActiveDays}d ago`}</span>
              </div>

              <button
                onClick={() =>
                  setShortlisted((s) => (s.includes(c.id) ? s.filter((x) => x !== c.id) : [...s, c.id]))
                }
                className={`mt-3 h-10 rounded-[10px] text-sm font-semibold transition ${
                  isShortlisted(c.id)
                    ? "bg-verify/10 text-verify hover:bg-verify/20"
                    : "bg-accent text-white hover:bg-accent-dark"
                }`}
              >
                {isShortlisted(c.id) ? "★ Shortlisted" : "☆ Shortlist"}
              </button>
            </div>
          ))}
        </div>

        {results.length === 0 && (
          <div className="card mt-3 p-10 text-center text-sm text-ink-2">
            No candidates match those filters. Try lowering the score threshold.
          </div>
        )}
      </main>
    </div>
  );
}
