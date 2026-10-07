import type { MetadataRoute } from "next";
import { ROADMAPS, SKILLS } from "@/lib/data";
import { TRENDING_SKILLS } from "@/lib/trending";
import { getSiteUrl } from "@/lib/site";

const BASE = getSiteUrl();

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPages = ["", "/about", "/contact", "/privacy", "/terms", "/jobs", "/roadmaps", "/trending", "/tests", "/login", "/signup"].map(
    (p) => ({ url: `${BASE}${p}`, lastModified: now }),
  );
  const roadmapPages = ROADMAPS.map((r) => ({ url: `${BASE}/roadmaps/${r.id}`, lastModified: now }));
  const testPages = SKILLS.map((s) => ({ url: `${BASE}/tests/${s.id}`, lastModified: now }));
  const trendingPages = TRENDING_SKILLS.map((t) => ({ url: `${BASE}/trending/${t.skill_id}`, lastModified: now }));

  return [...staticPages, ...roadmapPages, ...testPages, ...trendingPages];
}
