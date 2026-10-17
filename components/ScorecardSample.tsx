"use client";

import Link from "next/link";
import { CANDIDATES } from "@/lib/roles";

/**
 * Sample verified scorecard — a labelled illustration of what a
 * verified profile looks like. Static; no 3D, no tilt, no ticker.
 * Numbers come from the clearly-marked sample data, never shown
 * as proof of real users.
 */
export default function ScorecardSample() {
  const sample = CANDIDATES[0];

  return (
    <figure className="card w-full max-w-md p-6">
      <figcaption className="flex items-center justify-between border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-tile text-sm font-bold text-ink">
            {sample.name
              .split(" ")
              .map((p) => p[0])
              .join("")}
          </span>
          <div>
            <div className="text-sm font-bold">{sample.name}</div>
            <div className="text-xs text-ink-3">
              Class of {sample.gradYear} · {sample.targetRole}
            </div>
          </div>
        </div>
        <span className="chip bg-verify/10 text-verify">Sample</span>
      </figcaption>

      <dl className="mt-4 space-y-2">
        {sample.skills.map((s) => (
          <div key={s.skillId} className="flex items-center gap-3 text-sm">
            <dt className="w-24 shrink-0 text-ink-2">{s.skillId}</dt>
            <dd className="flex flex-1 items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-tile">
                <div className="h-full rounded-full bg-verify" style={{ width: `${s.score}%` }} />
              </div>
              <span className="tnum w-12 text-right text-xs font-semibold">{s.score}</span>
              <span className="tnum w-16 text-right text-xs text-ink-3">p{s.percentile}</span>
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
        <span className="chip bg-verify/10 text-verify">Job-Ready badge earned</span>
        <Link href="/signup" className="text-xs font-semibold text-accent hover:underline">
          Build yours →
        </Link>
      </div>
      <p className="mt-2 text-[11px] text-ink-3">
        Sample profile shown for illustration; not a real student.
      </p>
    </figure>
  );
}
