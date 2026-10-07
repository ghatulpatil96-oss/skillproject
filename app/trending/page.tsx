"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import { TRENDING_SKILLS, trendingCategories, trendingResourceCount } from "@/lib/trending";

export default function TrendingPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const categories = ["All", ...trendingCategories()];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TRENDING_SKILLS.filter((s) => {
      const matchesQuery =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q) ||
        s.milestones.some((m) => m.title.toLowerCase().includes(q));
      const matchesCategory = category === "All" || s.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [query, category]);

  return (
    <div className="min-h-screen">
      <TopBar title="Trending skills" />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {/* header */}
        <div className="max-w-3xl">
          <span className="chip bg-accent/10 text-accent">Updated quarterly · last review Sep 2026</span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Trending Technical Skills</h1>
          <p className="mt-2 text-ink-2">
            What to learn right now — and the <strong>trusted, verified places</strong> to learn
            it. Every link below is from official docs, a recognized education platform, an
            accredited course, or a standards body. No blog spam, ever.
          </p>
        </div>

        {/* search + filter */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search skills or milestones — try “RAG” or “Kubernetes”"
            className="input sm:max-w-md"
            aria-label="Search trending skills"
          />
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
                className={`chip border transition ${
                  category === c
                    ? "border-accent bg-accent text-white"
                    : "border-line bg-canvas text-ink-2 hover:border-accent hover:text-accent"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* grid */}
        <p className="mt-6 text-xs text-ink-3" aria-live="polite">
          Showing {filtered.length} of {TRENDING_SKILLS.length} skill tracks
        </p>
        <div className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <Link
              key={s.skill_id}
              href={`/trending/${s.skill_id}`}
              className="card group flex flex-col p-5 transition hover:shadow-card-lift"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="chip bg-tile text-xs text-ink-2">{s.category}</span>
                <time
                  className="text-[10px] text-ink-3"
                  dateTime={s.last_reviewed}
                  title="Last content review"
                >
                  reviewed {s.last_reviewed}
                </time>
              </div>
              <h2 className="mt-3 font-bold leading-snug group-hover:text-accent">{s.title}</h2>
              <p className="mt-1 flex-1 text-sm text-ink-2">{s.summary}</p>
              <p className="mt-3 rounded-lg bg-accent/5 p-2.5 text-xs leading-relaxed text-ink-2">
                <span className="font-semibold text-accent">Why now:</span> {s.trend_note}
              </p>
              <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-xs text-ink-3">
                <span>
                  {s.milestones.length} milestones · {trendingResourceCount(s)} verified resources
                </span>
                <span className="font-semibold text-accent group-hover:underline">View roadmap →</span>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="card mt-3 p-10 text-center text-sm text-ink-2">
            No skills match “{query}”. Try a different term.
          </div>
        )}

        {/* trust policy note */}
        <div className="card mt-8 p-5 text-sm text-ink-2">
          <strong className="text-ink">Our trust policy:</strong> every resource is one of —
          official vendor documentation · recognized open-education platforms (MDN, freeCodeCamp,
          The Odin Project) · accredited courses · standards bodies (OWASP, NIST). Each link
          stores who verified it and when, is re-checked by an automated link checker, and is
          re-reviewed every 6 months.
        </div>
      </main>
    </div>
  );
}
