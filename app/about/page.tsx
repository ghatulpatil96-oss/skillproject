import type { Metadata } from "next";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import { ROADMAPS, SKILLS } from "@/lib/data";
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
        <span className="chip bg-accent/10 text-accent">Our mission</span>
        <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight">
          Your college name should not decide your career.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-2">
          Every year, millions of students graduate from India&apos;s tier 2 and
          tier 3 colleges with real skills — and get filtered out before an
          interview because of where they studied. SkillBridge flips the filter:
          learn a structured roadmap, prove it on a verified, timed test, and let
          recruiters discover you on ability.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { value: `${ROADMAPS.length}`, label: "Job-ready roadmaps" },
            { value: `${SKILLS.length}`, label: "Verified skill tests" },
            { value: `${TRENDING_SKILLS.length}`, label: "Trending-skill tracks" },
            { value: "₹0", label: "Free for students" },
          ].map((s) => (
            <div key={s.label} className="card p-4 text-center">
              <div className="text-2xl font-extrabold text-accent">{s.value}</div>
              <div className="mt-1 text-xs font-medium text-ink-2">{s.label}</div>
            </div>
          ))}
        </div>

        <h2 className="mt-14 text-2xl font-extrabold">How the model works</h2>
        <div className="mt-6 space-y-4">
          {[
            {
              title: "Learn — structured roadmaps",
              text: "Each roadmap is dependency-ordered from beginner to job-ready, with checkpoint quizzes that gate every stage so progress means something.",
            },
            {
              title: "Prove — verified skill tests",
              text: "Timed MCQ + coding tests with integrity checks. A score of 70+ attaches a verified scorecard to your profile that recruiters can trust.",
            },
            {
              title: "Get hired — skill-first discovery",
              text: "Recruiters search candidates by verified scores and badges, never by college tier. Students apply to jobs knowing exactly how they match.",
            },
            {
              title: "Stay current — trending skills",
              text: "Ten live tracks of what the market wants right now, each milestone linked only to official docs and accredited courses, link-checked automatically.",
            },
          ].map((b) => (
            <div key={b.title} className="card p-5">
              <h3 className="font-bold">{b.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{b.text}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-14 text-2xl font-extrabold">What we believe</h2>
        <ul className="mt-6 space-y-3 text-sm leading-relaxed text-ink">
          {[
            "Students should never pay to be discovered — recruiting pays the bills, not learners.",
            "A verified score from a fair, timed test beats an unverified bullet point on a résumé.",
            "Trust is the product: curated resources from official sources only, and integrity checks on every test.",
          ].map((v) => (
            <li key={v} className="flex items-start gap-2">
              <span className="mt-0.5 text-accent">✓</span> {v}
            </li>
          ))}
        </ul>

        <div className="card mt-14 flex flex-wrap items-center justify-between gap-4 bg-accent/5 p-6">
          <div>
            <h3 className="text-lg font-extrabold">Ready to start?</h3>
            <p className="text-sm text-ink-2">Free forever for students. No college filter.</p>
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
