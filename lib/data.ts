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
  { id: "fullstack", name: "Full Stack Development", emoji: "🧩" },
  { id: "devops", name: "DevOps", emoji: "🚀" },
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
  {
    id: "fullstack-dev",
    title: "Full Stack Developer",
    emoji: "🧩",
    tagline: "Build complete web products from accessible interfaces to reliable APIs",
    targetRole: "Full Stack Developer",
    skills: ["fullstack"],
    capstone: "Build and deploy a full-stack application with authentication, persistence, tests, and a responsive interface",
    totalHours: 160,
    stages: [
      {
        id: "fs-foundations",
        name: "Web Foundations",
        topics: [
          { id: "fs-t1", title: "Semantic HTML, accessibility & forms", hours: 18, resource: "MDN: HTML" },
          { id: "fs-t2", title: "CSS layout, responsive design & browser tools", hours: 18, resource: "web.dev: Learn CSS" },
          { id: "fs-t3", title: "JavaScript, TypeScript & Git foundations", hours: 14, resource: "MDN: JavaScript" },
        ],
      },
      {
        id: "fs-product",
        name: "Frontend & Backend",
        topics: [
          { id: "fs-t4", title: "React components, state & data fetching", hours: 22, resource: "React: Learn" },
          { id: "fs-t5", title: "HTTP APIs, Node.js & validation", hours: 22, resource: "Node.js: Learn" },
          { id: "fs-t6", title: "SQL, PostgreSQL & data modeling", hours: 18, resource: "PostgreSQL: Tutorial" },
        ],
      },
      {
        id: "fs-jobready",
        name: "Job-Ready",
        topics: [
          { id: "fs-t7", title: "Authentication, testing & application security", hours: 24, resource: "OWASP: Cheat Sheet Series" },
          { id: "fs-t8", title: "Deployment, observability & portfolio capstone", hours: 24, resource: "Vercel: Documentation" },
        ],
      },
    ],
  },
  {
    id: "python-dev",
    title: "Python Developer",
    emoji: "🐍",
    tagline: "Move from Python fundamentals to tested, production-ready services",
    targetRole: "Python Developer",
    skills: ["python"],
    capstone: "Build a tested Python API backed by PostgreSQL and deploy it with clear operational documentation",
    totalHours: 160,
    stages: [
      {
        id: "py-foundations",
        name: "Python Foundations",
        topics: [
          { id: "py-t1", title: "Python syntax, values & control flow", hours: 18, resource: "Python: Tutorial" },
          { id: "py-t2", title: "Functions, modules & virtual environments", hours: 16, resource: "Python: Tutorial" },
          { id: "py-t3", title: "Collections, files & exceptions", hours: 18, resource: "Python: Library Reference" },
        ],
      },
      {
        id: "py-core",
        name: "Application Development",
        topics: [
          { id: "py-t4", title: "Object-oriented Python & typing", hours: 20, resource: "Python: typing documentation" },
          { id: "py-t5", title: "HTTP APIs with FastAPI", hours: 22, resource: "FastAPI: Tutorial" },
          { id: "py-t6", title: "SQL, PostgreSQL & data access", hours: 18, resource: "PostgreSQL: Tutorial" },
        ],
      },
      {
        id: "py-jobready",
        name: "Job-Ready",
        topics: [
          { id: "py-t7", title: "Testing, packaging & maintainable code", hours: 24, resource: "pytest: Documentation" },
          { id: "py-t8", title: "Concurrency, deployment & interview practice", hours: 24, resource: "Python: asyncio documentation" },
        ],
      },
    ],
  },
  {
    id: "java-dev",
    title: "Java Developer",
    emoji: "☕",
    tagline: "Learn modern Java, build dependable services, and prepare for production",
    targetRole: "Java Developer",
    skills: ["java"],
    capstone: "Create a tested Spring Boot service with persistence, API documentation, and a deployable build",
    totalHours: 168,
    stages: [
      {
        id: "java-foundations",
        name: "Java Foundations",
        topics: [
          { id: "java-t1", title: "Java syntax, types & control flow", hours: 18, resource: "dev.java: Learn Java" },
          { id: "java-t2", title: "Classes, objects & encapsulation", hours: 18, resource: "dev.java: Classes and Objects" },
          { id: "java-t3", title: "Collections, generics & exceptions", hours: 18, resource: "Java SE: Documentation" },
        ],
      },
      {
        id: "java-core",
        name: "Application Development",
        topics: [
          { id: "java-t4", title: "Streams, lambdas & modern Java", hours: 22, resource: "dev.java: Streams" },
          { id: "java-t5", title: "Maven, testing & project structure", hours: 22, resource: "Maven: Getting Started" },
          { id: "java-t6", title: "Spring Boot REST APIs & validation", hours: 22, resource: "Spring Boot: Reference" },
        ],
      },
      {
        id: "java-jobready",
        name: "Job-Ready",
        topics: [
          { id: "java-t7", title: "Persistence, transactions & security", hours: 24, resource: "Spring Data JPA: Reference" },
          { id: "java-t8", title: "JVM operations, deployment & interview practice", hours: 24, resource: "Oracle: Java Platform Documentation" },
        ],
      },
    ],
  },
  {
    id: "devops-engineer",
    title: "DevOps Engineer",
    emoji: "🚀",
    tagline: "Automate delivery and operate secure, observable infrastructure",
    targetRole: "DevOps Engineer",
    skills: ["devops"],
    capstone: "Build a CI/CD pipeline that deploys a containerized service with infrastructure as code and monitoring",
    totalHours: 176,
    stages: [
      {
        id: "ops-foundations",
        name: "Systems Foundations",
        topics: [
          { id: "ops-t1", title: "Linux shell, processes & permissions", hours: 20, resource: "Ubuntu: Command line for beginners" },
          { id: "ops-t2", title: "Networking, DNS, HTTP & TLS", hours: 18, resource: "Cloudflare: Learning Center" },
          { id: "ops-t3", title: "Git workflows, scripting & configuration", hours: 20, resource: "Pro Git: Book" },
        ],
      },
      {
        id: "ops-core",
        name: "Automation & Platforms",
        topics: [
          { id: "ops-t4", title: "Containers with Docker", hours: 22, resource: "Docker: Get Started" },
          { id: "ops-t5", title: "CI/CD pipelines with GitHub Actions", hours: 22, resource: "GitHub Actions: Documentation" },
          { id: "ops-t6", title: "Cloud fundamentals & infrastructure as code", hours: 22, resource: "Terraform: Tutorials" },
        ],
      },
      {
        id: "ops-jobready",
        name: "Job-Ready",
        topics: [
          { id: "ops-t7", title: "Kubernetes, rollout & recovery strategies", hours: 26, resource: "Kubernetes: Tutorials" },
          { id: "ops-t8", title: "Observability, incident response & security", hours: 26, resource: "Prometheus: Overview" },
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
  { id: "fullstack", skillId: "fullstack", durationMin: 60, mcqCount: 15, codeCount: 0, passingScore: 70 },
  { id: "python", skillId: "python", durationMin: 60, mcqCount: 15, codeCount: 0, passingScore: 70 },
  { id: "java", skillId: "java", durationMin: 60, mcqCount: 15, codeCount: 0, passingScore: 70 },
  { id: "devops", skillId: "devops", durationMin: 60, mcqCount: 15, codeCount: 0, passingScore: 70 },
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
