"use client";

import { useState } from "react";

export type QuizQuestion = {
  q: string;
  options: string[];
  answer: number;
  why: string;
};

function Question({
  item,
  index,
  answered,
  onAnswer,
}: {
  item: QuizQuestion;
  index: number;
  answered: number | null;
  onAnswer: (i: number) => void;
}) {
  const correct = answered === item.answer;
  return (
    <div className="border-b border-line py-4 last:border-b-0">
      <p className="text-sm font-semibold">
        <span className="tnum mr-2 text-accent">{index + 1}.</span>
        {item.q}
      </p>
      <div className="mt-3 flex flex-col gap-1.5">
        {item.options.map((opt, i) => {
          const picked = answered === i;
          const reveal = answered !== null;
          const cls = !reveal
            ? "border-line hover:border-accent hover:text-accent"
            : i === item.answer
              ? "border-verify/50 bg-verify/5 text-verify"
              : picked
                ? "border-red-300 bg-red-50 text-red-700"
                : "border-line text-ink-3";
          return (
            <button
              key={i}
              onClick={() => answered === null && onAnswer(i)}
              disabled={answered !== null}
              className={`rounded-lg border px-3.5 py-2 text-left text-sm transition ${cls}`}
            >
              <span className="mr-2 font-mono text-xs">{String.fromCharCode(65 + i)}</span>
              {opt}
              {reveal && i === item.answer && <span className="ml-2 font-bold">✓</span>}
              {reveal && picked && i !== item.answer && <span className="ml-2 font-bold">✗</span>}
            </button>
          );
        })}
      </div>
      {answered !== null && (
        <p className={`mt-2.5 rounded-lg px-3 py-2 text-xs leading-relaxed ${correct ? "bg-verify/5 text-verify" : "bg-red-50 text-red-700"}`}>
          {correct ? "Correct — " : "Not quite — "}
          {item.why}
        </p>
      )}
    </div>
  );
}

export default function Quiz({
  questions,
  title = "Self-check",
}: {
  questions: QuizQuestion[];
  title?: string;
}) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const answeredCount = answers.filter((a) => a !== null).length;
  const score = answers.filter((a, i) => a === questions[i].answer).length;
  const allDone = answeredCount === questions.length;
  const passed = allDone && score === questions.length;

  function answer(qi: number, oi: number) {
    setAnswers((prev) => prev.map((a, i) => (i === qi ? oi : a)));
  }

  return (
    <div className="card my-6 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-base font-bold">{title}</h3>
        <div className="flex items-center gap-3">
          {allDone && (
            <span className={`chip ${passed ? "bg-verify/10 text-verify" : "bg-gold/15 text-amber-800"}`}>
              {score}/{questions.length} {passed ? "— solid" : "— review the misses above"}
            </span>
          )}
          <button
            onClick={() => setAnswers(questions.map(() => null))}
            className="font-mono text-[11px] text-ink-3 underline-offset-2 hover:text-accent hover:underline"
          >
            reset
          </button>
        </div>
      </div>
      <div className="mt-1">
        {questions.map((item, i) => (
          <Question key={i} item={item} index={i} answered={answers[i]} onAnswer={(oi) => answer(i, oi)} />
        ))}
      </div>
    </div>
  );
}
