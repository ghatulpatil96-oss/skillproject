import type { Metadata } from "next";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import { CONTACT_EMAIL } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Privacy Policy — SkillBridge",
  description: "What data SkillBridge collects, how it is stored and used, and the choices you have. Plain language, no dark patterns.",
};

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "1. What we collect",
    body: [
      "Account basics: your name, email, and password (stored only as a salted scrypt hash — we can never read your password).",
      "Profile details you choose to add: college, graduation year, company (recruiters), roadmap progress, and test scores.",
      "Emails you send us through the contact form.",
    ],
  },
  {
    title: "2. How we use it",
    body: [
      "To run the product: show your progress, verify and display test scores, and match you to relevant jobs.",
      "To let recruiters discover you by verified skill scores — never by college tier.",
      "To send transactional email (welcome, scorecards, recruiter verification) via our email provider.",
    ],
  },
  {
    title: "3. What we never do",
    body: [
      "We never sell your personal data. Recruiting is the business model — your data is not.",
      "We never show recruiters your password, email, or anything you haven't put on your profile.",
      "We never charge students for access to their own scorecards.",
    ],
  },
  {
    title: "4. Cookies",
    body: [
      "We set one essential cookie: a signed, httpOnly session cookie (`sb_session`) that keeps you logged in for up to 30 days. It contains a user ID and expiry, both HMAC-signed — no tracking, no third-party cookies.",
    ],
  },
  {
    title: "5. Security",
    body: [
      "Passwords are hashed with scrypt and a per-user salt. Sessions are HMAC-signed tokens. Data is stored in an access-controlled store, and we'll keep hardening as the platform grows.",
    ],
  },
  {
    title: "6. Your choices",
    body: [
      "You can view everything stored on your profile at any time.",
      "Want your account deleted or your data exported? Email us and we'll action it within 30 days.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main>
      <TopBar title="Privacy Policy" />

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
        <p className="mt-3 text-sm text-ink-3">Last updated: September 28, 2026</p>
        <p className="mt-5 text-ink-2">
          Plain language, because privacy policies should be readable. The short
          version: we collect the minimum needed to run SkillBridge, we never
          sell your data, and you can leave whenever you want.
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
          Questions about this policy?{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-accent hover:underline">
            {CONTACT_EMAIL}
          </a>{" "}
          — a human reads it.
        </div>
      </section>

      <Footer />
    </main>
  );
}
