// Type definitions and clearly-labelled sample data for recruiter /
// admin interfaces. Nothing here is shown to production users as
// proof; sample records always appear under a "Sample" label.
export type Candidate = {
  id: string;
  name: string;
  gradYear: number;
  targetRole: string;
  skills: { skillId: string; score: number; percentile: number }[];
  roadmap: { id: string; pct: number };
  jobReady: boolean;
  location: string;
  profileScore: number;
  lastActiveDays: number;
};

/** Sample candidate used only where the UI is labelled as a sample. */
export const CANDIDATES: Candidate[] = [
  {
    id: "c1",
    name: "Ananya Sharma",
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

/** Sample recruiter identity used to illustrate the dashboard. */
export const RECRUITER = {
  name: "Riya Mehta",
  role: "Talent Lead",
  company: "PixelForge Labs",
  verified: true,
  plan: "Growth",
};

/** Sample admin identity. */
export const ADMIN = {
  name: "Saurabh K.",
  role: "Platform Admin",
};

// TODO(real): integrity flags will come from a server-side attempt
// reviewer. Nothing is imported or seeded in code any more.

export function candidateById(id: string): Candidate | undefined {
  return CANDIDATES.find((c) => c.id === id);
}
