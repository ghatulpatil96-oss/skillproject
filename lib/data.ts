// ─────────────────────────────────────────────────────────────
// SkillBridge seed data — skills, roadmaps, jobs, question bank
// (In production these come from Postgres + CMS; static seed
// keeps the MVP fully client-side and free to host.)
// ─────────────────────────────────────────────────────────────

export type Skill = {
  id: string;
  name: string;
  emoji: string;
};

export type Topic = {
  id: string;
  title: string;
  hours: number;
  resource?: string;
};

export type Stage = {
  id: string;
  name: string;
  topics: Topic[];
};

export type Roadmap = {
  id: string;
  title: string;
  emoji: string;
  tagline: string;
  targetRole: string;
  skills: string[]; // skill ids
  stages: Stage[];
  capstone: string;
  totalHours: number;
};

export type Job = {
  id: string;
  role: string;
  company: string;
  logo: string; // emoji monogram
  location: string;
  salary: string;
  type: "Full-time" | "Internship";
  skills: { skillId: string; minScore: number }[];
  description: string;
  perks: string[];
  companyType: string;
  postedDaysAgo: number;
};

export const SKILLS: Skill[] = [
  { id: "html-css", name: "HTML & CSS", emoji: "🎨" },
  { id: "javascript", name: "JavaScript", emoji: "🟨" },
  { id: "react", name: "React", emoji: "⚛️" },
  { id: "nodejs", name: "Node.js", emoji: "🟢" },
  { id: "sql", name: "SQL", emoji: "🗄️" },
  { id: "python", name: "Python", emoji: "🐍" },
  { id: "dsa", name: "Data Structures & Algorithms", emoji: "🧮" },
  { id: "git", name: "Git & GitHub", emoji: "🔀" },
  { id: "java", name: "Java", emoji: "☕" },
  { id: "testing", name: "Testing & QA", emoji: "🧪" },
];

export const ROADMAPS: Roadmap[] = [
  {
    id: "frontend-dev",
    title: "Frontend Developer",
    emoji: "🖥️",
    tagline: "Build beautiful, fast web UIs with HTML, CSS, JS & React",
    targetRole: "Frontend Developer",
    skills: ["html-css", "javascript", "react", "git"],
    capstone: "Build a responsive job-board SPA with React + routing + API data",
    totalHours: 180,
    stages: [
      {
        id: "fe-foundations",
        name: "Foundations",
        topics: [
          { id: "fe-t1", title: "HTML semantics & accessibility", hours: 8, resource: "MDN: HTML basics" },
          { id: "fe-t2", title: "CSS: box model, flexbox, grid", hours: 14, resource: "web.dev: Learn CSS" },
          { id: "fe-t3", title: "Responsive design & media queries", hours: 8 },
          { id: "fe-t4", title: "Git & GitHub fundamentals", hours: 6, resource: "git-scm book ch. 1–3" },
        ],
      },
      {
        id: "fe-core",
        name: "Core JavaScript",
        topics: [
          { id: "fe-t5", title: "Variables, types, functions", hours: 10 },
          { id: "fe-t6", title: "DOM manipulation & events", hours: 12 },
          { id: "fe-t7", title: "Async JS: promises, fetch, async/await", hours: 14 },
          { id: "fe-t8", title: "ES6+ features & modules", hours: 8 },
        ],
      },
      {
        id: "fe-advanced",
        name: "React",
        topics: [
          { id: "fe-t9", title: "Components, props & state", hours: 12 },
          { id: "fe-t10", title: "Hooks: useEffect, useMemo, custom hooks", hours: 14 },
          { id: "fe-t11", title: "React Router & data fetching patterns", hours: 10 },
          { id: "fe-t12", title: "State management (Context / Zustand)", hours: 8 },
        ],
      },
      {
        id: "fe-jobready",
        name: "Job-Ready",
        topics: [
          { id: "fe-t13", title: "Performance: lazy loading, memoization", hours: 8 },
          { id: "fe-t14", title: "Deploying a portfolio project", hours: 6 },
          { id: "fe-t15", title: "Interview prep: 50 frontend questions", hours: 10 },
        ],
      },
    ],
  },
  {
    id: "backend-dev",
    title: "Backend Developer (Node.js)",
    emoji: "⚙️",
    tagline: "APIs, databases and server-side engineering",
    targetRole: "Backend Developer",
    skills: ["javascript", "nodejs", "sql", "git", "dsa"],
    capstone: "Build & deploy a REST API with auth, Postgres and tests",
    totalHours: 200,
    stages: [
      {
        id: "be-foundations",
        name: "Foundations",
        topics: [
          { id: "be-t1", title: "How the web works: HTTP, DNS, REST", hours: 8 },
          { id: "be-t2", title: "JavaScript for backend devs", hours: 12 },
          { id: "be-t3", title: "Git workflows (branching, PRs)", hours: 6 },
        ],
      },
      {
        id: "be-core",
        name: "Node & Databases",
        topics: [
          { id: "be-t4", title: "Node.js runtime & npm ecosystem", hours: 10 },
          { id: "be-t5", title: "Express: routing, middleware, errors", hours: 14 },
          { id: "be-t6", title: "SQL: joins, indexes, transactions", hours: 16 },
          { id: "be-t7", title: "ORMs & schema design", hours: 10 },
        ],
      },
      {
        id: "be-advanced",
        name: "Production Skills",
        topics: [
          { id: "be-t8", title: "Authentication: JWT & sessions", hours: 10 },
          { id: "be-t9", title: "Testing: unit & integration", hours: 12 },
          { id: "be-t10", title: "Caching with Redis, queues", hours: 10 },
        ],
      },
      {
        id: "be-jobready",
        name: "Job-Ready",
        topics: [
          { id: "be-t11", title: "DSA essentials for interviews", hours: 30 },
          { id: "be-t12", title: "System design basics: load balancers, scaling", hours: 12 },
        ],
      },
    ],
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    emoji: "📊",
    tagline: "SQL, Python and storytelling with data",
    targetRole: "Data Analyst",
    skills: ["sql", "python", "dsa"],
    capstone: "Analyze a public dataset and present an insight-driven dashboard",
    totalHours: 150,
    stages: [
      {
        id: "da-foundations",
        name: "Foundations",
        topics: [
          { id: "da-t1", title: "Spreadheets: formulas, pivots, charts", hours: 10 },
          { id: "da-t2", title: "Statistics fundamentals", hours: 12 },
          { id: "da-t3", title: "SQL from zero to joins", hours: 16 },
        ],
      },
      {
        id: "da-core",
        name: "Python for Data",
        topics: [
          { id: "da-t4", title: "Python basics & notebooks", hours: 12 },
          { id: "da-t5", title: "pandas: cleaning & wrangling", hours: 16 },
          { id: "da-t6", title: "Visualization: matplotlib & seaborn", hours: 10 },
        ],
      },
      {
        id: "da-jobready",
        name: "Job-Ready",
        topics: [
          { id: "da-t7", title: "Dashboards: Power BI / Looker Studio", hours: 12 },
          { id: "da-t8", title: "Case studies & interview SQL drills", hours: 14 },
        ],
      },
    ],
  },
  {
    id: "qa-testing",
    title: "QA / Automation Testing",
    emoji: "🧪",
    tagline: "Break software professionally — manual to automation",
    targetRole: "QA Engineer",
    skills: ["testing", "javascript", "git"],
    capstone: "Automate an e-commerce checkout flow end-to-end with Playwright",
    totalHours: 120,
    stages: [
      {
        id: "qa-foundations",
        name: "Foundations",
        topics: [
          { id: "qa-t1", title: "SDLC, bug lifecycle & test cases", hours: 10 },
          { id: "qa-t2", title: "Writing effective test plans", hours: 8 },
        ],
      },
      {
        id: "qa-core",
        name: "Automation",
        topics: [
          { id: "qa-t3", title: "JavaScript essentials for testers", hours: 12 },
          { id: "qa-t4", title: "Playwright / Selenium basics", hours: 16 },
          { id: "qa-t5", title: "API testing with Postman", hours: 10 },
        ],
      },
      {
        id: "qa-jobready",
        name: "Job-Ready",
        topics: [
          { id: "qa-t6", title: "CI integration: run tests on GitHub Actions", hours: 10 },
          { id: "qa-t7", title: "Interview prep: scenarios & frameworks", hours: 8 },
        ],
      },
    ],
  },
];

// Question bank moved to lib/server/questions.ts (import "server-only"):
// answers + explanations must never reach the client bundle.

export const TESTS = [
  { id: "javascript", skillId: "javascript", durationMin: 20, mcqCount: 5, codeCount: 1, passingScore: 70 },
  { id: "sql", skillId: "sql", durationMin: 20, mcqCount: 5, codeCount: 1, passingScore: 70 },
] as const;

// ── Jobs (recruiter-posted) ──
export const JOBS: Job[] = [
  {
    id: "j1",
    role: "Frontend Developer (0–1 yrs)",
    company: "PixelForge Labs",
    logo: "🟦",
    location: "Remote, India",
    salary: "₹5L – ₹8L",
    type: "Full-time",
    companyType: "Product Startup",
    postedDaysAgo: 1,
    skills: [
      { skillId: "javascript", minScore: 65 },
      { skillId: "react", minScore: 70 },
    ],
    description:
      "We're building an AI design tool used by 40k+ creators. You'll own UI features end-to-end in our React codebase, pair with senior engineers, and ship to production in week one. We hire from every college — your test scores matter more than your degree.",
    perks: ["Remote-first", "Learning budget ₹50k/yr", "ESOPs"],
  },
  {
    id: "j2",
    role: "Junior Backend Engineer",
    company: "CargoStack",
    logo: "🚚",
    location: "Bengaluru, Karnataka",
    salary: "₹6L – ₹9L",
    type: "Full-time",
    companyType: "Logistics Tech · Series A",
    postedDaysAgo: 2,
    skills: [
      { skillId: "nodejs", minScore: 60 },
      { skillId: "sql", minScore: 70 },
    ],
    description:
      "Our APIs move 2M+ shipments a day. Join the platform team to design schemas, tune queries, and build REST services in Node.js. Great fit for someone who loved the SQL sections of their roadmap.",
    perks: ["Hybrid", "Health insurance", "Mentorship program"],
  },
  {
    id: "j3",
    role: "Data Analyst Intern",
    company: "MarketPulse",
    logo: "📈",
    location: "Hyderabad, Telangana",
    salary: "₹25k/mo stipend",
    type: "Internship",
    companyType: "Analytics · Pre-Series A",
    postedDaysAgo: 3,
    skills: [
      { skillId: "sql", minScore: 60 },
      { skillId: "python", minScore: 55 },
    ],
    description:
      "6-month internship with pre-placement offer potential. You'll write SQL daily, build dashboards, and present insights directly to the founding team. 3 of our last 4 interns converted to full-time.",
    perks: ["PPO pathway", "Direct founder access", "Certificate"],
  },
  {
    id: "j4",
    role: "React Developer",
    company: "LearnLoop",
    logo: "🎓",
    location: "Pune, Maharashtra",
    salary: "₹4.5L – ₹7L",
    type: "Full-time",
    companyType: "EdTech · Seed",
    postedDaysAgo: 5,
    skills: [
      { skillId: "react", minScore: 65 },
      { skillId: "javascript", minScore: 70 },
    ],
    description:
      "EdTech serving 200k students from tier-2/3 towns — built by people who lived that journey. You'll build interactive learning components and our assessment player. Dogfooding heaven: you used tools like ours to get here.",
    perks: ["Hybrid", "Flexible hours", "Course stipend"],
  },
  {
    id: "j5",
    role: "QA Engineer (Automation)",
    company: "FinSight",
    logo: "💳",
    location: "Remote, India",
    salary: "₹5L – ₹7.5L",
    type: "Full-time",
    companyType: "Fintech · Series B",
    postedDaysAgo: 4,
    skills: [
      { skillId: "testing", minScore: 65 },
      { skillId: "javascript", minScore: 60 },
    ],
    description:
      "Zero tolerance for bugs in payments. You'll own automated regression suites in Playwright, wire them into CI, and guard every release. We'll train you on fintech domain from scratch.",
    perks: ["Remote", "Quarterly offsites", "Certifications sponsored"],
  },
  {
    id: "j6",
    role: "Full-Stack Developer Intern",
    company: "GreenCart",
    logo: "🥬",
    location: "Gurugram, Haryana",
    salary: "₹20k/mo stipend",
    type: "Internship",
    companyType: "D2C · Seed",
    postedDaysAgo: 6,
    skills: [
      { skillId: "javascript", minScore: 60 },
      { skillId: "sql", minScore: 55 },
    ],
    description:
      "Solo-dev-turned-team building tools for kirana stores. As intern #2 you'll touch everything: React frontend, Node APIs, Postgres schema. Maximum ownership, messy real-world problems.",
    perks: ["Startup experience", "PPO for top performers", "Free lunch"],
  },
];

// ── Demo student (localStorage-backed progress in the MVP) ──
export const DEMO_USER = {
  name: "Saurabh K.",
  role: "Aspiring Frontend Developer",
  college: "VJTI Mumbai (Tier 2)",
  gradYear: 2027,
  avatar: "🧑‍💻",
  openToWork: true,
};

export function skillById(id: string): Skill {
  return SKILLS.find((s) => s.id === id) ?? { id, name: id, emoji: "📘" };
}

export function roadmapById(id: string): Roadmap | undefined {
  return ROADMAPS.find((r) => r.id === id);
}
