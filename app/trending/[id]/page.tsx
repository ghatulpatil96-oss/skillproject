import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import TopBar from "@/components/TopBar";
import {
  TRENDING_SKILLS,
  SOURCE_LABEL,
  SOURCE_DETAIL,
  trendingById,
  trendingResourceCount,
  type SourceType,
} from "@/lib/trending";

export function generateStaticParams() {
  return TRENDING_SKILLS.map((s) => ({ id: s.skill_id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const skill = trendingById(id);
  if (!skill) return { title: "Skill not found — SkillBridge" };
  return {
    title: `${skill.title} roadmap — trusted resources | SkillBridge`,
    description: `${skill.summary} ${skill.milestones.length}-step roadmap with ${trendingResourceCount(skill)} verified resources from official docs and recognized education platforms.`,
  };
}

const SOURCE_STYLE: Record<SourceType, string> = {
  official_docs: "bg-accent/10 text-accent",
  education_platform: "bg-verify/10 text-verify",
  accredited_course: "bg-purple-50 text-purple-700",
  standards_body: "bg-amber-100 text-amber-700",
};

export default async function TrendingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const skill = trendingById(id);
  if (!skill) notFound();

  return (
    <div className="min-h-screen">
      <TopBar title={skill.title} />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Link href="/trending" className="text-sm text-ink-2 hover:text-accent">
          ← All trending skills
        </Link>

        {/* header */}
        <header className="mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip bg-tile text-xs text-ink-2">{skill.category}</span>
            <time
              className="chip bg-verify/10 text-xs text-verify"
              dateTime={skill.last_reviewed}
            >
              ✓ Content reviewed {skill.last_reviewed}
            </time>
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight">{skill.title}</h1>
          <p className="mt-2 text-ink-2">{skill.summary}</p>
          <p className="mt-3 rounded-xl bg-accent/5 p-4 text-sm leading-relaxed text-ink-2">
            <span className="font-semibold text-accent">Why it&apos;s trending now:</span>{" "}
            {skill.trend_note}
          </p>
        </header>

        {/* milestones */}
        <ol className="mt-8 flex flex-col gap-5">
          {skill.milestones.map((m) => (
            <li key={m.order} className="card p-6">
              <div className="flex items-start gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-sm font-bold text-white">
                  {m.order}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold leading-snug">{m.title}</h2>

                  <ul className="mt-3 flex flex-col gap-2.5">
                    {m.resources.map((r) => (
                      <li
                        key={r.url}
                        className="rounded-lg border border-line p-3 transition hover:border-accent/50"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-semibold text-accent hover:underline"
                          >
                            {r.title} ↗
                          </a>
                          <span
                            className={`chip text-[10px] ${SOURCE_STYLE[r.source_type]}`}
                            title={`${SOURCE_DETAIL[r.source_type]} Verified by ${r.verified_by}.`}
                          >
                            ✓ {SOURCE_LABEL[r.source_type]}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-ink-3">
                          <span title={`Verified by ${r.verified_by}`}>
                            Verified by {r.verified_by}
                          </span>{" "}
                          ·{" "}
                          <time dateTime={r.last_checked_date} title="Link last checked working">
                            link checked {r.last_checked_date}
                          </time>
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          ))}
        </ol>

        {/* footer trust note */}
        <footer className="card mt-8 p-5 text-sm text-ink-2">
          <strong className="text-ink">How this page stays trustworthy:</strong> every link is
          from an approved source type (hover the badges), checked automatically by our
          link-checker job (<code className="rounded bg-tile px-1.5 py-0.5 font-mono text-xs">npm run check:links</code>),
          and re-verified by a human every 6 months. Found a dead link or a better resource?
          It goes through the same verification policy before it&apos;s listed.
        </footer>
      </main>
    </div>
  );
}
