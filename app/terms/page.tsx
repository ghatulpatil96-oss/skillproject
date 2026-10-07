import type { Metadata } from "next";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import { CONTACT_EMAIL } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Terms of Service — SkillBridge",
  description: "The rules of using SkillBridge: accounts, acceptable use, test integrity, and disclaimers — in plain language.",
};

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "1. Accounts",
    body: [
      "You must give accurate information and keep your password safe. You're responsible for activity under your account.",
      "Students use SkillBridge free; recruiters access candidate search under their plan. We may verify recruiter accounts before granting search access.",
    ],
  },
  {
    title: "2. Acceptable use",
    body: [
      "Don't cheat on tests: no sharing questions or answers, no automated tooling, no impersonation. Integrity violations void your scores and may end your account.",
      "Don't scrape the platform, spam recruiters, or misuse other users' data.",
    ],
  },
  {
    title: "3. Test scores & badges",
    body: [
      "Verified scores reflect performance on SkillBridge tests at a point in time. We may retire or refresh tests and reserve the right to re-verify or revoke scores affected by integrity issues.",
    ],
  },
  {
    title: "4. Content & resources",
    body: [
      "Trending-skill resources link to official documentation and accredited courses. We curate but don't host third-party content; those sites have their own terms.",
    ],
  },
  {
    title: "5. Jobs & hiring",
    body: [
      "Job listings are posted by verified recruiters. SkillBridge is a discovery platform — offers, contracts, and employment decisions are strictly between you and the employer.",
    ],
  },
  {
    title: "6. Disclaimers",
    body: [
      "The service is provided \"as is\" while we're in MVP. We work hard on accuracy and uptime but can't guarantee uninterrupted availability.",
      "These terms may evolve as the product does; material changes will be announced on the platform.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main>
      <TopBar title="Terms of Service" />

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl font-extrabold tracking-tight">Terms of Service</h1>
        <p className="mt-3 text-sm text-ink-3">Last updated: September 28, 2026</p>
        <p className="mt-5 text-ink-2">
          The deal is simple: we build a fair, skill-first hiring platform; you
          use it honestly. Here&apos;s what that means in practice.
        </p>

        <div className="mt-10 space-y-8">
          {SECTIONS.map((s) => (
            <div key={s.title}>
              <h2 className="text-lg font-extrabold">{s.title}</h2>
              <ul className="mt-3 space-y-2">
                {s.body.map((p) => (
                  <li key={p} className="text-sm leading-relaxed text-ink-2">• {p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="card mt-12 bg-accent/5 p-6 text-sm text-ink-2">
          Anything unclear?{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-accent hover:underline">
            {CONTACT_EMAIL}
          </a>{" "}
          — we&apos;d rather over-explain than lose you.
        </div>
      </section>

      <Footer />
    </main>
  );
}
