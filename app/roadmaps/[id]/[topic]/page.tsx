import Link from "next/link";
import { notFound } from "next/navigation";
import TopBar from "@/components/TopBar";
import { roadmapById } from "@/lib/data";
import { lessonByTopicId, type Lesson } from "@/lib/lessons";
import { loadLessonMdx } from "@/lib/lesson-mdx";
import TopicComplete from "@/components/mdx/TopicComplete";
import MDXRenderer from "@/components/mdx/MDXRenderer";

export default async function LessonPage({
  params,
}: {
  params: { id: string; topic: string };
}) {
  const { id, topic } = params;
  const roadmap = roadmapById(id);
  const lesson = lessonByTopicId(topic);

  if (!roadmap || !lesson) notFound();

  const mdx = await loadLessonMdx(topic);

  // locate topic for context + navigation
  let stageIndex = -1;
  let topicIndex = -1;
  let topicTitle = lesson.titleFallback ?? "";
  let topicHours = 0;
  roadmap.stages.forEach((s, si) => {
    const ti = s.topics.findIndex((t) => t.id === topic);
    if (ti >= 0) {
      stageIndex = si;
      topicIndex = ti;
      topicTitle = s.topics[ti].title;
      topicHours = s.topics[ti].hours;
    }
  });
  if (stageIndex < 0) notFound();

  const stage = roadmap.stages[stageIndex];
  const flat = roadmap.stages.flatMap((s) => s.topics);
  const flatIndex = flat.findIndex((t) => t.id === topic);
  const prev = flatIndex > 0 ? flat[flatIndex - 1] : null;
  const next = flatIndex < flat.length - 1 ? flat[flatIndex + 1] : null;
  const isLastOfStage = topicIndex === stage.topics.length - 1;
  const checkpointSkillId = roadmap.skills[Math.min(stageIndex, roadmap.skills.length - 1)];

  return (
    <div className="min-h-screen">
      <TopBar title={roadmap.title} />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {/* breadcrumb */}
        <nav className="flex flex-wrap items-center gap-1.5 text-xs text-ink-3">
          <Link href="/roadmaps" className="hover:text-accent">Roadmaps</Link>
          <span>/</span>
          <Link href={`/roadmaps/${roadmap.id}`} className="hover:text-accent">{roadmap.title}</Link>
          <span>/</span>
          <span className="font-semibold text-ink-2">Stage {stageIndex + 1}: {stage.name}</span>
        </nav>

        {/* header */}
        <header className="mt-5">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="chip bg-tile text-ink-2">Topic {flatIndex + 1} of {flat.length}</span>
            <span className="chip bg-tile text-ink-2">~{mdx?.meta.minutes ?? topicHours} min read</span>
            {mdx && <span className="chip bg-accent/10 text-accent">Rich lesson</span>}
          </div>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight">
            {mdx?.meta.title ?? topicTitle}
          </h1>
          {mdx?.meta.blurb && (
            <p className="mt-2 text-ink-2">{mdx.meta.blurb}</p>
          )}
        </header>

        {/* content: MDX when authored, structured data otherwise */}
        {mdx ? (
          <MDXRenderer source={mdx.source} />
        ) : (
          <LessonFallback lesson={lesson} />
        )}

        {/* completion + next */}
        <TopicComplete
          roadmapId={roadmap.id}
          topicId={topic}
          nextTopicId={next?.id ?? null}
          nextTopicTitle={next?.title ?? null}
          checkpointSkillId={checkpointSkillId}
          isLastOfStage={isLastOfStage}
        />

        {/* prev / next */}
        <nav className="mt-2 flex items-stretch justify-between gap-3 border-t border-line pt-6">
          {prev ? (
            <Link href={`/roadmaps/${roadmap.id}/${prev.id}`} className="card flex-1 p-4 transition hover:shadow-card-lift">
              <span className="text-xs text-ink-3">← Previous</span>
              <div className="text-sm font-semibold">{prev.title}</div>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
          {next ? (
            <Link href={`/roadmaps/${roadmap.id}/${next.id}`} className="card flex-1 p-4 text-right transition hover:shadow-card-lift">
              <span className="text-xs text-ink-3">Next →</span>
              <div className="text-sm font-semibold">{next.title}</div>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </nav>
      </main>
    </div>
  );
}

/** Structured-data lesson for topics without an authored MDX file yet. */
function LessonFallback({ lesson }: { lesson: Lesson }) {
  return (
    <article>
      <section className="mt-8">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-3">Overview</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-ink">{lesson.overview}</p>
      </section>
      <section className="mt-8">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-3">What you must be able to do</h2>
        <ul className="mt-3 grid gap-2">
          {lesson.keyPoints.map((k) => (
            <li key={k} className="flex items-start gap-2.5 rounded-lg border border-line bg-canvas px-4 py-2.5 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
              {k}
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-8">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-3">Practice — do these, don&apos;t just read</h2>
        <ol className="mt-3 grid gap-2">
          {lesson.practice.map((p, i) => (
            <li key={p} className="flex items-start gap-3 rounded-lg border border-line bg-canvas px-4 py-2.5 text-sm">
              <span className="tnum shrink-0 font-bold text-accent">{String(i + 1).padStart(2, "0")}</span>
              {p}
            </li>
          ))}
        </ol>
      </section>
      <section className="mt-8">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-3">Curated resources</h2>
        <p className="mt-2 text-xs text-ink-3">
          Official documentation and recognized education platforms only — same trust policy as our trending skills.
        </p>
        <div className="mt-3 grid gap-2">
          {lesson.resources.map((r) => (
            <a
              key={r.url}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 rounded-lg border border-line bg-canvas px-4 py-3 transition hover:border-accent hover:shadow-card-lift"
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold">{r.title}</div>
                <div className="text-xs text-ink-3">{r.source}{r.paid ? " · paid" : " · free"}</div>
              </div>
              <span className="shrink-0 text-xs font-semibold text-accent">Open ↗</span>
            </a>
          ))}
        </div>
      </section>
      {lesson.pitfalls && lesson.pitfalls.length > 0 && (
        <section className="mt-8">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-3">Common mistakes interviewers spot</h2>
          <ul className="mt-3 grid gap-2">
            {lesson.pitfalls.map((p) => (
              <li key={p} className="rounded-lg border border-line bg-red-50/50 px-4 py-2.5 text-sm text-ink">{p}</li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
