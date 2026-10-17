import type { Metadata } from "next";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import { ROADMAPS, TESTS } from "@/lib/data";
import { TRENDING_SKILLS } from "@/lib/trending";

export const metadata: Metadata = {
  title: "About SkillBridge",
  description:
    "Why SkillBridge exists: skill-based hiring for India's tier 2 and 3 college students — learn roadmaps, prove skills with verified tests, get discovered by recruiters.",
};

export default function AboutPage() {
  return (
    <main>
      <TopBar title="About us" />

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
          Your college name should not decide your career.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-2">
          Students at India&apos;s tier 2 and tier 3 colleges study the same
          frameworks, build the same projects, and sit the same interviews as
          anyone else, but they get filtered out before the interview because
          of where they studied. SkillBridge replaces that filter with
          evidence: learn a structured roadmap, take a timed test graded on
          our server, and let recruiters read your verified scorecard.
        </p>

        <h2 className="mt-14 text-2xl font-extrabold">What is on the platform today</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          These are counts of the content we can show you right now. There are
          no user counts here, because there is nothing to count until the
          first cohort takes the tests.
        </p>
        <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { value: `${ROADMAPS.length}`, label: "Job-ready roadmaps" },
            { value: `${TESTS.length}`, label: "Verified skill tests" },
            { value: `${TRENDING_SKILLS.length}`, label: "Trending-skill tracks" },
            { value: "₹0", label: "Cost for students" },
          ].map((s) => (
            <div key={s.label} className="card p-4 text-center">
              <dd className="text-2xl font-extrabold text-accent">{s.value}</dd>
              <dt className="mt-1 text-xs font-medium text-ink-2">{s.label}</dt>
            </div>
          ))}
        </dl>

        <h2 className="mt-14 text-2xl font-extrabold">How the model works</h2>
        <div className="mt-6 space-y-4">
          {[
            {
              title: "Learn — structured roadmaps",
              text: "Each roadmap is ordered from first topic to job-ready, and each stage ends with a checkpoint quiz. You do not move on until you clear it.",
            },
            {
              title: "Prove — verified skill tests",
              text: "Tests are timed and graded on our server from an answer key that never reaches the browser. A score of 70 or above attaches a verified scorecard to your profile.",
            },
            {
              title: "Get hired — skill-first discovery",
              text: "Recruiters search by verified scores and see roadmap progress. They cannot see your college name; that field is not collected in application data.",
            },
            {
              title: "Stay current — trending skills",
              text: "Ten tracks of what the market asks for right now. Every milestone links to official documentation, a recognized platform, or a standards body.",
            },
          ].map((b) => (
            <div key={b.title} className="card p-5">
              <h3 className="font-bold">{b.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{b.text}</p>
            </div>
          ))}
        </div>

        {/* ── TODO(real): founder story ─────────────────── */}
        {/*
        TODO(real): add the founders' names, one-line background each
        (e.g. years teaching or years hiring), and the specific story of
        why this problem matters to them. Plain facts only — invented
        history, quotes, or credentials are not acceptable. Until this
        is supplied, the section below must remain hidden.
        */}
        {false && (
          <section aria-hidden>
            <h2 className="mt-14 text-2xl font-extrabold">Who we are</h2>
            {/* TODO(real): founder names and story go here */}
          </section>
        )}

        <h2 className="mt-14 text-2xl font-extrabold">What we believe</h2>
        <ul className="mt-6 space-y-3 text-sm leading-relaxed text-ink">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-accent">•</span>
            Students never pay. Recruiters pay for access to verified talent, so the platform stays free for learners.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-accent">•</span>
            A verified score from a fair timed test is stronger evidence than an unverified bullet point on a C.V.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-accent">•</span>
            Test security matters. Answer keys never reach the browser, and each test session is issued a signed, single-use ticket.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-accent">•</span>
            When we do not have real data, we say so instead of inventing it.
          </li>
        </ul>

        <div className="card mt-14 flex flex-wrap items-center justify-between gap-4 bg-accent/5 p-6">
          <div>
            <h3 className="text-lg font-extrabold">Ready to start?</h3>
            <p className="text-sm text-ink-2">Free for students. No college filter.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/roadmaps" className="btn-primary h-10">Browse roadmaps</Link>
            <Link href="/contact" className="btn-ghost">Contact us</Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
