#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// Link checker for data/trending-skills.json (PRD §8.5).
// Pings every resource URL, flags dead/redirected links, and
// reports stale last_checked_date (> 6 months).
//
// Usage:
//   node scripts/check-links.mjs            # report only
//   node scripts/check-links.mjs --write    # update last_checked_date for passing links
// Exit code 1 if any link fails (CI-friendly).
// ─────────────────────────────────────────────────────────────
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const DATA_FILE = path.join(process.cwd(), "data", "trending-skills.json");
const WRITE = process.argv.includes("--write");
const STALE_MS = 6 * 30 * 24 * 60 * 60 * 1000; // 6 months
const UA =
  "Mozilla/5.0 (compatible; SkillBridgeLinkChecker/1.0; +https://skillbridge.local/bot)";

function collectResources(skills) {
  const out = [];
  for (const skill of skills) {
    for (const ms of skill.milestones) {
      for (const res of ms.resources) {
        out.push({ skill: skill.skill_id, milestone: ms.order, ...res });
      }
    }
  }
  return out;
}

async function checkUrl(url) {
  // try HEAD first; some hosts (e.g. GitHub) reject HEAD, fall back to GET
  for (const method of ["HEAD", "GET"]) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(url, {
        method,
        redirect: "follow",
        signal: controller.signal,
        headers: { "User-Agent": UA },
      });
      clearTimeout(timer);
      // 200-399 ok; 405 means method not allowed → retry with GET; 429 treat as ok-ish (rate limited)
      if (res.ok || res.status === 429) {
        const finalUrl = res.url;
        const redirected = finalUrl && finalUrl !== url && !finalUrl.startsWith(url);
        return { ok: true, status: res.status, redirected, finalUrl };
      }
      if (res.status === 405 && method === "HEAD") continue; // fall through to GET
      return { ok: false, status: res.status };
    } catch (err) {
      if (method === "GET") return { ok: false, status: 0, error: err.message };
    }
  }
}

const skills = JSON.parse(readFileSync(DATA_FILE, "utf-8"));
const resources = collectResources(skills);
console.log(`Checking ${resources.length} resources across ${skills.length} skills…\n`);

let pass = 0, redirect = 0, fail = 0, stale = 0;
const failures = [];
const staleList = [];
const today = new Date().toISOString().slice(0, 10);

for (const r of resources) {
  const result = await checkUrl(r.url);
  const age = Date.now() - new Date(r.last_checked_date).getTime();
  const isStale = age > STALE_MS;

  if (!result.ok) {
    fail++;
    failures.push({ ...r, ...result });
    console.log(`✗ DEAD    [${result.status}] ${r.url}`);
  } else if (result.redirected) {
    redirect++;
    console.log(`↷ REDIRECT (${result.status} → ${result.finalUrl}) ${r.url}`);
    if (WRITE && !isStale) markChecked(skills, r, today);
  } else {
    pass++;
    console.log(`✓ OK      (${result.status}) ${r.url}`);
  }

  if (isStale) {
    stale++;
    staleList.push(`${r.skill_id} m${r.milestone}: ${r.title} (checked ${r.last_checked_date})`);
  }
  if (WRITE && result.ok && !result.redirected && !isStale) {
    // --write only refreshes dates for links that pass and aren't already fresh
  }
  if (WRITE && result.ok) markChecked(skills, r, today);
}

function markChecked(skills, target, date) {
  for (const skill of skills) {
    if (skill.skill_id !== target.skill) continue;
    for (const ms of skill.milestones) {
      if (ms.order !== target.milestone) continue;
      for (const res of ms.resources) {
        if (res.url === target.url) res.last_checked_date = date;
      }
    }
  }
}

console.log(`\n──── Summary ────`);
console.log(`OK: ${pass}  Redirected: ${redirect}  Dead: ${fail}  Stale (>6mo): ${stale}`);

if (fail > 0) {
  console.log(`\nDead links needing manual review:`);
  for (const f of failures) console.log(`  - [${f.skill} m${f.milestone}] ${f.title} → ${f.url}`);
  process.exitCode = 1;
}
if (stale > 0) {
  console.log(`\nStale resources to re-verify (PRD §9):`);
  for (const s of staleList) console.log(`  - ${s}`);
}

if (WRITE && fail === 0) {
  writeFileSync(DATA_FILE, JSON.stringify(skills, null, 2) + "\n");
  console.log(`\n✔ Updated last_checked_date → ${today} in ${path.basename(DATA_FILE)}`);
}
