// ─────────────────────────────────────────────────────────────
// MDX lesson loader (server-only). Lessons live in
// content/lessons/<topicId>.mdx; next-mdx-remote v6 compiles
// during server render (RSC), so we just read + extract meta.
// ─────────────────────────────────────────────────────────────
import { promises as fs } from "fs";
import path from "path";

const LESSONS_DIR = path.join(process.cwd(), "content", "lessons");

export type LessonMeta = {
  topicId: string;
  title: string;
  minutes: number;
  blurb: string;
};

const META_RE = /\/\*\s*lesson-meta\s*(\{[\s\S]*?\})\s*\*\//;

export type LoadedLesson = {
  meta: LessonMeta;
  /** raw MDX (meta comment stripped) — compiled during RSC render */
  source: string;
};

export async function loadLessonMdx(topicId: string): Promise<LoadedLesson | null> {
  // sanitize: topicId is a URL param — allow only safe chars
  if (!/^[a-z0-9-]+$/.test(topicId)) return null;
  const file = path.join(LESSONS_DIR, `${topicId}.mdx`);
  let raw: string;
  try {
    raw = await fs.readFile(file, "utf-8");
  } catch {
    return null;
  }
  const m = raw.match(META_RE);
  if (!m) return null;
  let meta: LessonMeta;
  try {
    meta = JSON.parse(m[1]) as LessonMeta;
  } catch {
    return null;
  }
  return { meta, source: raw.replace(META_RE, "").trim() };
}

/** Topic ids that have an authored MDX lesson on disk. */
export async function availableMdxTopics(): Promise<Set<string>> {
  try {
    const files = await fs.readdir(LESSONS_DIR);
    return new Set(files.filter((f) => f.endsWith(".mdx")).map((f) => f.slice(0, -4)));
  } catch {
    return new Set();
  }
}
