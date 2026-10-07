// ─────────────────────────────────────────────────────────────
// Guard: every roadmap topic must have an authored MDX lesson.
// Run: npm run check:lessons   (exit 1 on missing coverage)
// ─────────────────────────────────────────────────────────────
import { readFileSync, existsSync, readdirSync } from "fs";

const dataSrc = readFileSync("lib/data.ts", "utf-8");

// topic ids live in ROADMAPS stage topics: { id: "fe-t1", ... }
const topicIds = [...dataSrc.matchAll(/id:\s*"(?:fe|be|da|qa)-t\d+"/g)].map(
  (m) => m[0].match(/"([^"]+)"/)[1]
);
const unique = [...new Set(topicIds)];

let missing = 0;
for (const id of unique) {
  if (!existsSync(`content/lessons/${id}.mdx`)) {
    console.error(`MISSING lesson: content/lessons/${id}.mdx`);
    missing++;
  }
}

const files = readdirSync("content/lessons").filter((f) => f.endsWith(".mdx"));
const orphans = files.filter((f) => !unique.includes(f.replace(/\.mdx$/, "")));
for (const o of orphans) console.warn(`orphan lesson (no matching topic): ${o}`);

console.log(`topics: ${unique.length} · lessons: ${files.length} · missing: ${missing}`);
process.exit(missing > 0 ? 1 : 0);
