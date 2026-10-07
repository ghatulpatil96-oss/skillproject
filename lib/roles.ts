// ─────────────────────────────────────────────────────────────
// Role-based seed data: candidates (for recruiters), recruiter
// & admin seed data, extra jobs, audit trail types.
// DEMO DATA — render behind a demo label and never as real proof.
// ─────────────────────────────────────────────────────────────

export type Candidate = {
  id: string;
  name: string;
  avatar: string;
  gradYear: number;
  targetRole: string;
  skills: { skillId: string; score: number; percentile: number }[];
  roadmap: { id: string; pct: number };
  jobReady: boolean;
  location: string;
  profileScore: number;
  lastActiveDays: number;
};

export const CANDIDATES: Candidate[] = [
  {
    id: "c1",
    name: "Ananya Sharma",
    avatar: "👩‍💻",
    gradYear: 2027,
    targetRole: "Frontend Developer",
    skills: [
      { skillId: "javascript", score: 86, percentile: 95 },
      { skillId: "react", score: 82, percentile: 92 },
      { skillId: "html-css", score: 90, percentile: 97 },
    ],
    roadmap: { id: "frontend-dev", pct: 100 },
    jobReady: true,
    location: "Pune, Maharashtra",
    profileScore: 92,
    lastActiveDays: 0,
  },
  {
    id: "c2",
    name: "Rahul Verma",
    avatar: "🧑‍💻",
    gradYear: 2026,
    targetRole: "Backend Developer",
    skills: [
      { skillId: "nodejs", score: 78, percentile: 88 },
      { skillId: "sql", score: 84, percentile: 93 },
      { skillId: "dsa", score: 66, percentile: 70 },
    ],
    roadmap: { id: "backend-dev", pct: 75 },
    jobReady: false,
    location: "Remote, India",
    profileScore: 81,
    lastActiveDays: 1,
  },
  {
    id: "c3",
    name: "Priya Nair",
    avatar: "👩‍🎓",
    gradYear: 2027,
    targetRole: "Data Analyst",
    skills: [
      { skillId: "sql", score: 88, percentile: 96 },
      { skillId: "python", score: 74, percentile: 85 },
    ],
    roadmap: { id: "data-analyst", pct: 60 },
    jobReady: false,
    location: "Hyderabad, Telangana",
    profileScore: 77,
    lastActiveDays: 2,
  },
  {
    id: "c4",
    name: "Imran Khan",
    avatar: "👨‍💻",
    gradYear: 2026,
    targetRole: "QA Engineer",
    skills: [
      { skillId: "testing", score: 80, percentile: 90 },
      { skillId: "javascript", score: 72, percentile: 82 },
      { skillId: "git", score: 85, percentile: 94 },
    ],
    roadmap: { id: "qa-testing", pct: 100 },
    jobReady: true,
    location: "Remote, India",
    profileScore: 88,
    lastActiveDays: 0,
  },
  {
    id: "c5",
    name: "Divya Patil",
    avatar: "👩‍🔬",
    gradYear: 2027,
    targetRole: "Frontend Developer",
    skills: [
      { skillId: "react", score: 71, percentile: 78 },
      { skillId: "javascript", score: 68, percentile: 74 },
    ],
    roadmap: { id: "frontend-dev", pct: 45 },
    jobReady: false,
    location: "Pune, Maharashtra",
    profileScore: 69,
    lastActiveDays: 4,
  },
  {
    id: "c6",
    name: "Arjun Reddy",
    avatar: "🧑‍🔧",
    gradYear: 2026,
    targetRole: "Backend Developer",
    skills: [
      { skillId: "sql", score: 91, percentile: 98 },
      { skillId: "nodejs", score: 83, percentile: 91 },
      { skillId: "dsa", score: 89, percentile: 97 },
    ],
    roadmap: { id: "backend-dev", pct: 90 },
    jobReady: false,
    location: "Bengaluru, Karnataka",
    profileScore: 94,
    lastActiveDays: 1,
  },
];

export const RECRUITER = {
  name: "Riya Mehta",
  role: "Talent Lead",
  company: "PixelForge Labs",
  avatar: "👩‍💼",
  verified: true,
  plan: "Growth",
};

export const ADMIN = {
  name: "Saurabh K.",
  role: "Platform Admin",
  avatar: "🛡️",
};

/** Recruiter verification queue (fake sign-ups awaiting admin review). */
export const PENDING_RECRUITERS = [
  {
    id: "r1",
    name: "Karan Singh",
    email: "karan@hiringbird.in",
    company: "HiringBird Consulting",
    domain: "hiringbird.in",
    jobsRequested: 3,
    daysWaiting: 2,
    risk: "medium" as const,
  },
  {
    id: "r2",
    name: "Neha Gupta",
    email: "neha.hr@cloudzen.io",
    company: "CloudZen Technologies",
    domain: "cloudzen.io",
    jobsRequested: 5,
    daysWaiting: 0,
    risk: "low" as const,
  },
  {
    id: "r3",
    name: "Fake McFakeface",
    email: "mcfake@gmail.com",
    company: "Dream Jobs Corp",
    domain: "gmail.com",
    jobsRequested: 50,
    daysWaiting: 5,
    risk: "high" as const,
  },
];

/** Assessment integrity flags raised by the test player. */
export const INTEGRITY_FLAGS = [
  {
    id: "f1",
    candidate: "Test User #4821",
    skill: "javascript",
    reason: "7 tab switches during test",
    severity: "high" as const,
    when: "2h ago",
  },
  {
    id: "f2",
    candidate: "Ananya Sharma",
    skill: "react",
    reason: "1 tab switch (below threshold)",
    severity: "low" as const,
    when: "1d ago",
  },
  {
    id: "f3",
    candidate: "Test User #5107",
    skill: "sql",
    reason: "Answers submitted at implausible speed (avg 4s/question)",
    severity: "medium" as const,
    when: "3h ago",
  },
];

export function candidateById(id: string): Candidate | undefined {
  return CANDIDATES.find((c) => c.id === id);
}
