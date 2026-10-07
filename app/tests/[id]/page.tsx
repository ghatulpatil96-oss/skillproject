"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import { skillById } from "@/lib/data";

type Phase = "intro" | "loading" | "running" | "grading" | "done";

type ApiQuestion = { id: string; type: "mcq" | "code"; text: string; options?: string[] };
type ReviewItem = { index: number; text: string; ok: boolean; correctIndex: number | null; correctText: string | null; explanation: string };

export default function TestPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const skill = skillById(id);

  const [phase, setPhase] = useState<Phase>("intro");
  const [questions, setQuestions] = useState<ApiQuestion[]>([]);
  const [ticket, setTicket] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [secondsLeft, setSecondsLeft] = useState(20 * 60);
  const [result, setResult] = useState<{ score: number; percentile: number; passed: boolean; attemptsLeft: number; review: ReviewItem[] } | null>(null);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // timer
  useEffect(() => {
    if (phase !== "running") return;
    if (secondsLeft <= 0) {
      finish();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, secondsLeft]);

  // integrity: count tab/window switches while the test is running
  useEffect(() => {
    if (phase !== "running") return;
    const onVis = () => {
      if (document.hidden) setTabSwitches((n) => n + 1);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [phase]);

  async function start() {
    setPhase("loading");
    setError(null);
    try {
      const res = await fetch(`/api/tests/${id}/questions`, { cache: "no-store" });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        durationSec?: number;
        ticket?: string;
        questions?: ApiQuestion[];
      };
      if (!res.ok) {
        // 401 = not logged in, 403 = attempt limit — both are intro-phase states
        throw new Error(data.error ?? "Could not load the test. Refresh and try again.");
      }
      setQuestions(data.questions ?? []);
      setTicket(data.ticket ?? null);
      setAnswers({});
      setCurrent(0);
      setResult(null);
      setTabSwitches(0);
      setSecondsLeft(data.durationSec ?? 20 * 60);
      setPhase("running");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load the test.");
      setPhase("intro");
    }
  }

  async function finish() {
    setPhase("grading");
    try {
      // server grades against the private key — the client never sees it,
      // and the signed ticket proves when this session started
      const res = await fetch("/api/tests/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillId: id, ticket, answers, integrityFlags: tabSwitches }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        score?: number;
        percentile?: number;
        passed?: boolean;
        attemptsLeft?: number;
        review?: ReviewItem[];
      };
      if (!res.ok || data.score === undefined) {
        setPhase("intro");
        setError(data.error ?? "Grading failed. Try submitting again.");
        return;
      }
      setResult({
        score: data.score,
        percentile: data.percentile ?? 0,
        passed: data.passed ?? false,
        attemptsLeft: data.attemptsLeft ?? 0,
        review: data.review ?? [],
      });
      setPhase("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Grading failed.");
      setPhase("running");
    }
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const q = questions[current];

  return (
    <div className="min-h-screen">
      <TopBar title={`${skill.name} test`} />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {/* ── INTRO ── */}
        {phase === "intro" && (
          <div className="card p-8 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-tile font-display text-2xl font-bold text-accent">
              {skill.name.slice(0, 1)}
            </span>
            <h1 className="mt-4 text-2xl font-extrabold">{skill.name} — Verified Test</h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-2">
              Timed questions · passing score 70.
              Graded on our server — answers are never sent to your browser.
              Your best verified score appears on your profile for recruiters.
            </p>
            <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm text-ink-2">
              <li>⏱ Timer starts when you click start — auto-submits at 0.</li>
              <li>🔒 Tab-switching is counted (integrity flag at 5+).</li>
              <li>🧑‍💼 Log in first — attempts and scorecards are per-account (max 3 per 30 days).</li>
            </ul>
            {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <button onClick={start} className="btn-primary mt-8 w-full sm:w-auto">
              Start test
            </button>
            <div className="mt-4 flex justify-center gap-4">
              <Link href="/tests" className="text-sm text-ink-2 hover:text-accent">← All tests</Link>
              {!error && <Link href="/login?next=/tests" className="text-sm text-ink-2 hover:text-accent">Log in →</Link>}
            </div>
          </div>
        )}

        {/* ── LOADING ── */}
        {phase === "loading" && (
          <div className="card p-10 text-center text-sm text-ink-2">Loading questions…</div>
        )}

        {/* ── GRADING ── */}
        {phase === "grading" && (
          <div className="card p-10 text-center text-sm text-ink-2">Grading your test…</div>
        )}

        {/* ── RUNNING ── */}
        {phase === "running" && q && (
          <div>
            <div className="flex items-center justify-between">
              <span className="chip bg-tile text-ink-2">
                Question {current + 1} / {questions.length}
              </span>
              <span
                className={`chip font-mono ${secondsLeft < 60 ? "bg-red-50 text-red-600" : "bg-accent/10 text-accent"}`}
              >
                ⏱ {mm}:{ss}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-tile">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${((current + 1) / questions.length) * 100}%` }}
              />
            </div>

            <div className="card mt-5 p-6">
              {q.type === "mcq" ? (
                <>
                  <h2 className="text-lg font-bold leading-relaxed">{q.text}</h2>
                  <div className="mt-5 flex flex-col gap-2">
                    {q.options!.map((opt, i) => {
                      const picked = answers[q.id] === i;
                      return (
                        <button
                          key={i}
                          onClick={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                          className={`rounded-lg border px-4 py-3 text-left text-sm transition ${
                            picked
                              ? "border-accent bg-accent/5 font-semibold text-accent"
                              : "border-line hover:border-ink-3"
                          }`}
                        >
                          <span className="mr-2 font-mono text-xs text-ink-3">
                            {String.fromCharCode(65 + i)}
                          </span>
                          {opt}
                        </button>
                        );
                    })}
                  </div>
                </>
              ) : (
                <>
                  <span className="chip bg-charcoal/10 text-charcoal">💻 Coding challenge</span>
                  <h2 className="mt-3 text-lg font-bold leading-relaxed">{q.text}</h2>
                  <textarea
                    className="input mt-4 min-h-48 font-mono text-xs"
                    placeholder="// write your solution here (MVP: honor system — in production this runs in a sandboxed judge)"
                  />
                  <label className="mt-3 flex items-center gap-2 text-sm text-ink-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-[#FF8A5E]"
                      checked={answers[q.id] === 1}
                      onChange={(e) =>
                        setAnswers((a) => ({ ...a, [q.id]: e.target.checked ? 1 : 0 }))
                      }
                    />
                    I completed and tested this solution honestly
                  </label>
                </>
              )}
            </div>

            {tabSwitches >= 3 && (
              <p className="mt-3 text-center text-xs font-semibold text-amber-600">
                ⚠️ {tabSwitches} tab-switches detected — flagged at 5.
              </p>
            )}

            <div className="mt-5 flex justify-between">
              <button
                onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                disabled={current === 0}
                className="btn-ghost"
              >
                ← Previous
              </button>
              {current < questions.length - 1 ? (
                <button onClick={() => setCurrent((c) => c + 1)} className="btn-primary">
                  Next →
                </button>
              ) : (
                <button onClick={finish} className="btn-primary">
                  Submit test ✓
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── DONE ── */}
        {phase === "done" && result && (
          <div className="card p-8 text-center">
            <h1 className="text-2xl font-extrabold">
              {result.passed ? "Verified!" : "Not quite there yet"}
            </h1>
            <div className="mx-auto mt-6 flex max-w-sm items-center justify-center gap-8">
              <div>
                <div className="text-5xl font-extrabold text-accent">{result.score}</div>
                <div className="text-xs text-ink-2">score / 100</div>
              </div>
              <div className="h-12 w-px bg-line" />
              <div>
                <div className="text-3xl font-extrabold">{result.percentile}th</div>
                <div className="text-xs text-ink-2">percentile</div>
              </div>
            </div>
            <p className="mx-auto mt-4 max-w-md text-sm text-ink-2">
              {result.passed
                ? `Your ${skill.name} scorecard is now on your profile — visible to recruiters. It's valid for 6 months.`
                : `You need 70+ to verify. Review the explanations below, revisit the roadmap, and try again.`}
              {result.attemptsLeft > 0
                ? ` ${result.attemptsLeft} attempt${result.attemptsLeft === 1 ? "" : "s"} left this month.`
                : " That was your last attempt for 30 days."}
            </p>

            {/* server-returned review — explanations only exist after submission */}
            <div className="mt-8 space-y-4 text-left">
              {result.review.map((r) => (
                <div key={r.index} className="rounded-lg border border-line p-4">
                  <div className="flex items-start gap-2 text-sm font-semibold">
                    <span>{r.ok ? "✅" : "❌"}</span>
                    <span>Q{r.index}. {r.text}</span>
                  </div>
                  {r.correctText && (
                    <p className="mt-1 pl-6 text-xs text-ink-2">
                      Correct answer: <strong>{String.fromCharCode(65 + (r.correctIndex ?? 0))}. {r.correctText}</strong>
                    </p>
                  )}
                  <p className="mt-1 pl-6 text-xs text-ink-2">💡 {r.explanation}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {result.attemptsLeft > 0 && (
                <button onClick={start} className="btn-ghost">Retake test</button>
              )}
              <Link href="/profile" className="btn-primary">View my scorecard →</Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
