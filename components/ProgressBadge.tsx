"use client";

import { roadmapById } from "@/lib/data";
import { useProgress, roadmapProgress } from "@/lib/progress";

/** Roadmap progress % pill — client component reading localStorage progress. */
export function RoadmapProgressBadge({ roadmapId }: { roadmapId: string }) {
  const { state } = useProgress();
  const roadmap = roadmapById(roadmapId);
  if (!roadmap) return null;
  const pct = roadmapProgress(roadmap.stages, state.completedTopics);
  return (
    <span
      className={`chip ${
        pct === 100 ? "bg-verify/10 text-verify" : pct > 0 ? "bg-accent/10 text-accent" : "bg-tile text-ink-2"
      }`}
    >
      {pct === 100 ? "✓ " : ""}{pct}% complete
    </span>
  );
}
