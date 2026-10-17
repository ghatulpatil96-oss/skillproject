// ─────────────────────────────────────────────────────────────
// Site-shared content: FAQs, footer links, contact address.
//
// Principles: no testimonials, no learner counts, no sample
// companies. Anything shown in production must be real and
// sourced. TODO(real) markers list content still to be supplied.
// ─────────────────────────────────────────────────────────────

export const FAQS = [
  {
    q: "Is SkillBridge free for students?",
    a: "Yes. Roadmaps, trending-skill guides, and skill tests are free. Students never pay.",
  },
  {
    q: "Do recruiters see my college name?",
    a: "No. Recruiters see your verified test scores, roadmap progress, and badges. College name and tier are hidden from recruiters so those details cannot influence shortlisting.",
  },
  {
    q: "How are test scores verified?",
    a: "Tests are timed and graded on the server. The answer key is never sent to the browser, and each attempt is bound to a signed ticket that records when the session started. A score of 70 or above attaches a verified scorecard to your profile.",
  },
  {
    q: "What is the Trending Skills section?",
    a: "A curated list of in-demand technical skills. Each track is broken into milestones with links: official documentation, established education platforms, accredited courses, or standards bodies.",
  },
  {
    q: "How do I get hired?",
    a: "Pick a roadmap, take the matching skill test, and apply to jobs. Recruiters search by verified scores and can discover you without a cold application.",
  },
  {
    q: "Can recruiters use SkillBridge?",
    a: "Yes. Create a recruiter account, get verified by the team, then post jobs and search candidates by verified skill scores. Unverified recruiters can save job drafts but cannot publish.",
  },
] as const;

export const FOOTER_LINKS: {
  heading: string;
  links: { href: string; label: string }[];
}[] = [
  {
    heading: "For students",
    links: [
      { href: "/roadmaps", label: "Roadmaps" },
      { href: "/trending", label: "Trending skills" },
      { href: "/tests", label: "Skill tests" },
      { href: "/jobs", label: "Jobs" },
      { href: "/profile", label: "My profile" },
    ],
  },
  {
    heading: "For recruiters",
    links: [
      { href: "/signup?role=recruiter", label: "Create recruiter account" },
      { href: "/recruiter", label: "Dashboard" },
      { href: "/recruiter/candidates", label: "Find candidates" },
      { href: "/recruiter/post", label: "Post a job" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About us" },
      { href: "/contact", label: "Contact" },
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of service" },
    ],
  },
];

export const CONTACT_EMAIL = "hello@skillbridge.in"; // TODO(real): confirm the real contact inbox

/** Shared copy — keep it concrete and specific. */
export const BRAND = {
  name: "SkillBridge",
  tagline: "Hired for skill, not college name.",
};
