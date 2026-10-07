"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress";

export default function TopicComplete({
  roadmapId,
  topicId,
  nextTopicId,
  nextTopicTitle,
  checkpointSkillId,
  isLastOfStage,
}: {
  roadmapId: string;
  topicId: string;
  nextTopicId: string | null;
  nextTopicTitle: string | null;
  checkpointSkillId: string | null;
  isLastOfStage: boolean;
}) {
  const { state, toggleTopic } = useProgress();
  const done = state.completedTopics.includes(topicId);

  return (
    <div className="card my-8 flex flex-wrap items-center justify-between gap-3 border-2 border-accent/20 bg-accent/5 p-5">
      <div>
        <p className="text-sm font-bold">
          {done ? "Topic completed — it counts toward your roadmap progress." : "Finished the notes, practice, and quiz?"}
        </p>
        {isLastOfStage && checkpointSkillId && done && (
          <p className="mt-0.5 text-xs text-ink-2">
            End of this stage — prove it:{" "}
            <Link href={`/tests/${checkpointSkillId}`} className="font-semibold text-accent hover:underline">
              take the checkpoint test →
            </Link>
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => toggleTopic(topicId)} className={done ? "btn-ghost h-10" : "btn-primary h-10"}>
          {done ? "Mark as not done" : "Mark topic complete"}
        </button>
        {done && nextTopicId && (
          <Link href={`/roadmaps/${roadmapId}/${nextTopicId}`} className="btn-dark h-10">
            Next: {nextTopicTitle} →
          </Link>
        )}
      </div>
    </div>
  );
}
