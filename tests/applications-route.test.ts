import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUserFromToken: vi.fn(),
  postedJobsByRecruiter: vi.fn(),
  applicationsForJob: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  findUserById: vi.fn(),
  getUserFromToken: mocks.getUserFromToken,
  isDemoUserId: (id: string) => id.startsWith("u_demo_"),
  SESSION_COOKIE: "sb_session",
}));
vi.mock("@/lib/store", () => ({
  addApplication: vi.fn(),
  applicationsByStudent: vi.fn(),
  applicationStages: () => ["applied", "shortlisted", "challenge", "interview", "offer", "rejected"],
  applicationsForJob: mocks.applicationsForJob,
  attemptsByUser: vi.fn(),
  findApplication: vi.fn(),
  postedJobsByRecruiter: mocks.postedJobsByRecruiter,
  readPostedJobs: vi.fn(),
  toRecruiterView: (application: unknown) => application,
  updateApplicationStageForRecruiter: vi.fn(),
}));
vi.mock("@/lib/email", () => ({
  sendEmail: vi.fn(),
  templates: {},
}));
vi.mock("@/lib/job-match", () => ({
  bestVerifiedScores: vi.fn(),
  jobMatchPercent: vi.fn(),
}));

import { GET } from "@/app/api/applications/route";

describe("recruiter applications API", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.getUserFromToken.mockResolvedValue({ id: "u_recruiter_1", role: "recruiter" });
    mocks.postedJobsByRecruiter.mockResolvedValue([{ id: "pj_owned" }]);
    mocks.applicationsForJob.mockResolvedValue([
      {
        id: "ap_real",
        jobId: "pj_owned",
        studentId: "u_student_1",
        studentEmail: "student@example.com",
        studentName: "Real Student",
      },
      {
        id: "ap_demo",
        jobId: "pj_owned",
        studentId: "u_demo_student",
        studentEmail: "demo@example.com",
        studentName: "Demo Student",
      },
      {
        id: "ap_legacy_demo",
        jobId: "pj_owned",
        studentId: "u_legacy_student",
        studentEmail: "test@skillbridge.local",
        studentName: "Legacy Demo Student",
      },
    ]);
  });

  it("excludes demo-student applications from the recruiter dashboard response", async () => {
    const response = await GET(
      new Request("https://skillproject.vercel.app/api/applications", {
        headers: { Cookie: "sb_session=session" },
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      applications: [{ id: "ap_real", studentName: "Real Student" }],
    });
  });
});
