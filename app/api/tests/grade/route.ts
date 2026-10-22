import { NextResponse } from "next/server";
import { getUserFromToken, tokenFromRequest } from "@/lib/auth";
import { skillById } from "@/lib/data";
import {
  questionsForTest,
  testConfigFor,
  verifyTestTicket,
} from "@/lib/server/questions";
import { addAttemptWithQuota, attemptsByUser, readAttempts } from "@/lib/store";
import { assertSameOrigin, readJson } from "@/lib/security";
import { sendEmail, templates } from "@/lib/email";

const MAX_ATTEMPTS_PER_30_DAYS = 3;
const TIME_LIMIT_GRACE_MS = 90_000; // clock skew + submit latency

/**
 * POST /api/tests/grade
 * Body: { skillId, ticket, answers: Record<questionId, index>, integrityFlags }
 *
 * Integrity chain:
 *  1. login + same-origin + application/json (no cross-site form grading)
 *  2. signed ticket must match user + skill + the exact question ids shown
 *  3. server-side time limit from the ticket's iat
 *  4. max 3 attempts per 30 days per skill, enforced inside one
 *     advisory-locked transaction (no race between count and insert)
 *  5. VERIFIED score is MCQ-only; the coding challenge is practice
 *     until a server-side judge exists (self-reported completion
 *     never adds verified credit)
 *  6. review with correctIndex/correctText is returned ONLY for
 *     practice attempts; verified attempts get ok/explanation but no
 *     key, because reviewed questions are excluded from later
 *     verified sets by selectVerifiedQuestions
 */
export async function POST(req: Request) {
  try {
    if (!(await assertSameOrigin(req))) {
      return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 });
    }
    const read = await readJson<{
      skillId?: string;
      ticket?: string;
      answers?: Record<string, number>;
      integrityFlags?: number;
    }>(req);
    if (!read.ok) {
      return NextResponse.json({ error: read.error }, { status: read.status });
    }
    const body = read.data;

    const skillId = body.skillId ?? "";
    const skill = skillById(skillId);
    const config = testConfigFor(skillId);
    if (!skill || !config) {
      return NextResponse.json({ error: "Unknown test" }, { status: 400 });
    }

    const user = await getUserFromToken(tokenFromRequest(req));
    if (!user) {
      return NextResponse.json({ error: "Log in to submit a test." }, { status: 401 });
    }

    // ── ticket: proves who, when, and exactly which questions were served ──
    const ticket = verifyTestTicket(body.ticket);
    if (!ticket || ticket.userId !== user.id || ticket.skillId !== skillId) {
      return NextResponse.json(
        { error: "Invalid test session. Reload the test and try again." },
        { status: 400 }
      );
    }

    // every graded question must have been on this ticket's set
    const served = new Set(ticket.qids);
    const bank = questionsForTest(skillId).filter((q) => served.has(q.id));
    if (bank.length === 0 || bank.length !== ticket.qids.length) {
      return NextResponse.json(
        { error: "This test session does not match the question set issued. Reload the test." },
        { status: 400 }
      );
    }

    // ── server-side time limit (PRD F3.2) ──
    const elapsedMs = Date.now() - ticket.iat;
    const limitMs = config.durationMin * 60 * 1000 + TIME_LIMIT_GRACE_MS;
    if (elapsedMs > limitMs) {
      return NextResponse.json(
        {
          error: `Time limit exceeded (${config.durationMin} min). This attempt was not saved — start a new test.`,
        },
        { status: 400 }
      );
    }

    // ── grading ──
    const mcqs = bank.filter((q): q is (typeof bank)[number] => q.type === "mcq");
    const codeCount = bank.filter((q) => q.type === "code").length as number;

    // VERIFIED: MCQ accuracy only. Coding is practice until a real
    // judge exists — the "I completed it" checkbox is not evidence.
    let correct = 0;
    for (const q of mcqs) {
      if (body.answers?.[q.id] === q.answer) correct++;
    }
    const score = Math.round((correct / Math.max(1, mcqs.length)) * 100);

    // ── percentile from REAL attempt data (never from the client) ──
    const peers = (await readAttempts()).filter((a) => a.skillId === skillId);
    const below = peers.filter((a) => a.score < score).length;
    const percentile = peers.length
      ? Math.min(99, Math.max(5, Math.round((below / peers.length) * 100)))
      : 50;

    const passed = score >= config.passingScore;
    const integrityFlags = Math.max(0, Math.min(99, Math.floor(body.integrityFlags ?? 0)));
    const isPractice = ticket.mode === "practice";

    // ── persist attempt + consume the quota slot atomically ──
    const outcome = await addAttemptWithQuota(
      {
        userId: user.id,
        skillId,
        score,
        percentile,
        passed,
        answers: body.answers ?? {},
        integrityFlags,
      },
      isPractice ? Number.MAX_SAFE_INTEGER : MAX_ATTEMPTS_PER_30_DAYS
    );
    if (!outcome.ok) {
      return NextResponse.json(
        {
          error: `Attempt limit reached: ${MAX_ATTEMPTS_PER_30_DAYS} attempts per 30 days for ${skill.name}.`,
          attemptsLeft: 0,
        },
        { status: 403 }
      );
    }
    const attempt = outcome.attempt;

    // result email (verified attempts only — practice does not spam)
    if (!isPractice) {
      const tpl = templates.testResult(user.name, skill.name, score, percentile, passed);
      try {
        const email = await sendEmail({ to: user.email, ...tpl });
        if (email.status === "failed") {
          console.error("[grade] Test result email was not delivered.");
        }
      } catch {
        console.error("[grade] Test result email could not be recorded or sent.");
      }
    }

    // ── response ──
    // Practice: full review including the key (learning mode).
    // Verified: ok per question + MCQ explanation, but NO
    // correctIndex/correctText, so a review cannot seed a retake.
    const review = bank.map((q, i) => {
      const picked = body.answers?.[q.id];
      const ok =
        q.type === "mcq"
          ? picked === q.answer
          : typeof picked === "string" && (picked as string).length > 0; // code: judged by a human/judge later
      return {
        index: i + 1,
        text: q.text,
        ok,
        ...(isPractice
          ? {
              correctIndex: q.type === "mcq" ? q.answer : null,
              correctText: q.type === "mcq" ? q.options?.[q.answer] : null,
            }
          : {}),
        explanation: q.explanation,
      };
    });

    const history = await attemptsByUser(user.id);
    const recentCount = history.filter(
      (a) => a.skillId === skillId && Date.now() - new Date(a.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000
    ).length;
    const attemptsLeft = isPractice
      ? MAX_ATTEMPTS_PER_30_DAYS
      : Math.max(0, MAX_ATTEMPTS_PER_30_DAYS - recentCount);

    return NextResponse.json({
      score,
      percentile,
      passed,
      integrityFlags,
      attemptId: attempt.id,
      attemptsLeft,
      mode: isPractice ? "practice" : "verified",
      codingCount: codeCount,
      review,
    });
  } catch (err) {
    console.error("grade error", err);
    return NextResponse.json({ error: "Failed to grade test" }, { status: 500 });
  }
}

/** GET /api/tests/grade — attempt history for the logged-in user. */
export async function GET(req: Request) {
  const user = await getUserFromToken(tokenFromRequest(req));
  if (!user) return NextResponse.json({ attempts: [] });
  return NextResponse.json({ attempts: await attemptsByUser(user.id) });
}
