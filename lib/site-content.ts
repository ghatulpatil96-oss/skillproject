// Marketing content in one place so landing, About, and Footer stay in sync.
// Swap these arrays for a CMS or DB later without touching components.

export const TESTIMONIALS = [
  {
    quote:
      "No one from my college got campus placements. I followed the roadmap, scored 85 on my test, and got two interview calls in a week.",
    name: "Prateek Verma",
    detail: "B.Tech 2026 · Tier-3 college, Nagpur",
    avatar: "P",
  },
  {
    quote:
      "Recruiters only saw my 6 CGPA. SkillBridge saw my test scores and matched me to a frontend role I actually wanted.",
    name: "Sneha Das",
    detail: "BCA 2025 · Kolkata",
    avatar: "S",
  },
  {
    quote:
      "We stopped filtering by college tier. Three of our last five hires came from SkillBridge verified scores.",
    name: "Riya Mehta",
    detail: "Talent Lead, PixelForge Labs",
    avatar: "R",
  },
] as const;

export const FAQS = [
  {
    q: "Is SkillBridge really free for students?",
    a: "Yes — roadmaps, trending-skill guides, and skill tests are free for students, forever. Recruiters pay for candidate search; students never do.",
  },
  {
    q: "Do recruiters see my college name?",
    a: "No — and not your college tier either. Candidate search is skill-first: recruiters see your verified test scores, roadmap progress, and badges. College name and tier are hidden from recruiters entirely, so shortlisting can't be biased by them.",
  },
  {
    q: "How are test scores verified?",
    a: "Every test is timed with anti-integrity checks. Score 70+ and your verified scorecard is attached to your profile and visible to recruiters.",
  },
  {
    q: "What is the 'Trending Skills' section?",
    a: "It's a curated list of the 10 most in-demand technical skills right now, each broken into milestones with links to official docs and accredited courses — hand-verified, no content farms.",
  },
  {
    q: "How do I get hired?",
    a: "Pick a roadmap, take the matching skill test, and apply. Recruiters also search by verified scores — a high score can get you discovered without applying anywhere.",
  },
  {
    q: "Can recruiters use SkillBridge?",
    a: "Yes. Create a recruiter account, get verified by our team (usually within a day), then post jobs and search candidates by verified skill scores.",
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

export const CONTACT_EMAIL = "hello@skillbridge.in";

/** Marketing copy must not read like a chatbot wrote it — keep it */
/** concrete, specific, and free of emoji decoration.            */
export const BRAND = {
  name: "SkillBridge",
  tagline: "Hired for skill, not college name.",
};
