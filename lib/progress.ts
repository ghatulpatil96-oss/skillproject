// ─────────────────────────────────────────────────────────────
// Progress store — localStorage, namespaced PER USER so shared
// computers never leak progress between accounts. Cleared on
// logout. Only student-local convenience data lives here:
// roadmap topic checkmarks, a read-only score cache, saved and
// applied jobs. Scorecards / applications / recruiter & admin
// actions are SERVER data (attempts.json, applications.json,
// users.json) and are never sourced from this store.
// ─────────────────────────────────────────────────────────────
"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/components/SessionProvider";

const KEY_PREFIX = "skillbridge.v1";

export type ScoreEntry = { score: number; percentile: number; date: string };

export type ProgressState = {
  completedTopics: string[]; // topic ids
  scores: Record<string, ScoreEntry>; // skillId → best score CACHE (server attempts are truth)
  savedJobs: string[];
  appliedJobs: string[];
};

const EMPTY: ProgressState = {
  completedTopics: [],
  scores: {},
  savedJobs: [],
  appliedJobs: [],
};

function read(key: string): ProgressState {
  if (typeof window === "undefined") return EMPTY;
  try {
    return { ...EMPTY, ...JSON.parse(localStorage.getItem(key) ?? "{}") };
  } catch {
    return EMPTY;
  }
}

function write(key: string, state: ProgressState) {
  localStorage.setItem(key, JSON.stringify(state));
  window.dispatchEvent(new Event("sb-progress"));
}

/** Wipe every namespaced progress key (logout on a shared computer). */
function clearAll() {
  if (typeof window === "undefined") return;
  const doomed: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith(`${KEY_PREFIX}:`)) doomed.push(k);
  }
  doomed.forEach((k) => localStorage.removeItem(k));
  window.dispatchEvent(new Event("sb-progress"));
}

/** Global progress state hook (cross-tab via storage event + same-tab custom event). */
export function useProgress() {
  const { user } = useSession();
  const key = `${KEY_PREFIX}:${user?.id ?? "guest"}`;
  const [state, setState] = useState<ProgressState>(EMPTY);

  useEffect(() => {
    const sync = () => setState(read(key));
    sync();
    window.addEventListener("sb-progress", sync);
    window.addEventListener("storage", sync);
    // logout (sb-session detail = null) wipes every namespaced key
    const onSession = (e: Event) => {
      if ((e as CustomEvent).detail === null) {
        clearAll();
        setState(EMPTY);
      } else {
        sync(); // account switched → load that account's namespace
      }
    };
    window.addEventListener("sb-session", onSession);
    return () => {
      window.removeEventListener("sb-progress", sync);
      window.removeEventListener("storage", sync);
      window.removeEventListener("sb-session", onSession);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const mutate = (fn: (s: ProgressState) => ProgressState) => {
    const next = fn(read(key));
    write(key, next);
    setState(next);
  };

  return {
    state,
    toggleTopic(topicId: string) {
      mutate((s) => ({
        ...s,
        completedTopics: s.completedTopics.includes(topicId)
          ? s.completedTopics.filter((t) => t !== topicId)
          : [...s.completedTopics, topicId],
      }));
    },
    saveScore(skillId: string, score: number, percentile: number) {
      // cache only — the server attempt store is the source of truth
      const prev = read(key).scores[skillId];
      if (prev && prev.score >= score) return;
      mutate((s) => ({
        ...s,
        scores: {
          ...s.scores,
          [skillId]: { score, percentile, date: new Date().toISOString() },
        },
      }));
    },
    toggleSavedJob(jobId: string) {
      mutate((s) => ({
        ...s,
        savedJobs: s.savedJobs.includes(jobId)
          ? s.savedJobs.filter((j) => j !== jobId)
          : [...s.savedJobs, jobId],
      }));
    },
    applyToJob(jobId: string) {
      mutate((s) =>
        s.appliedJobs.includes(jobId)
          ? s
          : { ...s, appliedJobs: [...s.appliedJobs, jobId] }
      );
    },
  };
}

/** Percentage of topics completed across a roadmap's stages. */
export function roadmapProgress(
  stages: { topics: { id: string }[] }[],
  completed: string[]
): number {
  const all = stages.flatMap((s) => s.topics.map((t) => t.id));
  if (all.length === 0) return 0;
  const done = all.filter((id) => completed.includes(id)).length;
  return Math.round((done / all.length) * 100);
}
