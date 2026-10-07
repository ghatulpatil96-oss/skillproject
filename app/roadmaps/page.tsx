import Link from "next/link";
import TopBar from "@/components/TopBar";
import { ROADMAPS } from "@/lib/data";
import { RoadmapProgressBadge } from "@/components/ProgressBadge";

export default function RoadmapsPage() {
  return (
    <div className="min-h-screen">
      <TopBar title="Roadmaps" />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-extrabold tracking-tight">Skill Roadmaps</h1>
        <p className="mt-2 max-w-2xl text-ink-2">
          Every roadmap is stage-gated: finish a stage, pass its checkpoint quiz, and the
          next unlocks. Reach 100% + pass the capstone to earn the{" "}
          <span className="font-semibold text-accent">Job-Ready badge</span> that recruiters
          can filter by.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {ROADMAPS.map((r) => (
            <Link
              key={r.id}
              href={`/roadmaps/${r.id}`}
              className="card group flex flex-col p-6 transition hover:shadow-card-lift"
            >
              <div className="flex items-start justify-between">
                <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-tile font-display text-xl font-bold text-accent">
                  {r.title.slice(0, 1)}
                </span>
                <RoadmapProgressBadge roadmapId={r.id} />
              </div>
              <h2 className="mt-4 text-xl font-bold group-hover:text-accent">{r.title}</h2>
              <p className="mt-1 flex-1 text-sm text-ink-2">{r.tagline}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {r.stages.map((s) => (
                  <span key={s.id} className="chip bg-tile text-xs text-ink-2">
                    {s.name} · {s.topics.length} topics
                  </span>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-4 text-xs text-ink-3">
                <span>⏱ ~{r.totalHours} hrs total</span>
                <span>{r.totalHours} hrs</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
