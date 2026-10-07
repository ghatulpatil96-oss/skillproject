import { NextResponse } from "next/server";
import { getUserFromToken, tokenFromRequest } from "@/lib/auth";
import { skillById } from "@/lib/data";
import { createTestTicket, questionsForTest, testConfigFor } from "@/lib/server/questions";
import { attemptsByUser } from "@/lib/store";

const MAX_ATTEMPTS_PER_30_DAYS = 3;

/**
 * GET /api/tests/[id]/questions
 * Requires login (attempts are per-user). Returns the question set
 * WITHOUT answer keys or explanations, plus a signed ticket that
 * records when this session started — /api/tests/grade verifies it
 * against the server-side time limit. Grading happens server-side.
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

  // PRD F3.4 — friendly early check (the grade route enforces it for real)
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

  const questions = questionsForTest(params.id).map((q) => ({
    id: q.id,
    type: q.type,
    text: q.text,
    options: q.options, // undefined for code questions
  }));

  return NextResponse.json({
    skill: { id: skill.id, name: skill.name, emoji: skill.emoji },
    durationSec: config.durationMin * 60,
    ticket: createTestTicket(user.id, params.id),
    questions,
  });
}
