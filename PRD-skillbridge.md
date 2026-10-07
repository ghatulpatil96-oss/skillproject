# Product Requirements Document (PRD)

## SkillBridge — Skill-Based Hiring & Learning Platform for Tier 2/3 College Students

| Field | Detail |
|---|---|
| **Document Version** | v1.0 |
| **Author** | Product Team |
| **Status** | Draft — For Review |
| **Last Updated** | September 2026 |
| **Target Launch** | MVP in ~4–5 months post-kickoff |

---

## 1. Executive Summary

**SkillBridge** is a web platform that connects students from Tier 2 and Tier 3 colleges in India (and similar emerging markets) with recruiters through **verified, skill-based hiring** instead of resume-by-college-name filtering.

Students get:
- Structured **skill roadmaps** (from beginner → job-ready) for high-demand technical skills.
- **Skill assessments/tests** that generate a verified, shareable skill scorecard.
- A **recruiter-visible profile** where hiring happens based on demonstrated ability, not college pedigree or referrals.

Recruiters get:
- A **skill-filtered candidate pipeline** with verified test scores, roadmap progress, and project portfolios.
- Tools to post roles, run coding/challenge rounds, and shortlist with confidence.

**The core loop:** Learn (roadmap) → Prove (assessment) → Get Discovered (profile) → Get Hired.

---

## 2. Problem Statement

### 2.1 The Student Problem
- **~80% of Indian engineering graduates** come from Tier 2/3 colleges with little or no campus placement infrastructure. Top tech companies recruit almost exclusively from Tier 1 campuses (IITs, NITs, BITS).
- Students don't know **what to learn or in what order** — YouTube/courses are fragmented, no clear path from "beginner" to "job-ready."
- No mechanism to **prove skills** to recruiters when they have no brand-name college, internship, or referral network.
- Resumes get filtered by college name before anyone reads their skills.

### 2.2 The Recruiter Problem
- Companies (especially startups and mid-size product companies) **want skilled talent but can't discover it** outside Tier 1 campuses.
- Hiring from job boards (Naukri, LinkedIn) is noisy — thousands of unverified applications.
- Campus hiring is expensive and logistically hard for Tier 2/3 colleges that are geographically scattered.

### 2.3 Why Now
- Remote/hybrid work has made companies location- and college-agnostic.
- AI-era hiring emphasizes demonstrable skills over credentials.
- Massive growth in self-learning (YouTube, free courses) but no verification or hiring bridge.

---

## 3. Goals & Success Metrics

### 3.1 Product Goals
1. Become the **default skill roadmap + assessment destination** for Tier 2/3 students.
2. Generate **verified skill profiles** that recruiters actively hire from.
3. Close the loop: first **1,000 hires facilitated** within 12 months of launch.

### 3.2 North Star Metric
**Verified skill profiles that receive at least one recruiter shortlist per month.**

### 3.3 KPIs

| Category | Metric | MVP Target (6 mo) | 12-mo Target |
|---|---|---|---|
| Growth | Registered students | 25,000 | 150,000 |
| Growth | Registered recruiters/companies | 150 | 600 |
| Engagement | Roadmaps started | 15,000 | 100,000 |
| Engagement | Assessments completed | 40,000 | 250,000 |
| Engagement | Weekly active learners (WAU/MAU) | 25% | 35% |
| Outcomes | Students shortlisted by recruiters | 500 | 5,000 |
| Outcomes | Hires facilitated | 100 | 1,000 |
| Revenue | Paying recruiters (subscriptions) | 20 | 80 |

---

## 4. Target Users & Personas

### Persona 1: "Aspiring Ananya" — Tier 3 College Student (Primary)
- 2nd/3rd year B.Tech/BSc/BCA student at a college with weak placements.
- Learns from YouTube and free courses, but has no direction or proof of skill.
- Feels behind Tier 1 peers; motivated but underserved.
- **Needs:** a clear roadmap, structured practice, and a way to be seen by recruiters.
- **Pain:** "I have skills but no one ever looks at my resume."

### Persona 2: "Final-year Farhan" — Job Seeker
- Final semester, applying everywhere with no response.
- **Needs:** verified scores to compensate for no brand-name college/internship; interview prep.

### Persona 3: "Startup Recruiter Riya" — Recruiter/Talent Lead (Payer)
- Talent lead at a 50–500 person startup or mid-size product company.
- Can't compete with FAANG salaries for Tier 1 talent; wants hungry, skilled, affordable candidates.
- **Needs:** a filtered pipeline of verified candidates; low cost per hire.
- **Pain:** "Job boards send me 800 unvetted resumes; ATS filtering is useless."

### Persona 4: "Placement Officer Meena" (Secondary / Distribution channel)
- Training & placement (T&P) officer at a Tier 2/3 college.
- **Needs:** a free/cheap way to make her students employable and get companies to visit (virtually or physically).
- **Role:** bulk onboarders of students; potential institutional revenue channel.

---

## 5. Scope

### 5.1 In Scope (MVP)
- Student accounts, profiles, and skill selection.
- Skill roadmaps (10–15 launch skills) with progress tracking.
- Skill assessments: MCQ tests + coding challenges with auto-grading.
- Verified skill scorecards on student profiles.
- Recruiter search & filtering of candidate pool.
- Job posting and applicant tracking (lightweight ATS).
- Basic notifications (email) and dashboards for both sides.

### 5.2 In Scope (Phase 2+)
- Proctored/high-stakes certification exams (webcam + AI proctoring).
- Mock interviews (AI-driven and peer/human).
- College/Institution dashboard for placement officers.
- Mentorship marketplace and referral programs.
- Mobile app.

### 5.3 Out of Scope (for now)
- Non-technical skills (initially technical skills only).
- Internship visa/abroad placements.
- Offline events management.

---

## 6. Detailed Feature Requirements

## 6.1 Student Side

### F1. Onboarding & Profile
| ID | Requirement | Priority |
|---|---|---|
| F1.1 | Sign up via email/Google with college name, graduation year, branch, current year of study. Auto-suggest college names (searchable list, seeded with 5,000+ Indian colleges). | P0 |
| F1.2 | Profile setup wizard: pick target role(s) — e.g., Web Developer, Data Analyst, Backend Engineer, QA, Android Developer, Data Engineer, DevOps, ML Engineer. | P0 |
| F1.3 | Skill inventory: self-declare known skills (later validated by tests). | P0 |
| F1.4 | Profile completeness meter (photo, bio, projects, skills verified, GitHub/LinkedIn links) — recruiters see a "Profile Score." | P1 |
| F1.5 | Portfolio section: add projects with description, tech stack, repo/demo links, and optionally attach completed assessments. | P1 |

### F2. Skill Roadmaps (Core Learning Feature)
Each roadmap is a structured, dependency-ordered graph of steps for one skill/career track.

| ID | Requirement | Priority |
|---|---|---|
| F2.1 | Roadmap catalog at launch: **Frontend Development, Backend Development (Node/Java/Python), Full-Stack Web, DSA (Interview Prep), Data Analysis (SQL + Excel + Python), Android Development, QA/Automation Testing, Cloud/DevOps Basics, Git & Fundamentals**. | P0 |
| F2.2 | Roadmap structure: stages (Foundations → Core → Advanced → Job-Ready) → topics → checkpoints. Each topic node contains: learning objective, curated free/paid resources (videos, docs, courses), estimated hours, and practice tasks. | P0 |
| F2.3 | Progress tracking: mark topics as complete; auto-computed % progress per stage and per roadmap; streaks and weekly goals. | P0 |
| F2.4 | **Checkpoint assessments embedded in roadmaps** — after each stage, student must pass a short quiz/challenge to unlock the next stage. Scores feed the skill profile. | P0 |
| F2.5 | Roadmap for a target role = combination of skills (e.g., "Frontend Developer" = HTML/CSS + JS + React + Git + Basic DSA). Role page shows combined progress across component roadmaps. | P0 |
| F2.6 | "Job-Ready" badge awarded when a roadmap reaches 100% AND its capstone assessment is passed with ≥70%. | P0 |
| F2.7 | Downloadable/printable roadmap view + weekly learning plan generator (inputs: hours/week available, target date). | P1 |
| F2.8 | Content versioning and admin CMS so team can edit roadmaps without deploys. | P1 |

**Roadmap content requirements:**
- Each roadmap must contain 40–80 topic nodes.
- Resources curated and reviewed quarterly; broken links auto-flagged.
- Every roadmap ends with 1–2 **capstone projects** with clear specs and evaluation rubric (self-eval checklist + optional AI review in Phase 2).

### F3. Assessments & Testing (Core Verification Feature)
Two assessment types:

**A. Skill Tests (proctored-lite, retakable):**
| ID | Requirement | Priority |
|---|---|---|
| F3.1 | Per-skill tests: 20–30 MCQs + 1–2 coding/task problems. Duration 45–75 min. | P0 |
| F3.2 | Auto-grading: MCQ instantly; code problems via test-case execution in a sandboxed judge (language support at launch: Python, Java, C++, JavaScript, SQL). | P0 |
| F3.3 | Scoring: 0–100 with percentile vs. all test-takers; validity window of 6 months (stale scores hidden after that). | P0 |
| F3.4 | Attempts: max 3 per 30 days per skill (prevents answer farming); each attempt logged. | P0 |
| F3.5 | Lightweight anti-cheat: tab-switch counting, copy-paste disabled, randomized question order from a large bank. Flag "low-integrity" sessions to recruiters without hard-blocking (Phase 2 adds proctoring). | P1 |
| F3.6 | Result page: score, percentile, section-wise breakdown, strengths/gaps, and **personalized roadmap links for weak areas**. Shareable result link + badge (for LinkedIn). | P0 |

**B. Capstone / Project Evaluations:**
| ID | Requirement | Priority |
|---|---|---|
| F3.7 | Structured project briefs with rubrics; student submits repo + demo link + written summary. | P1 |
| F3.8 | MVP grading: self-checklist + peer review pool + spot manual review by team. Phase 2: AI-assisted code review. | P1 |

**C. Recruiter-Ordered Challenges:**
| ID | Requirement | Priority |
|---|---|---|
| F3.9 | Recruiters can invite shortlisted candidates to a custom timed challenge (question bank + custom questions). Results go only to that recruiter. | P1 |
| F3.10 | Hiring challenges / open contests: company-branded contests where top performers get interviews. | P2 |

### F4. Student Profile (Recruiter-Facing)
| ID | Requirement | Priority |
|---|---|---|
| F4.1 | Public profile URL containing: education, skills (with verified badge + score where tested), roadmap progress, projects, GitHub/LinkedIn, resume upload, and a one-line "about." | P0 |
| F4.2 | **Verified Skill Scorecard** — the signature artifact: a clean visual card per skill showing score, percentile, validity, and issue date. Embeddable/shareable. | P0 |
| F4.3 | Privacy controls: student chooses profile visibility (public / recruiters-only / hidden), and can see which recruiters viewed their profile. | P0 |
| F4.4 | "Open to work" toggle with role preferences, expected CTC range (optional), and location/remote preference. | P0 |

### F5. Student Discovery of Jobs
| ID | Requirement | Priority |
|---|---|---|
| F5.1 | Job feed with filters: role, skills, location/remote, experience (0–1 yrs / internships), salary range. | P0 |
| F5.2 | **Match score per job** — computed from verified skills + profile vs. job skill requirements ("You match 78% — missing: SQL (take test)"). | P0 |
| F5.3 | One-click apply using the SkillBridge profile; application status tracker (Applied → Viewed → Challenge → Interview → Offer/Rejected). | P0 |
| F5.4 | Email notifications: application updates, new matching jobs weekly digest, assessment results, roadmap streak nudges. | P1 |

## 6.2 Recruiter Side

### F6. Recruiter Onboarding & Company Profile
| ID | Requirement | Priority |
|---|---|---|
| F6.1 | Company sign-up with work email + verification (domain check + manual review queue for MVP to prevent fake recruiters). | P0 |
| F6.2 | Company profile: about, size, funding stage, tech stack, photos, hiring history on platform. | P0 |

### F7. Candidate Search & Pipeline
| ID | Requirement | Priority |
|---|---|---|
| F7.1 | Search candidates by: skill + verified score threshold, percentile, roadmap completion/job-ready badge, graduation year, location, projects/tech stack keywords. **College name and tier are never shown to recruiters** (anti-bias decision, 2026-10). | P0 |
| F7.2 | Sort/filter by "verification strength" — e.g., only show candidates with proctored-valid scores. | P1 |
| F7.3 | Candidate cards show: top verified skills with scores, roadmap status, profile score, and activity recency — enough to shortlist without opening the profile. | P0 |
| F7.4 | Save/search pipelines; tags and notes on candidates; shortlist → invite to challenge → interview stages. | P0 |

### F8. Jobs & Applicant Tracking (Lightweight ATS)
| ID | Requirement | Priority |
|---|---|---|
| F8.1 | Post jobs with required skills, score thresholds, compensation range, and screening questions. | P0 |
| F8.2 | Applicants auto-ranked by match score; side-by-side comparison of candidates. | P0 |
| F8.3 | Pipeline board (kanban) with stages and email templates for outreach/rejection. | P1 |
| F8.4 | Analytics: views, applications, match quality per job. | P2 |

### F9. Custom Challenges & Contests
| ID | Requirement | Priority |
|---|---|---|
| F9.1 | Create challenges from question bank or custom MCQ/code tasks; invite individuals or open to all; auto-grade and rank. | P1 |
| F9.2 | Branded hiring challenges with leaderboard and direct interview offers to top N. | P2 |

## 6.3 Institution / Placement Cell (Phase 2)
- College dashboard: student participation, roadmap progress, aggregate test scores.
- Bulk onboarding via CSV/invite codes; college-specific hiring challenges.
- Recruiter "virtual campus drive" tooling.

## 6.4 Platform-Wide

| ID | Requirement | Priority |
|---|---|---|
| F10.1 | Responsive web (mobile-first where possible); student base is heavily mobile. | P0 |
| F10.2 | Admin panel: content management (roadmaps, questions), user/recruiter verification, flagged-session review, analytics. | P0 |
| F10.3 | Role-based access control; GDPR/DPDP-compliant data handling (India's Digital Personal Data Protection Act). | P0 |
| F10.4 | Notifications infrastructure (email at MVP; push/WhatsApp in Phase 2 — WhatsApp is high-impact for this audience). | P1 |

---

## 7. Monetization

| Stream | Model | Phase |
|---|---|---|
| **Recruiter subscriptions** | SaaS tiers: Starter (5 job posts, limited searches) / Growth (unlimited posts, ATS, challenges) / Enterprise (SSO, campus drives, API). ₹15k–₹1L+/mo equivalents. | MVP |
| **Per-hire success fee** (optional) | Discounted subscription if company opts into pay-per-successful-hire. | Phase 2 |
| **Students — free forever core** | Roadmaps, 1 free test/month, profile, and job applications are free. | MVP |
| **Student premium (careful)** | "Pro" pass: unlimited tests, proctored certification, AI mock interviews, priority visibility. Keep pricing student-affordable (₹99–₹299/mo). Must never paywall visibility unfairly — verification, not auction. | Phase 2 |
| **Institution licenses** | College-wide licenses for placement cells. | Phase 2 |
| **Sponsored challenges** | Companies pay to run branded hiring contests. | Phase 2 |

**Ethical guardrail:** the core promise is that a student with skills can get discovered for free. Monetization must never sell student data or rank students by payment.

---

## 8. Suggested Tech Stack (Recommended, Not Prescriptive)

| Layer | Choice | Rationale |
|---|---|---|
| Frontend | Next.js (React) + TypeScript + Tailwind | SEO for roadmap pages (big organic acquisition channel), fast iteration |
| Backend | Node.js (NestJS) or Django | Mature ecosystems; team-skill dependent |
| Database | PostgreSQL | Relational core (users, scores, jobs) |
| Cache/Queue | Redis + BullMQ/Celery | Test grading jobs, notifications |
| Code execution | Isolated sandboxed runner (Docker + Firecracker/judge0-style, or hosted: Judge0, Piston) | Security-critical; never run user code directly on app servers |
| Search | Meilisearch or Elasticsearch | Candidate/job search with filters |
| Auth | Clerk/Auth0 or custom JWT | Speed vs. control tradeoff |
| Storage | S3-compatible | Resumes, project assets |
| Analytics | PostHog + event pipeline | Product analytics from day 1 |
| Infra | Docker on cloud (AWS/GCP); IaC with Terraform later | — |

**Key non-functional requirements:**
- Assessment submission → results within 30s for MCQ, 60s for code tests.
- 99.9% uptime during hiring-challenge windows (they are time-boxed, high-concurrency events).
- P95 page load < 2.5s on 3G/4G mobile networks (Tier 2/3 reality).
- All user code execution sandboxed with resource limits (CPU, memory, network-off, 30s timeout).

---

## 9. Data Model (Core Entities — Conceptual)

- **User** (student | recruiter | admin | institution)
- **StudentProfile** (college, grad year, branch, preferences, visibility)
- **RecruiterProfile / Company**
- **Skill** (name, category, description)
- **Roadmap** (skill(s), stages[] → topics[] → resources[], checkpoints[])
- **StudentProgress** (student, roadmap, topic status, timestamps)
- **Assessment** (skill, type: test|capstone|challenge, question paper template)
- **Question** (skill, type: mcq|coding|sql, difficulty, body, answer/test-cases, bank metadata)
- **Attempt** (student, assessment, started/ended, answers, score, percentile, integrity flags, validity expiry)
- **Scorecard** (student, skill, best score, percentile, issued, valid-until)
- **Job** (company, role, skills[], thresholds, comp, location, status)
- **Application** (student, job, stage, match score, timeline)
- **Challenge** (recruiter-owned test with invites/results)

---

## 10. User Flows (Happy Paths)

**Student learns & gets verified:**
1. Signs up → picks "Frontend Developer" target role.
2. Sees combined roadmap: HTML/CSS → JS → React → Git → Basic DSA; sets 10 hrs/week.
3. Completes Foundations stage → passes checkpoint quiz → unlocks Core.
4. Takes the "JavaScript" skill test → scores 82, 91st percentile → scorecard added to profile.
5. Job-Ready badge at roadmap completion → profile becomes more visible in recruiter search.

**Recruiter hires:**
1. Posts "Junior React Developer" requiring React (≥70) + JavaScript (≥65) + Git.
2. Searches candidates filtered by verified skills + grad year; shortlists 20.
3. Invites 10 to a custom challenge; 6 complete; ranks results.
4. Moves 3 to interviews via pipeline board; hires 1. Success fee/subscription billed.

---

## 11. MVP Release Plan & Milestones

| Phase | Duration | Scope |
|---|---|---|
| **P0 — Foundations** | Weeks 1–6 | Auth, profiles, skill/roadmap data model, admin CMS, 5 roadmap prototypes |
| **P1 — Learn** | Weeks 7–12 | Roadmap UI, progress tracking, checkpoint quizzes, notifications |
| **P2 — Prove** | Weeks 13–18 | Test engine, sandboxed code runner, question bank (500+ questions), scorecards |
| **P3 — Hire (MVP launch)** | Weeks 19–22 | Recruiter portal, search, jobs, applications, match score, billing |
| **P4 — Post-launch** | Weeks 23+ | Challenges/contests, college dashboards, proctoring, mobile improvements |

**MVP content requirement before launch:** 10 roadmaps, 1,000+ curated questions across 10 skills, 300+ coding problems.

**Pilot strategy:** Launch with 3–5 colleges (via placement officers) and 10–15 hand-recruited startups; facilitate first 25 hires before scaling spend.

---

## 12. Competitive Landscape

| Competitor | Their strength | Our differentiation |
|---|---|---|
| Naukri / LinkedIn | Massive job volume | They're resume-marketplaces with no learning path or skill verification for freshers |
| HackerRank / CodeSignal | Recruiter-side testing tools | They don't own the student side; we own learn → prove → hire end-to-end |
| Unstop (Dare2Compete) | Contests & campus engagement | Less focus on structured learning roadmaps for Tier 2/3 |
| GeeksforGeeks / roadmap.sh | Great free content | No verification, no hiring marketplace attached |
| PhysicsWallah-adjacent upskilling | Student-side learning | No direct recruiter marketplace |

**Moat:** proprietary skill-verification data (percentiles across thousands of students), content depth, and two-sided liquidity — hardest part to copy.

---

## 13. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| **Cheating inflates scores** → recruiter trust dies | Fatal | Integrity flags, question banks rotation, attempt limits, proctoring for high-stakes certs, spot audits, easy score verification links for recruiters |
| Chicken-and-egg (no recruiters without students, and vice versa) | High | Seed supply side first with colleges + free student tools (roadmaps drive organic SEO traffic); hand-recruit initial recruiters with free trials |
| Content upkeep burden | Medium | Admin CMS, quarterly review SLA, community suggestion pipeline |
| Code-execution security | High | Fully sandboxed runners, resource limits, network isolation, third-party judge option |
| Students treat it as "another course site" (low completion) | High | Stage-gated roadmaps, streaks, checkpoints, job-outcome framing throughout |
| DPDP/GDPR compliance, student data sensitivity | Medium | Consent-first design, data minimization, recruiter access logging |
| "College filter" bias reappearing on recruiter side | Medium | Optional college-tier fields, rank by verification strength, product language centered on skills |

---

## 14. Open Questions (For Stakeholder Review)

1. Launch geography — India only at start, or also SEA/Africa from day 1?
2. Which 10 launch skills maximize recruiter demand vs. content cost? (Suggest validating with 20+ recruiter interviews.)
3. Do we allow all recruiters to browse all student profiles, or discovery-by-application-only until trust is established?
4. Build vs. buy for the code-execution sandbox at MVP?
5. Pricing floor for recruiter subscriptions in the pilot market?

---

## 15. Appendix: Success Definition for Pilot

A pilot is successful if, within 3 months of launch:
- ≥2,000 students onboarded across 3–5 partner colleges.
- ≥60% of onboarded students start a roadmap; ≥30% complete a checkpoint.
- ≥10 recruiters actively searching; ≥5 job posts live.
- ≥10 shortlists and ≥3 hires facilitated.
