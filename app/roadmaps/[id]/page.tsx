"use client";

import { useMemo } from "react";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import { ROADMAPS, skillById, roadmapById } from "@/lib/data";
import { useProgress, roadmapProgress } from "@/lib/progress";

export default function RoadmapDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const roadmap = roadmapById(id);
  const { state, toggleTopic } = useProgress();

  if (!roadmap) {
    return (
      <div className="min-h-screen">
        <TopBar />
        <main className="p-10 text-center">
          <p className="text-ink-2">Roadmap not found.</p>
          <Link href="/roadmaps" className="mt-4 inline-block text-accent hover:underline">← All roadmaps</Link>
        </main>
      </div>
    );
  }

  const pct = roadmapProgress(roadmap.stages, state.completedTopics);
  // simple stage gating: stage N unlocks when 70% of stage N-1 is done
  const stageLocked = roadmap.stages.map((_, i) => {
    if (i === 0) return false;
    const prev = roadmap.stages[i - 1];
    const prevDone = prev.topics.filter((t) => state.completedTopics.includes(t.id)).length;
    return prevDone / prev.topics.length < 0.7;
  });

  return (
    <div className="min-h-screen">
      <TopBar title={roadmap.title} />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Link href="/roadmaps" className="text-sm text-ink-2 hover:text-accent">← All roadmaps</Link>

        {/* header */}
        <div className="mt-4 flex flex-wrap items-start gap-5">
          <span className="flex h-16 w-16 items-center justify-center rounded-lg bg-tile font-display text-2xl font-bold text-accent">
            {roadmap.title.slice(0, 1)}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-extrabold tracking-tight">{roadmap.title}</h1>
            <p className="mt-1 text-ink-2">{roadmap.tagline}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="chip bg-tile text-ink-2">⏱ ~{roadmap.totalHours} hrs</span>
              <span className="chip bg-tile text-ink-2">{roadmap.stages.reduce((a, s) => a + s.topics.length, 0)} topics</span>
              {roadmap.skills.map((sid) => {
                const s = skillById(sid);
                return (
                  <Link key={sid} href={`/tests/${sid}`} className="chip bg-accent/10 text-accent hover:bg-accent/20">
                    {s.name} · take test
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-extrabold text-accent">{pct}%</div>
            <div className="text-xs text-ink-2">
              {pct === 100 ? "Job-Ready badge earned" : "complete"}
            </div>
          </div>
        </div>

        {/* progress bar */}
        <div className="mt-6 h-3 overflow-hidden rounded-full bg-tile">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* stages */}
        <div className="mt-8 flex flex-col gap-6">
          {roadmap.stages.map((stage, i) => {
            const locked = stageLocked[i];
            const stageDone = stage.topics.filter((t) => state.completedTopics.includes(t.id)).length;
            return (
              <section key={stage.id} className={`card p-6 ${locked ? "opacity-60" : ""}`}>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">
                    <span className="mr-2 text-accent">Stage {i + 1}</span>
                    {stage.name}
                    {locked && <span className="ml-2 text-xs font-medium text-ink-3">🔒 complete 70% of Stage {i} to unlock</span>}
                  </h2>
                  <span className="chip bg-tile text-ink-2">
                    {stageDone}/{stage.topics.length} done
                  </span>
                </div>

                <ul className="mt-4 flex flex-col gap-2">
                  {stage.topics.map((topic) => {
                    const done = state.completedTopics.includes(topic.id);
                    return (
                      <li
                        key={topic.id}
                        className={`flex items-center gap-3 rounded-lg border border-line px-4 py-3 transition ${
                          done ? "bg-verify/5" : "bg-canvas"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={done}
                          disabled={locked}
                          onChange={() => toggleTopic(topic.id)}
                          className="h-4 w-4 accent-[#0F9D58]"
                          aria-label={topic.title}
                        />
                        <Link
                          href={`/roadmaps/${roadmap.id}/${topic.id}`}
                          className="min-w-0 flex-1"
                        >
                          <div className={`text-sm font-medium ${done ? "text-ink-2 line-through" : ""}`}>
                            {topic.title}
                          </div>
                          <div className="text-xs text-accent hover:underline">
                            Open lesson — notes, practice & curated resources →
                          </div>
                        </Link>
                        <span className="tnum text-xs text-ink-3">{topic.hours}h</span>
                      </li>
                    );
                  })}
                </ul>

                {!locked && stageDone === stage.topics.length && (
                  <div className="mt-4 rounded-lg bg-accent/5 p-4 text-sm">
                    <span className="font-semibold text-accent">🏁 Stage checkpoint!</span>{" "}
                    <span className="text-ink-2">
                      Prove this stage:{" "}
                      <Link href={`/tests/${roadmap.skills[Math.min(i, roadmap.skills.length - 1)]}`} className="font-semibold text-accent hover:underline">
                        take the checkpoint test →
                      </Link>
                    </span>
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* capstone */}
        <section className="card mt-8 border-2 border-accent/30 bg-accent/5 p-6">
          <h2 className="text-lg font-bold">Capstone project</h2>
          <p className="mt-2 text-sm text-ink-2">
            {roadmap.capstone}. Submit your repo + demo link — passing the capstone
            evaluation with 70%+ awards the verified <strong>Job-Ready badge</strong> on
            your profile.
          </p>
        </section>
      </main>
    </div>
  );
}
