"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ROADMAPS, TESTS, JOBS, skillById } from "@/lib/data";
import { TRENDING_SKILLS, trendingResourceCount } from "@/lib/trending";
import { TESTIMONIALS, FAQS } from "@/lib/site-content";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import Tilt from "@/components/Tilt";
import { useSession } from "@/components/SessionProvider";

// three.js is heavy — load the hero scene client-side only
const HeroScene = dynamic(() => import("@/components/three/HeroScene"), { ssr: false });

// honest numbers, computed from real content — never marketing fiction
const TOPIC_COUNT = ROADMAPS.reduce(
  (n, r) => n + r.stages.reduce((a, s) => a + s.topics.length, 0),
  0
);
const STATS = [
  { value: String(ROADMAPS.length), label: "Job-ready roadmaps" },
  { value: String(TOPIC_COUNT), label: "Lessons with quizzes" },
  { value: String(TESTS.length), label: "Verified skill tests" },
  { value: "₹0", label: "Free for students, forever" },
];

// seed/demo content is shown in development and hidden in production
const IS_DEV = process.env.NODE_ENV !== "production";
const TEST_COUNT = TESTS.length as number;

const DEMO_ACCOUNTS = [
  { role: "Student", email: "ananya@student.in", href: "/jobs" },
  { role: "Recruiter", email: "riya@pixelforge.dev", href: "/recruiter" },
  { role: "Admin", email: "admin@skillbridge.local", href: "/admin" },
];

const COMPANIES = [...new Set(JOBS.map((j) => j.company))];

const COMPARISON_ROWS = [
  {
    step: "01",
    label: "Get discovered",
    own: "Cold applications, mostly ignored.",
    campus: "Only companies that visit your campus.",
    bridge: "Recruiters search verified scorecards directly.",
  },
  {
    step: "02",
    label: "Prove skills",
    own: "Self-reported claims on a resume.",
    campus: "Marks from theory exams.",
    bridge: "Timed, server-graded tests. The score lives on your profile.",
  },
  {
    step: "03",
    label: "Stand out",
    own: "The college name decides.",
    campus: "Quota and referrals decide.",
    bridge: "Job-Ready badges earned through stage-gated roadmaps.",
  },
  {
    step: "04",
    label: "Interview",
    own: "No pipeline to speak of.",
    campus: "One shot, one company.",
    bridge: "Multiple recruiters, transparent stages, email updates.",
  },
  {
    step: "05",
    label: "Offer",
    own: "Silence.",
    campus: "Limited seats.",
    bridge: "Offers based on verified ability.",
  },
];

export default function Home() {
  const { user, loading } = useSession();

  return (
    <main>
      <TopBar />

      {/* ── demo bar (dev/demo mode only) ────────────────── */}
      {!user && !loading && process.env.NEXT_PUBLIC_DEMO_MODE === "true" && (
        <div className="sticky top-16 z-20 border-b border-line bg-list">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-2 text-xs sm:px-6">
            <span className="font-bold text-ink">Try the demo</span>
            <span className="text-ink-3">— password: skillbridge123</span>
            {DEMO_ACCOUNTS.map((d) => (
              <Link
                key={d.email}
                href={`/login?next=${encodeURIComponent(d.href)}`}
                className="chip border border-line bg-canvas text-ink shadow-card transition hover:border-accent hover:text-accent"
              >
                {d.role}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-line">
        {/* 3D shapes — decorative, desktop only, behind content */}
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] select-none md:block">
          <HeroScene />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 sm:pb-20 sm:pt-28">
          <div className="max-w-4xl">
            <span className="chip border border-line bg-canvas text-ink-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              For tier 2 &amp; 3 college students in India
            </span>
            {user ? (
              <h1 className="mt-6 text-5xl leading-[1.02] sm:text-7xl">
                Welcome back, {user.name.split(" ")[0]}.
                <br />
                <span className="text-accent">Keep going.</span>
              </h1>
            ) : (
              <h1 className="mt-6 text-5xl leading-[1.02] sm:text-7xl">
                From roadmap,
                <br />
                to <span className="text-accent">job offer.</span>
              </h1>
            )}
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">
              {user
                ? "Your roadmaps, test scores, and job matches are waiting — pick up right where you left off."
                : "Follow a structured roadmap, pass a timed, server-graded test, and put a verified scorecard in front of recruiters who hire on ability. No campus quota, no referrals, no college filter."}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {user ? (
                <>
                  <Link href="/roadmaps" className="btn-primary">Continue a roadmap</Link>
                  <Link href="/jobs" className="btn-ghost">See your job matches</Link>
                </>
              ) : (
                <>
                  <Link href="/signup" className="btn-primary">Start learning — free</Link>
                  <Link href="/roadmaps" className="btn-ghost">Browse roadmaps first</Link>
                </>
              )}
            </div>
            <p className="mt-4 text-xs text-ink-3">
              No credit card. No placement fees. Ever.
            </p>
          </div>

          {/* stat band — big numbers, hairline grid */}
          <dl className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line shadow-card sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="bg-canvas p-6">
                <dd className="tnum text-3xl font-semibold text-accent sm:text-4xl">{s.value}</dd>
                <dt className="mt-1 text-xs font-medium text-ink-2">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Hiring-companies marquee (demo seed companies) ── */}
      {IS_DEV && (
        <section className="border-b border-line py-8">
          <p className="text-center text-[11px] font-bold uppercase tracking-[0.14em] text-ink-3">
            Demo companies hiring on SkillBridge
          </p>
          <div className="marquee-mask mt-5 overflow-hidden">
            <div className="animate-marquee flex w-max items-center gap-3 pr-3">
              {[...COMPANIES, ...COMPANIES].map((c, i) => (
                <span
                  key={`${c}-${i}`}
                  aria-hidden={i >= COMPANIES.length}
                  className="whitespace-nowrap rounded-full border border-line bg-canvas px-5 py-2 text-sm font-semibold text-ink-2"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Roadmap tracks ──────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl sm:text-5xl">Pick your track.</h2>
            <p className="mt-3 max-w-lg text-ink-2">Curated, dependency-ordered, checkpoint-tested. Finish the stages, earn the badge.</p>
          </div>
          <Link href="/roadmaps" className="hidden text-sm font-semibold text-accent hover:underline sm:block">
            All roadmaps →
          </Link>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ROADMAPS.map((r) => {
            const topics = r.stages.reduce((n, s) => n + s.topics.length, 0);
            return (
              <Tilt>
                <Link key={r.id} href={`/roadmaps/${r.id}`} className="card group flex h-full flex-col rounded-3xl p-6 transition hover:shadow-card-lift">
                  <span className="chip w-fit bg-list text-accent">{r.stages.length} stages</span>
                  <h3 className="mt-4 text-lg font-semibold leading-snug group-hover:text-accent">{r.title}</h3>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-2">{r.tagline}</p>
                  <div className="tnum mt-5 flex items-center justify-between border-t border-line pt-4 text-xs text-ink-3">
                    <span>{topics} topics · {r.totalHours} hrs</span>
                    <span>{r.stages.length} stages</span>
                  </div>
                </Link>
              </Tilt>
            );
          })}
        </div>
      </section>

      {/* ── How it works ────────────────────────────────── */}
      <section className="border-y border-line bg-list py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-end justify-between">
            <h2 className="text-3xl sm:text-5xl">Three moves. That&apos;s it.</h2>
            <span className="tnum hidden text-xs text-ink-3 sm:block">01 — 03</span>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Learn",
                text: "Stage-gated roadmaps from beginner to job-ready. A checkpoint quiz unlocks each stage, so progress means something.",
                href: "/roadmaps",
                cta: "Browse roadmaps",
              },
              {
                step: "02",
                title: "Prove",
                text: "Timed tests, graded on our server. Score 70 or above and a verified scorecard goes on your profile.",
                href: "/tests",
                cta: "Take a test",
              },
              {
                step: "03",
                title: "Get hired",
                text: "Recruiters search by verified scores and Job-Ready badges — the pipeline updates you at every stage.",
                href: "/jobs",
                cta: "See open jobs",
              },
            ].map((c) => (
              <div key={c.step} className="flex flex-col rounded-3xl border border-line bg-canvas p-7 shadow-card">
                <span className="tnum text-sm font-semibold text-accent">{c.step}</span>
                <h3 className="mt-3 text-2xl">{c.title}</h3>
                <p className="mt-2.5 flex-1 text-sm leading-relaxed text-ink-2">{c.text}</p>
                <Link href={c.href} className="mt-6 w-fit rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent">
                  {c.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trending skills ─────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl sm:text-5xl">What the market wants now.</h2>
            <p className="mt-3 max-w-xl text-ink-2">
              {TRENDING_SKILLS.length} skill tracks, refreshed quarterly. Every linked resource is
              official documentation, a recognized platform, or a standards body — nothing scraped, no blog spam.
            </p>
          </div>
          <Link href="/trending" className="hidden text-sm font-semibold text-accent hover:underline sm:block">
            All trending skills →
          </Link>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {TRENDING_SKILLS.slice(0, 5).map((t) => (
            <Link key={t.skill_id} href={`/trending/${t.skill_id}`} className="card group flex flex-col rounded-3xl p-5 transition hover:shadow-card-lift">
              <span className="chip w-fit bg-tile uppercase tracking-wide text-ink-2">{t.category}</span>
              <h3 className="mt-3 flex-1 font-semibold leading-snug group-hover:text-accent">{t.title}</h3>
              <p className="tnum mt-4 border-t border-line pt-3 text-xs text-ink-3">
                {t.milestones.length} milestones · {trendingResourceCount(t)} verified links
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Comparison table ────────────────────────────── */}
      <section className="border-y border-line bg-list py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-5xl">From idea to offer. Compared.</h2>
            <p className="mt-3 text-ink-2">How hiring actually works — on your own, through campus, or on one connected path.</p>
          </div>
          <div className="mt-10 overflow-x-auto rounded-3xl border border-line bg-canvas shadow-card">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line">
                  <th className="w-44 px-5 py-5 align-bottom text-sm font-semibold text-ink-2">From idea to offer</th>
                  <th className="px-5 py-5 align-bottom">
                    <span className="block text-sm font-semibold">On your own</span>
                    <span className="mt-0.5 block text-xs font-normal text-ink-3">You run the process</span>
                  </th>
                  <th className="px-5 py-5 align-bottom">
                    <span className="block text-sm font-semibold">Campus placement</span>
                    <span className="mt-0.5 block text-xs font-normal text-ink-3">Your college decides</span>
                  </th>
                  <th className="bg-accent px-5 py-5 align-bottom text-white">
                    <span className="block text-[11px] font-bold uppercase tracking-[0.08em] text-white/80">One connected path</span>
                    <span className="mt-0.5 block text-sm font-semibold">SkillBridge — you learn, we connect</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, ri) => (
                  <tr key={row.step} className={ri < COMPARISON_ROWS.length - 1 ? "border-b border-line" : ""}>
                    <th scope="row" className="px-5 py-4 align-top">
                      <span className="tnum mr-2 text-xs font-semibold text-ink-3">{row.step}</span>
                      <span className="text-sm font-semibold">{row.label}</span>
                    </th>
                    <td className="px-5 py-4 align-top text-sm text-ink-2">{row.own}</td>
                    <td className="px-5 py-4 align-top text-sm text-ink-2">{row.campus}</td>
                    <td className="bg-accent/5 px-5 py-4 align-top text-sm font-medium text-ink">{row.bridge}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Testimonials (demo quotes until real stories exist) ── */}
      {IS_DEV && (
      <section className="bg-charcoal py-20 text-canvas">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <h2 className="text-3xl sm:text-5xl">Receipts, not promises.</h2>
            <span className="chip bg-canvas/10 text-canvas/70">demo quotes</span>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="rounded-3xl border border-canvas/15 bg-canvas/5 p-6">
                <blockquote className="flex-1 text-sm leading-relaxed text-canvas/90">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t border-canvas/15 pt-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-sm font-bold text-ink">
                    {t.avatar}
                  </span>
                  <div>
                    <p className="text-sm font-bold">{t.name}</p>
                    <p className="text-xs text-canvas/60">{t.detail}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ── Skills strip (only skills with live tests) ─── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <h2 className="text-center text-2xl sm:text-4xl">
          {TEST_COUNT} verified test{TEST_COUNT === 1 ? "" : "s"} live today. More every month.
        </h2>
        <div className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-2">
          {TESTS.map((t) => {
            const s = skillById(t.skillId);
            return (
              <Link
                key={s.id}
                href={`/tests/${s.id}`}
                className="rounded-full border border-line bg-canvas px-4 py-2 text-sm font-medium text-ink shadow-card transition hover:border-accent hover:text-accent"
              >
                {s.name}
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── For recruiters ──────────────────────────────── */}
      <section className="border-y border-line bg-list py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <span className="chip border border-line bg-canvas text-ink-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              For recruiters
            </span>
            <h2 className="mt-5 text-3xl leading-tight sm:text-5xl">
              Stop filtering by college tier.<br />Start filtering by proof.
            </h2>
            <p className="mt-4 max-w-lg text-ink-2">
              Search candidates by verified test scores, see roadmap progress, and post roles
              that reach students from 500+ colleges — including the tier-2 and tier-3 schools
              your competitors ignore.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Candidate search ranked by verified skill scores",
                "Integrity flags on every test attempt",
                "Verified recruiter accounts — no spam applicants",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-ink">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" /> {f}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup?role=recruiter" className="btn-primary">Hire on SkillBridge</Link>
              <Link href="/recruiter/candidates" className="btn-ghost">Preview candidate search</Link>
            </div>
          </div>
          {IS_DEV && (
          <div className="overflow-hidden rounded-3xl border border-line bg-canvas shadow-card">
            <p className="border-b border-line bg-tile px-5 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-3">
              Live on the platform (demo seed jobs)
            </p>
            <div className="divide-y divide-line">
              {JOBS.slice(0, 4).map((j) => (
                <div key={j.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{j.role}</p>
                    <p className="text-xs text-ink-3">{j.company} · {j.location}</p>
                  </div>
                  <span className="tnum whitespace-nowrap text-xs font-semibold text-accent">{j.salary}</span>
                </div>
              ))}
            </div>
            <Link href="/jobs" className="block border-t border-line px-5 py-3.5 text-center text-sm font-semibold text-accent transition hover:bg-list">
              View all {JOBS.length} open roles →
            </Link>
          </div>
          )}
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <h2 className="text-center text-3xl sm:text-5xl">You got questions? We got answers.</h2>
        <div className="mt-10 space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="card group rounded-2xl p-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-bold">
                {f.q}
                <span className="text-accent transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-2">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────── */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6">
          <h2 className="mx-auto max-w-2xl text-4xl leading-[1.05] sm:text-6xl">
            You bring the effort.
            <br />
            <span className="text-accent">We bring the employers.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-ink-2">
            Free for students, forever. No college filter. No referral needed.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={user ? "/roadmaps" : "/signup"}
              className="btn-primary px-8 text-base"
            >
              {user ? "Continue learning" : "Start learning today"}
            </Link>
            <Link href="/jobs" className="btn-ghost">See who&apos;s hiring</Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
