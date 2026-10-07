import Link from "next/link";
import TopBar from "@/components/TopBar";
import { SKILLS, TESTS } from "@/lib/data";

export default function TestsPage() {
  return (
    <div className="min-h-screen">
      <TopBar title="Skill Tests" />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-extrabold tracking-tight">Verified Skill Tests</h1>
        <p className="mt-2 max-w-2xl text-ink-2">
          Timed MCQ + coding tests. Score <strong>70+</strong> to earn a verified scorecard
          on your profile that recruiters can see and filter by. Scores are valid 6 months.
          Max 3 attempts per 30 days.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {SKILLS.map((s) => {
            const config = TESTS.find((t) => t.skillId === s.id);
            const live = !!config;
            const count = config ? config.mcqCount + config.codeCount : 0;
            return (
              <div key={s.id} className="card flex items-center gap-4 p-5">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-tile font-display text-xl font-bold text-accent">
                  {s.name.slice(0, 1)}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold">{s.name}</h2>
                  <p className="text-xs text-ink-2">
                    {live && config
                      ? `${count} questions · ${config.durationMin} min · MCQ + code`
                      : "Coming soon — question bank in progress"}
                  </p>
                </div>
                {live ? (
                  <Link href={`/tests/${s.id}`} className="btn-primary h-10 px-4">
                    Start
                  </Link>
                ) : (
                  <span className="chip bg-tile text-ink-3">Soon</span>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
