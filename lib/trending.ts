// ─────────────────────────────────────────────────────────────
// Trending skills — typed loader for data/trending-skills.json.
// Content lives in the JSON file (PRD §7/§8.6): add or retire a
// track there without touching page code.
// ─────────────────────────────────────────────────────────────
import rawData from "@/data/trending-skills.json";

export type SourceType =
  | "official_docs"
  | "education_platform"
  | "accredited_course"
  | "standards_body";

export type Resource = {
  title: string;
  url: string;
  source_type: SourceType;
  verified_by: string;
  last_checked_date: string;
};

export type Milestone = {
  order: number;
  title: string;
  resources: Resource[];
};

export type TrendingSkill = {
  skill_id: string;
  title: string;
  category: string;
  summary: string;
  trend_note: string;
  last_reviewed: string;
  milestones: Milestone[];
};

export const TRENDING_SKILLS = rawData as TrendingSkill[];

export const SOURCE_LABEL: Record<SourceType, string> = {
  official_docs: "Official docs",
  education_platform: "Education platform",
  accredited_course: "Accredited course",
  standards_body: "Standards body",
};

export const SOURCE_DETAIL: Record<SourceType, string> = {
  official_docs: "First-party documentation from the vendor or project itself.",
  education_platform: "Established open-education platform with editorial or community review.",
  accredited_course: "Structured course from an accredited/recognized provider.",
  standards_body: "Published by a standards body or non-profit (e.g. OWASP, NIST).",
};

export function trendingById(id: string): TrendingSkill | undefined {
  return TRENDING_SKILLS.find((s) => s.skill_id === id);
}

export function trendingCategories(): string[] {
  return [...new Set(TRENDING_SKILLS.map((s) => s.category))].sort();
}

export function trendingResourceCount(skill: TrendingSkill): number {
  return skill.milestones.reduce((a, m) => a + m.resources.length, 0);
}
