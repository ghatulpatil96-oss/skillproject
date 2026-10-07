import { NextResponse } from "next/server";
import { getUserFromToken, tokenFromRequest } from "@/lib/auth";
import { skillById } from "@/lib/data";
import { questionsForTest, testConfigFor, verifyTestTicket } from "@/lib/server/questions";
import { addAttempt, attemptsByUser, readAttempts } from "@/lib/store";
import { sendEmail, templates } from "@/lib/email";

const MAX_ATTEMPTS_PER_30_DAYS = 3;
const TIME_LIMIT_GRACE_MS = 90_000; // clock skew + submit latency

/**
 * POST /api/tests/grade
 * Body: { skillId, ticket, answers: Record<questionId, index>, integrityFlags }
 *
 * Integrity chain:
 *  1. login required (attempts belong to a user)
 *  2. signed ticket must match user + skill (issued when questions loaded)
 *  3. server-side time limit from the ticket's iat
 *  4. max 3 attempts per 30 days per skill (PRD F3.4)
 *  5. score AND percentile computed on the server — the client can
 *     never submit either value
 * Explanations are returned here, i.e. only after submission.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      skillId?: string;
      ticket?: string;
      answers?: Record<string, number>;
      integrityFlags?: number;
    };

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

    // ── ticket: proves when (and for whom) this test session started ──
    const ticket = verifyTestTicket(body.ticket);
    if (!ticket || ticket.userId !== user.id || ticket.skillId !== skillId) {
      return NextResponse.json({ error: "Invalid test session. Reload the test and try again." }, { status: 400 });
    }

    // ── server-side time limit (PRD F3.2) ──
    const elapsedMs = Date.now() - ticket.iat;
    const limitMs = config.durationMin * 60 * 1000 + TIME_LIMIT_GRACE_MS;
    if (elapsedMs > limitMs) {
      return NextResponse.json(
        { error: `Time limit exceeded (${config.durationMin} min). This attempt was not saved — start a new test.` },
        { status: 400 }
      );
    }

    // ── attempt limit: 3 per 30 days per skill (PRD F3.4) ──
    const history = await attemptsByUser(user.id);
    const recent = history.filter(
      (a) => a.skillId === skillId && Date.now() - new Date(a.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000
    );
    if (recent.length >= MAX_ATTEMPTS_PER_30_DAYS) {
      return NextResponse.json(
        {
          error: `Attempt limit reached: ${MAX_ATTEMPTS_PER_30_DAYS} attempts per 30 days for ${skill.name}.`,
          attemptsLeft: 0,
        },
        { status: 403 }
      );
    }

    // ── server-side grading against the private key ──
    const questions = questionsForTest(skillId);
    let correct = 0;
    let total = 0;
    for (const q of questions) {
      total++;
      const picked = body.answers?.[q.id];
      if (q.type === "mcq") {
        if (picked === q.answer) correct++;
      } else {
        // coding challenge: honor-system completion in the MVP judge
        if (picked === 1) correct++;
      }
    }
    const score = Math.round((correct / Math.max(1, total)) * 100);

    // ── percentile from REAL attempt data (never from the client) ──
    const peers = (await readAttempts()).filter((a) => a.skillId === skillId);
    const below = peers.filter((a) => a.score < score).length;
    const percentile = peers.length
      ? Math.min(99, Math.max(5, Math.round((below / peers.length) * 100)))
      : 50;

    const passed = score >= config.passingScore;
    const integrityFlags = Math.max(0, Math.min(99, Math.floor(body.integrityFlags ?? 0)));
    const attemptsLeft = Math.max(0, MAX_ATTEMPTS_PER_30_DAYS - recent.length - 1);

    // ── persist (attempts are the source of truth for scorecards) ──
    const attempt = await addAttempt({
      userId: user.id,
      skillId,
      score,
      percentile,
      passed,
      answers: body.answers ?? {},
      integrityFlags,
    });

    // 📧 result email
    const tpl = templates.testResult(user.name, skill.name, score, percentile, passed);
    void sendEmail({ to: user.email, ...tpl });

    // ── response: score + review ONLY (never the raw key) ──
    const review = questions.map((q, i) => {
      const picked = body.answers?.[q.id];
      const ok = q.type === "mcq" ? picked === q.answer : picked === 1;
      return {
        index: i + 1,
        text: q.text,
        ok,
        correctIndex: q.type === "mcq" ? q.answer : null,
        correctText: q.type === "mcq" ? q.options?.[q.answer] : null,
        explanation: q.explanation,
      };
    });

    return NextResponse.json({
      score,
      percentile,
      passed,
      integrityFlags,
      attemptId: attempt.id,
      attemptsLeft,
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
