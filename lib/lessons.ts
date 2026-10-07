// ─────────────────────────────────────────────────────────────
// Lessons — curated study material for every roadmap topic.
// SkillBridge writes the lesson (on-site); external links follow
// the same trust policy as trending skills: official docs,
// recognized education platforms, accredited courses only.
// ─────────────────────────────────────────────────────────────

export type LessonResource = {
  title: string;
  url: string;
  source: string;
  /** free | paid — everything curated here is free unless noted */
  paid?: boolean;
};

export type Lesson = {
  /** roadmap topic id, e.g. "fe-t1" */
  topicId: string;
  /** optional page title override (MDX lessons replace the topic name) */
  titleFallback?: string;
  /** 2–4 sentence overview of what this topic is and why it matters */
  overview: string;
  /** the concrete skills/checklist a student should be able to do after studying */
  keyPoints: string[];
  /** hands-on tasks to actually learn it (do, don't just read) */
  practice: string[];
  /** vetted external deep-dives */
  resources: LessonResource[];
  /** common mistakes to avoid (interviewers notice these) */
  pitfalls?: string[];
};

const MDN = "https://developer.mozilla.org";
const WEB_DEV = "https://web.dev";
const REACT_DOCS = "https://react.dev";
const NODE_DOCS = "https://nodejs.org/en/learn";
const PG_TUT = "https://neon.com/postgresql/tutorial";

export const LESSONS: Lesson[] = [
  // ── FRONTEND · Stage 1: Foundations ─────────────────────────
  {
    topicId: "fe-t1",
    overview:
      "HTML is the structure of every web page — and semantic HTML is what separates hobbyist code from professional code. Screen readers, search engines, and browser features all depend on choosing the right element for the right job, not just divs with classes.",
    keyPoints: [
      "Document structure: doctype, head, meta viewport, landmark elements",
      "Semantic elements: header, nav, main, section, article, aside, footer",
      "Accessibility: alt text, label-for-input, heading hierarchy h1→h6",
      "Forms: input types, validation attributes, fieldset/legend",
      "ARIA roles — and when NOT to use them (native elements first)",
    ],
    practice: [
      "Rebuild a news homepage using only semantic elements — zero divs in the body",
      "Run it through axe DevTools and fix every accessibility violation",
      "Build a login form with proper labels, autocomplete attributes, and inline validation",
    ],
    resources: [
      { title: "MDN: HTML basics", url: `${MDN}/en-US/docs/Learn/Getting_started_with_the_web/HTML_basics`, source: "MDN" },
      { title: "MDN: HTML accessibility guide", url: `${MDN}/en-US/docs/Learn/Accessibility/HTML`, source: "MDN" },
      { title: "web.dev: Learn HTML", url: `${WEB_DEV}/learn/html`, source: "Google" },
    ],
    pitfalls: [
      "Skipping the alt attribute on meaningful images",
      "Using headings for font size instead of document structure",
      "Building custom dropdowns where <select> would work",
    ],
  },
  {
    topicId: "fe-t2",
    overview:
      "The box model, flexbox, and grid are the three tools behind every layout on the web. Master these and you can build any design; skip them and you'll fight framework code you don't understand.",
    keyPoints: [
      "Box model: content, padding, border, margin, box-sizing: border-box",
      "Specificity and the cascade — why your CSS 'doesn't work'",
      "Flexbox for 1-D layouts: main axis, cross axis, gap, align-items",
      "Grid for 2-D layouts: template columns/rows, areas, minmax()",
      "Custom properties (variables) and sensible design tokens",
    ],
    practice: [
      "Recreate a 3-column card layout with both flexbox AND grid — feel the difference",
      "Build the classic 'holy grail' layout (header, sidebar, main, footer) without looking it up",
      "Inspect a real website in DevTools and predict which element is which flex/grid child",
    ],
    resources: [
      { title: "web.dev: Learn CSS", url: `${WEB_DEV}/learn/css`, source: "Google" },
      { title: "MDN: CSS layout", url: `${MDN}/en-US/docs/Learn/CSS/CSS_layout`, source: "MDN" },
      { title: "Flexbox Froggy (practice game)", url: "https://flexboxfroggy.com", source: "Education platform" },
      { title: "Grid Garden (practice game)", url: "https://cssgridgarden.com", source: "Education platform" },
    ],
    pitfalls: [
      "Not resetting box-sizing, then wondering why widths overflow",
      "Reaching for !important instead of learning specificity",
      "Absolute-positioning everything instead of using layout systems",
    ],
  },
  {
    topicId: "fe-t3",
    overview:
      "More than half of all web traffic is mobile. Responsive design means one codebase that works from a 360px phone to a 4K monitor — using fluid sizing and media queries, not separate mobile sites.",
    keyPoints: [
      "Mobile-first CSS: base styles for small screens, min-width queries upward",
      "Relative units: rem, em, %, vh/vw — and when px is fine",
      "Fluid images and videos (max-width: 100%)",
      "Media queries for layout breakpoints; prefers-reduced-motion",
      "Testing with DevTools device emulation — and real devices",
    ],
    practice: [
      "Take your Stage-1 news homepage and make it perfect at 360px, 768px, and 1440px",
      "Build a responsive navigation that collapses into a hamburger below 768px",
      "Test with prefers-reduced-motion emulation and add appropriate fallbacks",
    ],
    resources: [
      { title: "web.dev: Responsive design", url: `${WEB_DEV}/learn/design`, source: "Google" },
      { title: "MDN: Mobile-first design", url: "https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Responsive/Mobile_first", source: "MDN" },
    ],
    pitfalls: [
      "Designing on a 1920px monitor and never testing below 1024px",
      "Fixed heights that clip text when font size changes",
      "Touch targets smaller than 44×44px",
    ],
  },
  {
    topicId: "fe-t4",
    overview:
      "Git is version control: the non-negotiable tool of every software team. GitHub is where that work becomes visible to recruiters — your commit history is part of your portfolio.",
    keyPoints: [
      "init, clone, status, add, commit, push, pull — the daily loop",
      "Branches and merging; resolving a merge conflict calmly",
      "Pull requests and code review etiquette",
      "Writing commit messages that explain WHY, not WHAT",
      ".gitignore basics — never commit node_modules or secrets",
    ],
    practice: [
      "Put your roadmap projects on GitHub — one repo per project, clean history",
      "Create a branch, make changes, open a PR into main, then merge it",
      "Deliberately create a merge conflict and resolve it",
    ],
    resources: [
      { title: "Pro Git book, ch. 1–3", url: "https://git-scm.com/book/en/v2", source: "Official docs" },
      { title: "GitHub Skills courses", url: "https://skills.github.com", source: "GitHub" },
    ],
    pitfalls: [
      "Commit messages like 'update' or 'fix stuff'",
      "One giant commit at the end of a week of work",
      "Committing API keys (they stay in history forever)",
    ],
  },

  // ── FRONTEND · Stage 2: Core JavaScript ─────────────────────
  {
    topicId: "fe-t5",
    overview:
      "JavaScript fundamentals power everything else on this roadmap. Variables and types seem simple; the edge cases (coercion, hoisting, closures) are exactly what interviewers test.",
    keyPoints: [
      "let/const vs var; scope and the temporal dead zone",
      "Primitives vs reference types; deep vs shallow copy",
      "Functions: expressions, arrow functions, this, closures",
      "Array methods that matter daily: map, filter, reduce, find, some",
      "Template literals, destructuring, spread/rest",
    ],
    practice: [
      "Solve 20 array-method katas on freeCodeCamp or Exercism",
      "Write a function that returns a closure-based counter — explain it out loud",
      "Predict the output of 10 coercion expressions, then verify in the console",
    ],
    resources: [
      { title: "MDN: JavaScript guide", url: `${MDN}/en-US/docs/Web/JavaScript/Guide`, source: "MDN" },
      { title: "javascript.info (The Modern JS Tutorial)", url: "https://javascript.info", source: "Education platform" },
      { title: "freeCodeCamp: JS Algorithms & DS", url: "https://www.freecodecamp.org/learn", source: "Education platform" },
    ],
    pitfalls: [
      "Memorizing output tricks without understanding why",
      "Using == instead of === (then forgetting coercion rules)",
      "Copy-pasting from ChatGPT without tracing execution yourself",
    ],
  },
  {
    topicId: "fe-t6",
    overview:
      "The DOM is the live object model of the page. Frameworks abstract it, but every React error you'll ever debug makes more sense when you understand what the framework is doing underneath.",
    keyPoints: [
      "querySelector/querySelectorAll; traversing parent/children",
      "Creating, appending, removing elements",
      "Event listeners, event object, delegation on containers",
      "Class lists and data attributes for state styling",
      "Forms: reading values, submit handling, basic validation UX",
    ],
    practice: [
      "Build a todo list in vanilla JS — no frameworks allowed",
      "Add filtering (all/active/done) using event delegation, not per-item listeners",
      "Build a modal from scratch: open, close, Escape key, click-outside",
    ],
    resources: [
      { title: "MDN: Introduction to events", url: `${MDN}/en-US/docs/Learn/JavaScript/Building_blocks/Events`, source: "MDN" },
      { title: "javascript.info: Document", url: "https://javascript.info/document", source: "Education platform" },
    ],
    pitfalls: [
      "Attaching 100 listeners instead of 1 delegated listener",
      " innerHTML with user input (XSS risk) instead of textContent",
      "Forgetting that querySelectorAll returns a static NodeList",
    ],
  },
  {
    topicId: "fe-t7",
    overview:
      "JavaScript is single-threaded, so all waiting (network, timers, files) happens asynchronously. Promises and async/await are how modern code stays readable while doing many things at once.",
    keyPoints: [
      "Event loop, call stack, and microtasks — mental model, not memorization",
      "Promises: states, chaining, error propagation",
      "async/await syntax; try/catch for rejections",
      "fetch API: status checks, JSON parsing, timeouts, AbortController",
      "Promise.all / allSettled / race — which one and why",
    ],
    practice: [
      "Fetch data from a public API (e.g. GitHub users) and render a list with loading and error states",
      "Convert a callback-style function to Promise-based, then to async/await",
      "Run 3 fetches in parallel with Promise.all and handle a single failure with allSettled",
    ],
    resources: [
      { title: "MDN: Async JavaScript", url: `${MDN}/en-US/docs/Learn/JavaScript/Asynchronous`, source: "MDN" },
      { title: "javascript.info: Promises, async/await", url: "https://javascript.info/async", source: "Education platform" },
      { title: "MDN: Fetch API", url: `${MDN}/en-US/docs/Web/API/Fetch_API`, source: "MDN" },
    ],
    pitfalls: [
      "Calling .then without handling errors (unhandled rejection)",
      "await inside loops where Promise.all was intended",
      "Checking response.ok after fetch — many forget it",
    ],
  },
  {
    topicId: "fe-t8",
    overview:
      "ES6+ turned JavaScript from a scripting language into an engineering language. Modules, classes, and modern syntax are table stakes in every professional codebase.",
    keyPoints: [
      "ES modules: import/export, default vs named, bundler resolution",
      "Classes, getters, static methods — and when plain objects are better",
      "Optional chaining (?.) and nullish coalescing (??)",
      "Generators and iterators — enough to read library code",
      "Map/Set/WeakMap vs plain objects",
    ],
    practice: [
      "Refactor a Stage-2 project into ES modules with clean named exports",
      "Rewrite a nested-property access chain with optional chaining",
      "Use a Map to count word frequency in a paragraph",
    ],
    resources: [
      { title: "javascript.info: Modules", url: "https://javascript.info/modules", source: "Education platform" },
      { title: "MDN: JavaScript reference (ES6+)", url: `${MDN}/en-US/docs/Web/JavaScript/Reference`, source: "MDN" },
    ],
  },

  // ── FRONTEND · Stage 3: React ───────────────────────────────
  {
    topicId: "fe-t9",
    overview:
      "React is a UI library built on one idea: UI is a function of state. Components, props, and state are the vocabulary you'll use every day for the rest of your career.",
    keyPoints: [
      "Components as functions; JSX rules and compilation",
      "Props flow down; children composition",
      "useState: immutable updates, batching, functional updates",
      "Lists and keys — why index keys bite",
      "Controlled components (inputs bound to state)",
    ],
    practice: [
      "Rebuild your vanilla-JS todo list in React — compare the code",
      "Build a search-filterable product grid from a static array",
      "Break a list deliberately by using index as key with reordering — observe why",
    ],
    resources: [
      { title: "React docs: Describing the UI", url: `${REACT_DOCS}/learn/describing-the-ui`, source: "Official docs" },
      { title: "React docs: Managing state", url: `${REACT_DOCS}/learn/managing-state`, source: "Official docs" },
    ],
    pitfalls: [
      "Mutating state arrays/objects instead of replacing them",
      "Prop drilling 4 levels when lifting state would do",
      "Defining components inside other components",
    ],
  },
  {
    topicId: "fe-t10",
    overview:
      "Effects connect React to the outside world — network, timers, subscriptions. Used well they're invisible; used badly they cause infinite loops and stale-data bugs that junior devs can't debug.",
    keyPoints: [
      "useEffect anatomy: dependencies, cleanup, and the render-commit-effect flow",
      "When NOT to use an effect (derived state, event handlers)",
      "useMemo/useCallback: memoization only where measured",
      "Custom hooks: extracting reusable logic (useFetch, useLocalStorage)",
      "Concurrent-safe patterns: AbortController in effects",
    ],
    practice: [
      "Write a useFetch hook with loading, error, data, and abort-on-unmount",
      "Refactor a component that derives filtered state with useEffect into plain derivation",
      "Build a custom useLocalStorage hook and use it in the todo app",
    ],
    resources: [
      { title: "React docs: Synchronizing with effects", url: `${REACT_DOCS}/learn/synchronizing-with-effects`, source: "Official docs" },
      { title: "React docs: You Might Not Need an Effect", url: `${REACT_DOCS}/learn/you-might-not-need-an-effect`, source: "Official docs" },
      { title: "React docs: Reuse logic with custom hooks", url: `${REACT_DOCS}/learn/reusing-logic-with-custom-hooks`, source: "Official docs" },
    ],
    pitfalls: [
      "Missing dependency arrays → runs every render",
      "Deleting deps to silence the linter → stale closure bugs",
      "Effects that set state derived from other state (render loops)",
    ],
  },
  {
    topicId: "fe-t11",
    overview:
      "Real apps are many pages sharing one shell. Routing, URL state, and data-fetching patterns (where does loading live? who refetches?) define an app's architecture.",
    keyPoints: [
      "Routes, nested layouts, dynamic segments, 404 handling",
      "URL as state: search params, deep links, back button",
      "Data fetching patterns: fetch-on-render vs fetch-then-render",
      "Loading and error states as first-class UI",
      "Navigation: Link vs programmatic, scroll restoration",
    ],
    practice: [
      "Add routing to your React app: list page, detail page, and a 404",
      "Move filter state into URL search params so filters survive refresh",
      "Implement a detail page that shows skeletons while loading",
    ],
    resources: [
      { title: "React Router docs (official tutorial)", url: "https://reactrouter.com/home", source: "Official docs" },
      { title: "TanStack Query docs", url: "https://tanstack.com/query/latest", source: "Official docs" },
    ],
    pitfalls: [
      "No loading or error UI on data pages",
      "Losing scroll position or back-button behavior",
      "Duplicating server state in local state and letting them drift",
    ],
  },
  {
    topicId: "fe-t12",
    overview:
      "As apps grow, prop drilling hurts and server-cache state needs tools. The professional rule: server state (TanStack Query), global client state (Context or Zustand), local state (useState).",
    keyPoints: [
      "Context API: create, provide, consume; re-render costs",
      "Zustand (or similar): stores, selectors, minimal boilerplate",
      "Splitting state: server cache vs UI state vs form state",
      "Avoiding context waterfalls and unnecessary provider nesting",
    ],
    practice: [
      "Extract a theme/auth context in your app; measure re-renders with React DevTools Profiler",
      "Replace one prop-drilled value with a Zustand store + selector",
      "Write a one-paragraph 'state inventory' of your app: what lives where and why",
    ],
    resources: [
      { title: "React docs: Scaling up with context", url: `${REACT_DOCS}/learn/scaling-up-with-reducer-and-context`, source: "Official docs" },
      { title: "Zustand docs (GitHub)", url: "https://github.com/pmndrs/zustand", source: "Official docs" },
    ],
    pitfalls: [
      "One giant global store holding everything",
      "Context value recreated every render (consumers all re-render)",
      "Using a state library instead of fixing component structure",
    ],
  },

  // ── FRONTEND · Stage 4: Job-Ready ───────────────────────────
  {
    topicId: "fe-t13",
    overview:
      "Performance is a feature recruiters can feel. Lighthouse scores, loading behavior, and perceived speed are portfolio differentiators you can quantify in interviews.",
    keyPoints: [
      "Core Web Vitals: LCP, INP, CLS — what each measures",
      "Code-splitting and lazy loading routes/images",
      "Image optimization: formats, sizes, lazy attribute",
      "Profiling with React DevTools; memoization where measured",
      "Measuring with Lighthouse — before/after, not vibes",
    ],
    practice: [
      "Run Lighthouse on your portfolio; fix the top 3 issues; re-run and record the delta",
      "Lazy-load the heaviest component and measure the bundle change",
      "Add proper width/height to images and watch CLS drop to 0",
    ],
    resources: [
      { title: "web.dev: Learn Performance", url: `${WEB_DEV}/learn/performance`, source: "Google" },
      { title: "web.dev: Core Web Vitals", url: `${WEB_DEV}/vitals`, source: "Google" },
    ],
  },
  {
    topicId: "fe-t14",
    overview:
      "A deployed portfolio turns your code into proof. Recruiters click links, not repos — every roadmap project should live at a URL with a README that sells the work.",
    keyPoints: [
      "Deploying to Vercel/Netlify from a Git repo (env vars, build logs)",
      "Custom domains and HTTPS basics",
      "README structure: problem, demo link, screenshots, stack, setup",
      "Production build hygiene: no console.logs, error-free console",
    ],
    practice: [
      "Deploy your best project; buy or use a free subdomain; share the link",
      "Write the README with screenshots and a live-demo link",
      "Ask one senior dev for feedback on the portfolio and ship one improvement",
    ],
    resources: [
      { title: "Vercel documentation", url: "https://vercel.com/docs", source: "Official docs" },
      { title: "GitHub Pages docs", url: "https://docs.github.com/en/pages", source: "GitHub" },
    ],
  },
  {
    topicId: "fe-t15",
    overview:
      "Frontend interviews test JavaScript depth, React reasoning, and UI problem solving under pressure. Structured practice beats cramming — 2 weeks of daily drills, not 2 nights of panic.",
    keyPoints: [
      "Core JS rapid-fire: closures, this, prototypes, event loop",
      "React whiteboard: controlled vs uncontrolled, keys, effects",
      "Build-a-widget exercises (tabs, autocomplete, modal) in 30 minutes",
      "Talking out loud while coding — the actual skill being tested",
    ],
    practice: [
      "Answer 5 questions/day out loud from a question bank for 2 weeks",
      "Do 5 timed build-a-widget exercises; record yourself; review",
      "Mock interview with a peer — alternate interviewer/candidate",
    ],
    resources: [
      { title: "GreatFrontEnd (free tier: practice questions)", url: "https://www.greatfrontend.com", source: "Education platform" },
      { title: "freeCodeCamp: Front End Development Libraries", url: "https://www.freecodecamp.org/learn", source: "Education platform" },
    ],
  },

  // ── BACKEND · Stage 1: Foundations ──────────────────────────
  {
    topicId: "be-t1",
    overview:
      "Every API you build rides on the web's core protocol. Understanding HTTP, DNS, and REST semantics is what separates developers who configure frameworks from engineers who debug them.",
    keyPoints: [
      "Request/response lifecycle: DNS, TCP/TLS, HTTP parsing",
      "Methods and semantics: GET/POST/PUT/PATCH/DELETE, idempotency",
      "Status codes that matter: 200/201/204, 301/302, 400/401/403/404, 500/502/503",
      "Headers: Content-Type, Accept, Authorization, Cache-Control, CORS",
      "REST resource design: nouns not verbs, nesting, pagination",
    ],
    practice: [
      "Use curl to hit a public API: set headers, read status codes, follow redirects",
      "Read the SkillBridge /api/applications route and map each response to a status code",
      "Design the resource layout (URIs + methods) for a library system — books, members, loans",
    ],
    resources: [
      { title: "MDN: How the web works", url: `${MDN}/en-US/docs/Learn/Getting_started_with_the_web/How_the_Web_works`, source: "MDN" },
      { title: "MDN: HTTP overview", url: `${MDN}/en-US/docs/Web/HTTP/Guides/Overview`, source: "MDN" },
      { title: "HTTP status codes (MDN reference)", url: `${MDN}/en-US/docs/Web/HTTP/Status`, source: "MDN" },
    ],
    pitfalls: [
      "200 OK for errors with {success: false} bodies",
      "Verbs in URLs (POST /getUsers) instead of resource design",
      "Ignoring CORS until it breaks the frontend integration",
    ],
  },
  {
    topicId: "be-t2",
    overview:
      "Backend JavaScript has different priorities than frontend: streams, buffers, error handling, and module systems matter more than DOM tricks. Solidify the core before touching frameworks.",
    keyPoints: [
      "ES modules in Node; package.json scripts and type: module",
      "Async patterns: promises, async/await, Promise.all in server code",
      "Error handling: Error objects, custom error classes, fail-fast validation",
      "File/data encoding: JSON, buffers, streams basics",
      "Environment variables and configuration (never hardcode secrets)",
    ],
    practice: [
      "Write a CLI script that fetches, filters, and writes JSON data to disk",
      "Build a small module with clean exports, then consume it from another file",
      "Refactor callback-style code into async/await with proper try/catch",
    ],
    resources: [
      { title: "Node.js learn guides", url: NODE_DOCS, source: "Official docs" },
      { title: "javascript.info: advanced JS", url: "https://javascript.info", source: "Education platform" },
    ],
  },
  {
    topicId: "be-t3",
    overview:
      "Teams live in branches and pull requests. Professional Git workflow — feature branches, clean history, reviewed merges — is a hiring signal in itself.",
    keyPoints: [
      "Feature-branch workflow: branch → commit → push → PR → review → merge",
      "Interactive rebase and squash for readable history",
      "Resolving conflicts with intent (keep theirs, mine, or both)",
      "Tags and semantic versioning for releases",
      "CI basics: what a GitHub Actions check means in a PR",
    ],
    practice: [
      "Contribute one real PR to an open-source repo (docs fixes count!)",
      "Squash a messy 7-commit feature branch into 3 clean commits",
      "Set up a GitHub Actions workflow that runs a script on every PR",
    ],
    resources: [
      { title: "Pro Git book, ch. 3–7", url: "https://git-scm.com/book/en/v2", source: "Official docs" },
      { title: "GitHub Actions docs", url: "https://docs.github.com/en/actions", source: "GitHub" },
    ],
  },

  // ── BACKEND · Stage 2: Node & Databases ─────────────────────
  {
    topicId: "be-t4",
    overview:
      "Node.js is JavaScript outside the browser: non-blocking I/O for high-concurrency servers. Knowing the runtime — event loop, streams, npm internals — makes framework code predictable.",
    keyPoints: [
      "Event loop phases; libuv thread pool; when Node blocks",
      "npm/lockfiles/semver; scripts; npx; workspaces basics",
      "Core modules: fs, path, http, crypto, stream",
      "Process management: env vars, signals, graceful shutdown",
      "Debugging: node --inspect, Chrome DevTools, breakpoints",
    ],
    practice: [
      "Build an HTTP server with the built-in http module — no Express — serving JSON",
      "Write a script that streams a large file and reports progress",
      "Profile a busy endpoint with --inspect and find the bottleneck",
    ],
    resources: [
      { title: "Node.js official learn guides", url: NODE_DOCS, source: "Official docs" },
      { title: "Node.js API reference", url: "https://nodejs.org/docs/latest/api/", source: "Official docs" },
    ],
  },
  {
    topicId: "be-t5",
    overview:
      "Express is the minimal backend framework most of the industry runs on. Routing, middleware, and error handling are its whole vocabulary — master them and every other framework feels familiar.",
    keyPoints: [
      "Routers, route params, query strings; organizing routes by resource",
      "Middleware order and composition; writing your own",
      "Body parsing, validation (zod/joi), and honest 400s",
      "Central error-handling middleware; async error catching",
      "Project structure that scales beyond one file",
    ],
    practice: [
      "Build a CRUD API for notes with validation and proper status codes",
      "Write a request-logging middleware and a 404 handler",
      "Add a centralized error handler that maps domain errors to HTTP codes",
    ],
    resources: [
      { title: "Express official guide", url: "https://expressjs.com/en/guide/routing.html", source: "Official docs" },
      { title: "Express: writing middleware", url: "https://expressjs.com/en/guide/writing-middleware.html", source: "Official docs" },
    ],
    pitfalls: [
      "try/catch-less async routes that crash the process",
      "Business logic inside route handlers (no separation)",
      "Returning HTML error pages from a JSON API",
    ],
  },
  {
    topicId: "be-t6",
    overview:
      "SQL is the most durable skill on this roadmap — databases outlive frameworks. Joins, indexes, and transactions are the difference between a demo and a system that survives real users.",
    keyPoints: [
      "SELECT/WHERE/ORDER/LIMIT; aggregates and GROUP BY/HAVING",
      "JOINs: inner/left/right; join thinking with small datasets",
      "Indexes: what they speed up, what they cost",
      "Transactions and ACID; isolation basics",
      "Schema design: 3rd normal form, foreign keys, when to denormalize",
    ],
    practice: [
      "Solve 25 SQL problems on SQLBolt then SQLZoo (joins onward)",
      "Design a blog schema (users, posts, comments, tags) with constraints",
      "Write a query that needs an index; prove the speedup with EXPLAIN",
    ],
    resources: [
      { title: "Postgres tutorial (Neon)", url: PG_TUT, source: "Neon" },
      { title: "SQLBolt (interactive)", url: "https://sqlbolt.com", source: "Education platform" },
      { title: "PostgreSQL official docs: tutorial", url: "https://www.postgresql.org/docs/current/tutorial.html", source: "Official docs" },
    ],
    pitfalls: [
      "N+1 query patterns in app code",
      "Indexes on low-cardinality columns that never get used",
      "String concatenation for queries (SQL injection)",
    ],
  },
  {
    topicId: "be-t7",
    overview:
      "ORMs give type-safe, composable queries — but only if you understand the SQL they generate. Schema design is where juniors can contribute real value early.",
    keyPoints: [
      "Prisma (or Drizzle): schema file, migrations, client generation",
      "Relations: one-to-many, many-to-many; include/select patterns",
      "N+1 prevention: eager loading, joins",
      "Migration discipline: small, reversible, reviewed",
      "When raw SQL beats the ORM",
    ],
    practice: [
      "Model the blog schema from Stage-2 in Prisma; generate and run migrations",
      "Write a query that would be N+1, then fix it with include/join",
      "Add a column without downtime (nullable first, backfill, then constrain)",
    ],
    resources: [
      { title: "Prisma docs: getting started", url: "https://www.prisma.io/docs/getting-started", source: "Official docs" },
      { title: "Prisma docs: relations", url: "https://www.prisma.io/docs/orm/prisma-schema/data-model/relations", source: "Official docs" },
    ],
  },

  // ── BACKEND · Stage 3: Production Skills ────────────────────
  {
    topicId: "be-t8",
    overview:
      "Authentication is where security mistakes live. Password hashing, session tokens, and cookie flags are not optional details — they're the interview questions that separate seniors from juniors.",
    keyPoints: [
      "Password storage: scrypt/bcrypt/argon2 with per-user salt (never plain SHA)",
      "Session cookies vs JWT: tradeoffs, revocation, storage",
      "httpOnly/secure/sameSite cookie flags and what each prevents",
      "CSRF and XSS — what they are, which flags mitigate",
      "Login rate limiting and enumeration-safe error messages",
    ],
    practice: [
      "Read SkillBridge's lib/auth.ts: find the scrypt hashing and HMAC cookie signing",
      "Break a (local) test app by removing httpOnly — then explain the attack vector",
      "Add login rate limiting to a practice API: 5 fails → 15-minute lockout",
    ],
    resources: [
      { title: "MDN: HTTP authentication", url: `${MDN}/en-US/docs/Web/HTTP/Guides/Authentication`, source: "MDN" },
      { title: "OWASP Top 10", url: "https://top10.owasp.org", source: "Standards body" },
      { title: "MDN: Using HTTP cookies", url: `${MDN}/en-US/docs/Web/HTTP/Guides/Cookies`, source: "MDN" },
    ],
    pitfalls: [
      "Storing tokens in localStorage (XSS) instead of httpOnly cookies",
      "Generic 'invalid credentials' logic leaking whether an email exists",
      "JWTs that can't be revoked + no expiry",
    ],
  },
  {
    topicId: "be-t9",
    overview:
      "Tests are how you change code without fear. Unit tests catch logic bugs; integration tests catch wiring bugs; both are expected in professional repos.",
    keyPoints: [
      "Test anatomy: arrange, act, assert; one behavior per test",
      "Vitest (or Jest): matchers, setup/teardown, mocking",
      "Unit vs integration vs e2e — and the testing trophy shape",
      "Testing HTTP APIs: supertest-style requests against the app",
      "What to test: boundaries and branches, not getters/setters",
    ],
    practice: [
      "Write 10 unit tests for a validation module (edge cases included)",
      "Write integration tests for a CRUD API: create → read → update → delete",
      "Add a test script to CI and break the build on failure",
    ],
    resources: [
      { title: "Vitest documentation", url: "https://vitest.dev/guide/", source: "Official docs" },
      { title: "Testing JavaScript (free articles)", url: "https://testingjavascript.com", source: "Education platform" },
    ],
  },
  {
    topicId: "be-t10",
    overview:
      "Speed and scale come from not doing work twice. Caching and queues are the two tools every backend engineer reaches for when the database becomes the bottleneck.",
    keyPoints: [
      "Cache strategies: cache-aside, TTLs, invalidation (the hard part)",
      "Redis: data structures, key expiry, common patterns",
      "Rate limiting with fixed and sliding windows",
      "Queues: why slow work moves out of the request cycle",
      "Idempotency and retries in job processing",
    ],
    practice: [
      "Add Redis (or in-memory) caching to one slow endpoint; measure before/after",
      "Implement a rate limiter middleware with a fixed-window counter",
      "Move email sending out of a request handler into a queue job",
    ],
    resources: [
      { title: "Redis documentation", url: "https://redis.io/docs/latest/", source: "Official docs" },
      { title: "BullMQ (Node queues) docs", url: "https://docs.bullmq.io/", source: "Official docs" },
    ],
  },

  // ── BACKEND · Stage 4: Job-Ready ────────────────────────────
  {
    topicId: "be-t11",
    overview:
      "DSA interviews are a filter, not the job — but the filter is real. 30 focused hours on patterns beats 300 scattered hours on random problems.",
    keyPoints: [
      "Arrays & hashing: two pointers, prefix sums, frequency maps",
      "Stacks/queues; sliding window; binary search on answer",
      "Trees: BFS/DFS, recursion patterns; basic graphs",
      "Big-O reasoning: time AND space, out loud",
      "The UMPIRE-style method: clarify → examples → brute force → optimize → code → test",
    ],
    practice: [
      "Solve the NeetCode 150 easy+medium sets by pattern, not by count",
      "For each problem: brute force first, then optimize, then explain tradeoffs",
      "Do 10 timed mock problems; focus on narration, not just passing tests",
    ],
    resources: [
      { title: "NeetCode practice roadmap", url: "https://neetcode.io/roadmap", source: "Education platform" },
      { title: "freeCodeCamp: JS Algorithms & Data Structures", url: "https://www.freecodecamp.org/learn", source: "Education platform" },
    ],
  },
  {
    topicId: "be-t12",
    overview:
      "System design interviews test judgment at scale. Juniors aren't expected to design Google — they're expected to reason clearly about load, storage, and failure.",
    keyPoints: [
      "Load balancing: L4 vs L7, health checks, stateless services",
      "Vertical vs horizontal scaling; statelessness as enabler",
      "Database scaling: replicas, indexes, caching layers",
      "CAP tradeoffs in plain language; eventual consistency examples",
      "Back-of-envelope math: QPS × payload → bandwidth/storage",
    ],
    practice: [
      "Design a URL shortener: API, schema, caching, estimated storage for 1B URLs",
      "Design SkillBridge itself: services, data stores, bottleneck at 100k users",
      "Practice 2 designs with a peer; timebox to 30 minutes each",
    ],
    resources: [
      { title: "System Design Primer (GitHub)", url: "https://github.com/donnemartin/system-design-primer", source: "Education platform" },
      { title: "AWS well-architected framework", url: "https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html", source: "Official docs" },
    ],
  },

  // ── DATA ANALYST · Stage 1: Foundations ─────────────────────
  {
    topicId: "da-t1",
    overview:
      "Spreadsheets remain the most-used analytics tool on earth. Formula fluency and pivot-table intuition transfer directly to SQL and BI tools later.",
    keyPoints: [
      "Cell references (relative vs absolute $), named ranges",
      "Lookup family: XLOOKUP/VLOOKUP/INDEX-MATCH",
      "Aggregations: SUMIFS/COUNTIFS/AVERAGEIFS",
      "Pivot tables: grouping, filters, calculated fields",
      "Chart selection: bar vs line vs scatter — and why",
    ],
    practice: [
      "Rebuild a sales summary with SUMIFS per region per month",
      "Take a raw export, build 3 pivot tables answering 3 business questions",
      "Clean a messy column (dates as text, mixed formats) with formulas only",
    ],
    resources: [
      { title: "Google Sheets function list", url: "https://support.google.com/docs/table/25273", source: "Google" },
      { title: "Microsoft Excel training", url: "https://support.microsoft.com/en-us/excel", source: "Official docs" },
    ],
  },
  {
    topicId: "da-t2",
    overview:
      "Statistics is how analysts avoid lying to themselves. Descriptive stats, distributions, and the anatomy of A/B tests are the daily toolkit.",
    keyPoints: [
      "Mean/median/mode — and when the median tells the truth",
      "Variance and standard deviation as spread intuition",
      "Distributions: normal, skewed; percentiles in reporting",
      "Correlation vs causation with real examples",
      "A/B test anatomy: hypothesis, sample size, significance, pitfalls",
    ],
    practice: [
      "Take any public dataset: compute mean/median/stddev; plot the histogram",
      "Find one news chart that misleads (truncated axis) and explain the distortion",
      "Critique a real A/B test writeup: what's missing?",
    ],
    resources: [
      { title: "Khan Academy: Statistics & probability", url: "https://www.khanacademy.org/math/statistics-probability", source: "Education platform" },
      { title: "Seeing Theory (visual probability)", url: "https://seeing-theory.brown.edu", source: "Brown University" },
    ],
  },
  {
    topicId: "da-t3",
    overview:
      "SQL is the analyst's superpower. From zero to confident joins in one focused week — then a lifetime of returns.",
    keyPoints: [
      "SELECT/FILTER/ORDER/LIMIT; NULL handling (IS NULL, COALESCE)",
      "GROUP BY + aggregates; HAVING vs WHERE",
      "INNER/LEFT joins and join-thinking; self-joins",
      "Subqueries vs CTEs for readability",
      "Window functions intro: ROW_NUMBER, running totals",
    ],
    practice: [
      "Complete SQLBolt lessons 1–12, then SQLZoo joins section",
      "Write the 'top 3 products per region' query (window function)",
      "Convert one of your pivot tables into pure SQL",
    ],
    resources: [
      { title: "Postgres tutorial (Neon)", url: PG_TUT, source: "Neon" },
      { title: "SQLBolt", url: "https://sqlbolt.com", source: "Education platform" },
      { title: "Mode SQL tutorial", url: "https://mode.com/sql-tutorial/", source: "Education platform" },
    ],
  },

  // ── DATA ANALYST · Stage 2: Python for Data ─────────────────
  {
    topicId: "da-t4",
    overview:
      "Python is the analyst's automation layer. Notebooks are for exploration; scripts are for repeatable work — knowing when to use which is professionalism.",
    keyPoints: [
      "Core syntax: lists/dicts, comprehensions, functions",
      "Jupyter/Colab workflow: cells, kernels, reproducibility",
      "Reading files: CSV/Excel/JSON with stdlib and pandas",
      "Environment hygiene: virtualenvs, requirements.txt",
      "From notebook to script: parameterizing and saving pipelines",
    ],
    practice: [
      "Load a CSV in Colab; produce 5 summary statistics and 2 charts",
      "Refactor a notebook into a script that takes a file path argument",
      "Automate one weekly spreadsheet chore with Python",
    ],
    resources: [
      { title: "Python official tutorial", url: "https://docs.python.org/3/tutorial/", source: "Official docs" },
      { title: "Kaggle: Intro to programming (free course)", url: "https://www.kaggle.com/learn/intro-to-programming", source: "Education platform" },
      { title: "Google Colab docs", url: "https://colab.research.google.com", source: "Google" },
    ],
  },
  {
    topicId: "da-t5",
    overview:
      "pandas is where analysts spend 80% of real project time: cleaning messy exports and reshaping them into answers.",
    keyPoints: [
      "Series/DataFrame anatomy; dtypes; loc vs iloc",
      "Missing data: isna, fillna, dropna — and the judgment calls",
      "groupby aggregations; pivot_table; melt for reshaping",
      "Merging: concat/merge/join; validating join keys",
      "String and datetime accessors (str, dt) for real-world messes",
    ],
    practice: [
      "Take a messy public dataset; document 5 quality issues; fix them in pandas",
      "Reproduce a SQL groupby query as a pandas groupby — compare outputs",
      "Build a repeatable cleaning function: raw DataFrame in, analysis-ready out",
    ],
    resources: [
      { title: "pandas official getting started", url: "https://pandas.pydata.org/docs/getting_started/index.html", source: "Official docs" },
      { title: "Kaggle: Pandas course", url: "https://www.kaggle.com/learn/pandas", source: "Education platform" },
    ],
  },
  {
    topicId: "da-t6",
    overview:
      "Charts are arguments. Choosing the right encoding — and removing everything else — is how analysis persuades.",
    keyPoints: [
      "Encoding choices: position > length > angle > color (ranked)",
      "matplotlib anatomy: figure, axes, labels, titles",
      "seaborn for statistical plots: distributions, heatmaps, categories",
      "Chart junk: what to delete before presenting",
      "Accessibility: colorblind-safe palettes, direct labeling",
    ],
    practice: [
      "Visualize one variable 3 ways; pick the best and defend it in 2 sentences",
      "Recreate a 'broken' chart (pie with 12 slices) as a clear bar chart",
      "Build a small-multiples grid comparing 4 segments",
    ],
    resources: [
      { title: "matplotlib tutorials", url: "https://matplotlib.org/stable/tutorials/index.html", source: "Official docs" },
      { title: "seaborn tutorial", url: "https://seaborn.pydata.org/tutorial.html", source: "Official docs" },
    ],
  },

  // ── DATA ANALYST · Stage 3: Job-Ready ───────────────────────
  {
    topicId: "da-t7",
    overview:
      "Dashboards are analysis that outlives you: a manager should get Monday-morning answers without pinging you.",
    keyPoints: [
      "Data modeling for BI: star schema thinking, dimensions vs facts",
      "Filters/slicers that map to real business questions",
      "Looker Studio (free) or Power BI: connecting data, building visuals",
      "Dashboard design: 1 screen, 1 message per visual, top-left priority",
      "Refresh strategy: who updates the data, how often, alerts on failure",
    ],
    practice: [
      "Build a one-page sales dashboard in Looker Studio from a clean dataset",
      "Add a drilldown: region → category → product",
      "Present it to a friend: if they ask 'so what?' you've failed the design",
    ],
    resources: [
      { title: "Looker Studio help", url: "https://support.google.com/looker-studio", source: "Google" },
      { title: "Microsoft Power BI documentation", url: "https://learn.microsoft.com/en-us/power-bi/", source: "Official docs" },
    ],
  },
  {
    topicId: "da-t8",
    overview:
      "Analyst interviews test SQL live, product sense, and case reasoning. Practice out loud — the narration IS the interview.",
    keyPoints: [
      "Live SQL: joins, windows, and cleaning questions on a whiteboard editor",
      "Metric definitions: activation, retention, churn — ask before assuming",
      "Case framing: clarify → hypothesize → analyze → recommend",
      "Portfolio storytelling: 3-minute project walkthroughs",
    ],
    practice: [
      "Solve 15 hard SQL questions from StrataScratch/Mode under 10 minutes each",
      "Do 3 product-analytics cases with a peer; timebox 20 minutes",
      "Record your portfolio walkthrough; cut it to 3 minutes",
    ],
    resources: [
      { title: "Mode SQL tutorial (advanced)", url: "https://mode.com/sql-tutorial/", source: "Education platform" },
      { title: "StrataScratch (free tier questions)", url: "https://www.stratascratch.com", source: "Education platform" },
    ],
  },

  // ── QA · Stage 1: Foundations ───────────────────────────────
  {
    topicId: "qa-t1",
    overview:
      "QA is engineering discipline applied to quality: understanding how software is built (SDLC) and how bugs flow (lifecycle) makes your testing systematic instead of random clicking.",
    keyPoints: [
      "SDLC models and where testing fits in each",
      "Bug lifecycle: new → triaged → fixed → verified → closed (and reopen loops)",
      "Test case anatomy: preconditions, steps, expected result, priority",
      "Severity vs priority — the classic interview question",
      "Reproduction steps as engineering writing",
    ],
    practice: [
      "Write 10 test cases for a login feature (happy path + boundaries + security)",
      "Find a real bug in any open website; file a professional bug report with steps/screenshots",
      "Classify 10 sample bugs by severity and priority; argue your choices",
    ],
    resources: [
      { title: "ISTQB foundation syllabus (free PDF)", url: "https://www.istqb.org/certifications/certified-tester-foundation-level", source: "Standards body" },
      { title: "Ministry of Testing (free articles)", url: "https://www.ministryoftesting.com", source: "Education platform" },
    ],
  },
  {
    topicId: "qa-t2",
    overview:
      "A test plan turns 'we tested it' into evidence. Scope, risk, and coverage tradeoffs are the engineering content — the document is just the container.",
    keyPoints: [
      "Scope in/out; features vs risk prioritization",
      "Test techniques: equivalence partitioning, boundary values, state transitions",
      "Traceability: requirement → test case mapping",
      "Entry/exit criteria; regression selection strategy",
      "Reporting: coverage, pass rate, known risks",
    ],
    practice: [
      "Write a 2-page test plan for an e-commerce checkout (scope, risks, cases)",
      "Apply boundary-value analysis to a date field; find the bugs others missed",
      "Estimate testing effort for a feature and defend the number",
    ],
    resources: [
      { title: "ISTQB foundation syllabus", url: "https://www.istqb.org/certifications/certified-tester-foundation-level", source: "Standards body" },
      { title: "Ministry of Testing: test planning", url: "https://www.ministryoftesting.com", source: "Education platform" },
    ],
  },

  // ── QA · Stage 2: Automation ────────────────────────────────
  {
    topicId: "qa-t3",
    overview:
      "Test automation is programming. JavaScript fundamentals — async, promises, selectors — are the engine under Playwright and Selenium.",
    keyPoints: [
      "JS essentials: async/await, arrays/objects, template literals",
      "npm scripts; project structure for test suites",
      "Selectors that survive redesigns: data-testid over brittle CSS",
      "Fixtures and factories for test data",
      "Debugging failed runs: screenshots, traces, console logs",
    ],
    practice: [
      "Solve 10 async-JS exercises; promises are the daily bread of automation",
      "Build a small test-data generator (random users, addresses)",
      "Deliberately break a passing test; use traces to diagnose in under 5 minutes",
    ],
    resources: [
      { title: "javascript.info", url: "https://javascript.info", source: "Education platform" },
      { title: "Playwright: writing tests", url: "https://playwright.dev/docs/writing-tests", source: "Official docs" },
    ],
  },
  {
    topicId: "qa-t4",
    overview:
      "Playwright is the modern browser-automation standard: fast, reliable, with auto-waiting that eliminates most flakiness pain in older tools.",
    keyPoints: [
      "Locators and actions: click, fill, select, expect-web assertions",
      "Auto-waiting vs sleep(); why hardcoded waits are technical debt",
      "Page Object Model for maintainable suites",
      "Multiple browsers/viewport configs; parallel execution",
      "Trace viewer and screenshots on failure",
    ],
    practice: [
      "Automate 5 flows on a demo store (search, add to cart, checkout) with POM",
      "Run the suite in Chromium and Firefox; fix one browser-specific issue",
      "Enable trace-on-failure; debug an intentionally broken test",
    ],
    resources: [
      { title: "Playwright docs", url: "https://playwright.dev/docs/intro", source: "Official docs" },
      { title: "Selenium documentation", url: "https://www.selenium.dev/documentation/", source: "Official docs" },
    ],
    pitfalls: [
      "sleep(3000) everywhere instead of waiting on conditions",
      "Selectors tied to styling classes that change weekly",
      "One giant spec file instead of page objects",
    ],
  },
  {
    topicId: "qa-t5",
    overview:
      "APIs are where most bugs hide and where tests are fastest. Postman turns API testing into a systematic, shareable practice.",
    keyPoints: [
      "HTTP methods/status codes from a tester's perspective",
      "Postman: requests, environments, variables, scripts",
      "Assertions with Chai-style expect on status/body/headers",
      "Auth flows in tests: tokens, refresh, 401 handling",
      "Collections as documentation and as regression suites",
    ],
    practice: [
      "Test a public API: 20 requests covering positive + negative paths",
      "Chain requests: login → create → read → update → delete with variables",
      "Export a collection and run it from the CLI (Newman)",
    ],
    resources: [
      { title: "Postman learning center", url: "https://learning.postman.com", source: "Official docs" },
      { title: "MDN: HTTP status", url: `${MDN}/en-US/docs/Web/HTTP/Status`, source: "MDN" },
    ],
  },

  // ── QA · Stage 3: Job-Ready ─────────────────────────────────
  {
    topicId: "qa-t6",
    overview:
      "Tests that only run on your laptop are half real. CI integration makes quality automatic and visible on every pull request.",
    keyPoints: [
      "GitHub Actions: workflow triggers, jobs, steps, caching",
      "Running Playwright in CI: browsers, artifacts, report upload",
      "Fast feedback: parallelism, sharding, flaky-test quarantine",
      "Status checks as merge gates",
    ],
    practice: [
      "Add a workflow that runs your Playwright suite on every PR",
      "Upload HTML reports and screenshots as artifacts on failure",
      "Make the suite pass in under 5 minutes; shard if needed",
    ],
    resources: [
      { title: "GitHub Actions docs", url: "https://docs.github.com/en/actions", source: "GitHub" },
      { title: "Playwright: CI setup", url: "https://playwright.dev/docs/ci", source: "Official docs" },
    ],
  },
  {
    topicId: "qa-t7",
    overview:
      "QA interviews test scenario thinking: how would you test X? Framework knowledge plus structured answers beat tool trivia.",
    keyPoints: [
      "'How would you test…' framework: clarify → risks → techniques → automation split",
      "Selenium vs Playwright tradeoffs (wait strategies, architecture)",
      "API vs UI test distribution; the testing pyramid applied",
      "A bug war story told with impact and process",
    ],
    practice: [
      "Answer 10 'test this object' questions out loud (pen, elevator, form)",
      "Write a 1-page automation strategy for a mock team",
      "Mock interview with a peer; get feedback on structure",
    ],
    resources: [
      { title: "Ministry of Testing: community + articles", url: "https://www.ministryoftesting.com", source: "Education platform" },
      { title: "Playwright docs (reference for deep dives)", url: "https://playwright.dev", source: "Official docs" },
    ],
  },
];

/** All lessons for one roadmap, keyed by topic id. */
export function lessonsForRoadmap(topicIds: string[]): Map<string, Lesson> {
  const set = new Set(topicIds);
  return new Map(LESSONS.filter((l) => set.has(l.topicId)).map((l) => [l.topicId, l]));
}

export function lessonByTopicId(topicId: string): Lesson | undefined {
  return LESSONS.find((l) => l.topicId === topicId);
}
