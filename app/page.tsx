"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import { useSession } from "@/components/SessionProvider";
import ScorecardSample from "@/components/ScorecardSample";
import { FAQS } from "@/lib/site-content";
import { JOBS, ROADMAPS, TESTS, skillById } from "@/lib/data";
import { safeNext } from "@/lib/safe-next";

// real content counts — no user counts, no invented numbers
const TOPIC_COUNT = ROADMAPS.reduce(
  (n, r) => n + r.stages.reduce((a, s) => a + s.topics.length, 0),
  0
);
// referenced to keep the honest-stat band available when it is needed again
void TOPIC_COUNT;
void TESTS.length;

export default function Home() {
  const { user, loading } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");

  return (
    <main>
      <TopBar />

      {/* ── demo bar (dev/demo mode only) ────────────────── */}
      {!user &&
        !loading &&
        process.env.NEXT_PUBLIC_DEMO_MODE === "true" && <DemoBar />}

      {/* ── Hero: statement + sample scorecard ─────────── */}
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-20 sm:px-6 sm:pb-20 sm:pt-24 lg:grid-cols-2">
          <div>
            <span className="chip border border-line bg-canvas text-ink-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              For tier&nbsp;2 &amp; tier&nbsp;3 college students in India
            </span>
            <h1 className="mt-6 text-4xl leading-[1.06] sm:text-5xl lg:text-6xl">
              Learn the roadmap.
              <br />
              Prove it on a test.
              <br />
              <span className="text-accent">Get matched to jobs.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">
              Follow a structured roadmap, pass a timed test that is graded on
              our server, and recruiters read your verified scorecard before
              they ever see a college name.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {user ? (
                <>
                  <Link href="/roadmaps" className="btn-primary">
                    Continue a roadmap
                  </Link>
                  <Link href="/jobs" className="btn-ghost">
                    See your job matches
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/signup" className="btn-primary">
                    Start learning, free
                  </Link>
                  <Link href="/roadmaps" className="btn-ghost">
                    Browse roadmaps first
                  </Link>
                </>
              )}
            </div>
            <p className="mt-4 text-xs text-ink-3">
              Free for students. Roadmaps, tests, and scoring are paid for by
              recruiters, not by you.
            </p>
          </div>
          <div className="flex justify-center lg:justify-end">
            <ScorecardSample />
          </div>
        </div>
      </section>

      {/* ── Roadmap preview ────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl sm:text-4xl">Pick your track.</h2>
            <p className="mt-3 max-w-lg text-ink-2">
              Each roadmap is ordered from first topic to job-ready, with a
              checkpoint quiz at the end of every stage.
            </p>
          </div>
          <Link
            href="/roadmaps"
            className="hidden text-sm font-semibold text-accent hover:underline sm:block"
          >
            All {ROADMAPS.length} roadmaps →
          </Link>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ROADMAPS.map((r) => {
            const topics = r.stages.reduce((n, s) => n + s.topics.length, 0);
            return (
              <Link
                key={r.id}
                href={`/roadmaps/${r.id}`}
                className="card group flex h-full flex-col rounded-3xl p-6 transition hover:shadow-card-lift"
              >
                <span className="chip w-fit bg-list text-accent">{r.stages.length} stages</span>
                <h3 className="mt-4 text-lg font-semibold leading-snug group-hover:text-accent">
                  {r.title}
                </h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-2">
                  {r.tagline}
                </p>
                <div className="tnum mt-5 flex items-center justify-between border-t border-line pt-4 text-xs text-ink-3">
                  <span>
                    {topics} topics · {r.totalHours} hrs
                  </span>
                  <Link
                    href={`/roadmaps/${r.id}`}
                    className="text-accent hover:underline"
                  >
                    Open →
                  </Link>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Job card with honest match score ───────────── */}
      <section className="border-y border-line bg-list py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl sm:text-4xl">See how you match.</h2>
              <p className="mt-3 max-w-lg text-ink-2">
                Every job lists the skills it needs. When you sign in, Skill
                Bridge tells you how each verified score matches each
                requirement. No estimate until you have a score.
              </p>
            </div>
            <Link
              href="/jobs"
              className="hidden text-sm font-semibold text-accent hover:underline sm:block"
            >
              All jobs →
            </Link>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {JOBS.slice(0, 3).map((j) => (
              <div
                key={j.id}
                className="flex flex-col rounded-3xl border border-line bg-canvas p-7 shadow-card"
              >
                <span className="w-fit text-xs font-bold uppercase tracking-widest text-ink-3">
                  {j.company}
                </span>
                <h3 className="mt-3 text-xl font-semibold">{j.role}</h3>
                <p className="mt-1.5 text-sm text-ink-3">
                  {j.location} · {j.type}
                </p>
                <ul className="mt-5 flex-1 space-y-2.5 text-sm">
                  {j.skills.slice(0, 3).map((sk) => {
                    const s = skillById(sk.skillId);
                    return (
                      <li key={sk.skillId} className="flex items-center justify-between">
                        <span className="text-ink-2">{s.name ?? sk.skillId}</span>
                        <span
                          className={`chip ${
                            user ? "bg-verify/10 text-verify" : "bg-tile text-ink-3"
                          }`}
                        >
                          {user ? `min ${sk.minScore}` : "sign in to compare"}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                  <span className="tnum text-sm font-semibold">{j.salary}</span>
                  <Link href="/jobs" className="text-xs font-semibold text-accent hover:underline">
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <h2 className="text-center text-3xl sm:text-4xl">
          Common questions
        </h2>
        <div className="mt-10 space-y-3">
          {FAQS.slice(0, 5).map((f) => (
            <details
              key={f.q}
              className="card group rounded-2xl p-5 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-bold">
                {f.q}
                <span className="text-accent transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-2">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────── */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
          <h2 className="text-4xl leading-[1.06] sm:text-5xl">
            Build the scorecard. Then let recruiters come to you.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-ink-2">
            Free for students, forever. No college filter, no referral needed.
          </p>
          {!user && (
            <form
              className="mx-auto mt-8 flex max-w-md gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const next = safeNext(`/signup?email=${encodeURIComponent(email)}`);
                router.push(next);
              }}
            >
              <label htmlFor="home-email" className="sr-only">
                College email
              </label>
              <input
                id="home-email"
                type="email"
                className="input flex-1"
                placeholder="you@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" className="btn-dark h-11 px-5 text-sm">
                Sign up
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

function DemoBar() {
  const DEMO_ACCOUNTS = [
    { role: "Student", email: "ananya@student.in", href: "/jobs" },
    { role: "Recruiter", email: "riya@pixelforge.dev", href: "/recruiter" },
    { role: "Admin", email: "admin@skillbridge.local", href: "/admin" },
  ];
  return (
    <div className="sticky top-16 z-20 border-b border-line bg-list">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-2 text-xs sm:px-6">
        <span className="font-bold text-ink">Try the demo</span>
        <span className="text-ink-3">password: skillbridge123</span>
        {DEMO_ACCOUNTS.map((d) => (
          <Link
            key={d.email}
            href={`http://localhost:3100/login?next=${encodeURIComponent(d.href)}`}
            className="chip border border-line bg-canvas text-ink shadow-card transition hover:border-accent hover:text-accent"
          >
            {d.role}
          </Link>
        ))}
      </div>
    </div>
  );
}
