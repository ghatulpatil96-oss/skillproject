import { NextResponse } from "next/server";
import { getUserFromToken, tokenFromRequest } from "@/lib/auth";
import { skillById } from "@/lib/data";
import { QUESTIONS, createTestTicket, questionsForTest, testConfigFor } from "@/lib/server/questions";
import { attemptsByUser } from "@/lib/store";

const MAX_ATTEMPTS_PER_30_DAYS = 3;

/**
 * GET /api/tests/[id]/questions
 *
 * Requires login. Serves the question set WITHOUT answer keys or
 * explanations, plus a signed ticket bound to:
 *   • the user (graded attempts belong to one account)
 *   • the skill
 *   • the exact question ids in this session
 *
 * Verified-mode set selection: questions whose answers the student
 * has already seen in review are excluded, so a disclosed review
 * cannot be replayed into a later verified attempt. When the pool
 * runs dry the request is refused with attemptsLeft info.
 */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getUserFromToken(tokenFromRequest(_req));
  if (!user) {
    return NextResponse.json(
      { error: "Log in to take a test — that's how your scorecard gets saved and verified." },
      { status: 401 }
    );
  }

  const skill = skillById(params.id);
  const config = testConfigFor(params.id);
  if (!skill || !config) {
    return NextResponse.json({ error: "Unknown test" }, { status: 404 });
  }

  const mcqConfig = config.mcqCount ?? 5;

  // friendly early check (the grade route enforces the quota for real)
  const recent = (await attemptsByUser(user.id)).filter(
    (a) =>
      a.skillId === params.id &&
      Date.now() - new Date(a.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000
  );
  if (recent.length >= MAX_ATTEMPTS_PER_30_DAYS) {
    return NextResponse.json(
      { error: `Attempt limit reached: ${MAX_ATTEMPTS_PER_30_DAYS} attempts per 30 days for this skill.`, attemptsLeft: 0 },
      { status: 403 }
    );
  }

  // serve MCQs only for the verified score; the coding item is practice

  // reviewed-question ids: questions that appeared in any past attempt
  // of this user (their keys were shown after grading), so they are
  // excluded from later verified attempts
  const seenIds = new Set<string>();
  for (const attempt of await attemptsByUser(user.id)) {
    if (attempt.skillId !== params.id) continue;
    for (const qid of Object.keys(attempt.answers ?? {})) {
      const q = QUESTIONS.find((x) => x.id === qid);
      if (q && q.type === "mcq" && q.skillId === params.id) seenIds.add(qid);
    }
  }

  const available = questionsForTest(params.id).filter(
    (q) => q.type === "mcq" && !seenIds.has(q.id)
  );
  if (available.length < mcqConfig) {
    return NextResponse.json(
      {
        error:
          "There are not enough unseen questions left for a fresh verified attempt in this window. " +
          "Additional questions are being added — check back soon.",
        attemptsLeft: MAX_ATTEMPTS_PER_30_DAYS - recent.length,
      },
      { status: 409 }
    );
  }

  const mcqBank = available;  // rotate by attempt count so retakes see different question sets
  const start = recent.length % Math.max(1, mcqBank.length);
  const rotated = [...mcqBank.slice(start), ...mcqBank.slice(0, start)];
  const serving = rotated.slice(0, mcqConfig);
  // one coding question rides along as practice (never scored)
  const codeQ = questionsForTest(params.id).find((q) => q.type === "code");
  const served = codeQ ? [...serving, codeQ] : serving;

  return NextResponse.json({
    skill: { id: skill.id, name: skill.name },
    durationSec: config.durationMin * 60,
    ticket: createTestTicket(
      user.id,
      params.id,
      served.map((q) => q.id)
    ),
    questions: served.map((q) => ({
      id: q.id,
      type: q.type,
      text: q.text,
      options: q.options, // undefined for code questions
    })),
  });
}
