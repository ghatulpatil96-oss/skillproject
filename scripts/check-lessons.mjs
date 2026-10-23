// ─────────────────────────────────────────────────────────────
// Guard: every roadmap topic must have an authored MDX or structured lesson.
// Run: npm run check:lessons   (exit 1 on missing coverage)
// ─────────────────────────────────────────────────────────────
import { readFileSync, existsSync, readdirSync } from "fs";

const dataSrc = readFileSync("lib/data.ts", "utf-8");
const structuredLessonsSrc = readFileSync("lib/additional-lessons.ts", "utf-8");

// Topic ids use a roadmap prefix followed by "-t" and a number.
const topicIds = [...dataSrc.matchAll(/id:\s*"([a-z]+-t\d+)"/g)].map((m) => m[1]);
const unique = [...new Set(topicIds)];

let missing = 0;
for (const id of unique) {
  const hasMdx = existsSync(`content/lessons/${id}.mdx`);
  const hasStructuredLesson = structuredLessonsSrc.includes(`lesson("${id}"`);
  if (!hasMdx && !hasStructuredLesson) {
    console.error(`MISSING lesson: ${id}`);
    missing++;
  }
}

const files = readdirSync("content/lessons").filter((f) => f.endsWith(".mdx"));
const orphans = files.filter((f) => !unique.includes(f.replace(/\.mdx$/, "")));
for (const o of orphans) console.warn(`orphan lesson (no matching topic): ${o}`);

const structuredCount = unique.filter((id) => structuredLessonsSrc.includes(`lesson("${id}"`)).length;
console.log(`topics: ${unique.length} · MDX lessons: ${files.length} · structured lessons: ${structuredCount} · missing: ${missing}`);
process.exit(missing > 0 ? 1 : 0);
