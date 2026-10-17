// ─────────────────────────────────────────────────────────────
// Ownership tests (CWE-639): updateApplicationStageForRecruiter
// must refuse applications on jobs the recruiter does not own, and
// toRecruiterView must never expose college to the recruiter.
// These use the JSON storage path (.data) so no database is needed.
// ─────────────────────────────────────────────────────────────
import { describe, expect, it, beforeEach } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import {
  addApplication,
  addPostedJob,
  toRecruiterView,
  updateApplicationStageForRecruiter,
  type Application,
} from "@/lib/store";

const DATA_DIR = path.join(process.cwd(), ".data");
const APPS_FILE = path.join(DATA_DIR, "applications.json");
const JOBS_FILE = path.join(DATA_DIR, "posted-jobs.json");

const OWNER = "u_owner_1";
const OTHER = "u_other_1";

let ownedJobId = "";
let otherJobId = "";

async function seed() {
  ownedJobId = (
    await addPostedJob({
      role: "Frontend Developer",
      company: "Owned Co",
      recruiterId: OWNER,
      location: "Remote",
      salary: "",
      type: "Full-time",
      skills: [{ skillId: "javascript", minScore: 60 }],
      description: "owned job",
      perks: [],
      status: "published",
    })
  ).id;
  otherJobId = (
    await addPostedJob({
      role: "Backend Developer",
      company: "Other Co",
      recruiterId: OTHER,
      location: "Remote",
      salary: "",
      type: "Full-time",
      skills: [{ skillId: "nodejs", minScore: 60 }],
      description: "job owned by someone else",
      perks: [],
      status: "published",
    })
  ).id;
  await addApplication({
    jobId: ownedJobId,
    studentId: "u_stu",
    studentName: "Study Student",
    studentEmail: "stu@test.dev",
    scores: { javascript: 80 },
    matchPercent: 80,
    stage: "applied",
  });
}

beforeEach(async () => {
  await fs.rm(DATA_DIR, { recursive: true, force: true });
  await seed();
});

describe("updateApplicationStageForRecruiter", () => {
  it("lets the owning recruiter update the stage", async () => {
    const appsBefore = (JSON.parse(await fs.readFile(APPS_FILE, "utf-8")) as Application[]);
    const target = appsBefore.find((a) => a.jobId === ownedJobId);
    expect(target).toBeDefined();
    const updated = await updateApplicationStageForRecruiter(target!.id, "shortlisted", OWNER);
    expect(updated).toBeDefined();
    expect(updated?.stage).toBe("shortlisted");
  });

  it("refuses a recruiter who does not own the job", async () => {
    const appsBefore = (JSON.parse(await fs.readFile(APPS_FILE, "utf-8")) as Application[]);
    const ownedId = appsBefore.find((a) => a.jobId === ownedJobId)!.id;
    const updated = await updateApplicationStageForRecruiter(ownedId, "shortlisted", OTHER);
    expect(updated).toBeUndefined();
    const appsAfter = (JSON.parse(await fs.readFile(APPS_FILE, "utf-8")) as Application[]);
    expect(appsAfter.find((a) => a.id === ownedId)!.stage).toBe("applied");
  });

  it("returns undefined for an unknown application id", async () => {
    expect(
      await updateApplicationStageForRecruiter("ap_nonexistent", "offer", OWNER)
    ).toBeUndefined();
  });
});

describe("toRecruiterView", () => {
  it("never exposes college", () => {
    const view = toRecruiterView({
      id: "ap_x",
      jobId: ownedJobId,
      studentId: "u_stu",
      studentName: "Study Student",
      studentEmail: "stu@test.dev",
      college: "Legacy University",
      scores: {},
      matchPercent: 0,
      stage: "applied",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    expect("college" in view).toBe(false);
  });
});
