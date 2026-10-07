"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import { SKILLS } from "@/lib/data";

export default function PostJobPage() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("Remote, India");
  const [salary, setSalary] = useState("");
  const [type, setType] = useState<"Full-time" | "Internship">("Full-time");
  const [description, setDescription] = useState("");
  const [reqSkills, setReqSkills] = useState<{ skillId: string; minScore: number }[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSkill = (id: string) => {
    setReqSkills((rs) =>
      rs.some((r) => r.skillId === id)
        ? rs.filter((r) => r.skillId !== id)
        : [...rs, { skillId: id, minScore: 60 }]
    );
  };

  const setMinScore = (id: string, v: number) =>
    setReqSkills((rs) => rs.map((r) => (r.skillId === id ? { ...r, minScore: v } : r)));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, location, salary, type, description, skills: reqSkills }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Could not publish the job. Try again.");
      return;
    }
    router.push("/recruiter");
  }

  return (
    <div className="min-h-screen">
      <TopBar title="Post a job" />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-extrabold">Post a Job</h1>
        <p className="mt-1 text-sm text-ink-2">
          Define required verified skills + minimum scores. Your job goes live in the
          student feed instantly — applicants arrive ranked by verified-skill match.
        </p>

        <form onSubmit={submit} className="card mt-6 flex flex-col gap-5 p-6">
          <div>
            <label className="label" htmlFor="role">Job title</label>
            <input
              id="role"
              className="input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Junior React Developer"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label" htmlFor="loc">Location</label>
              <input id="loc" className="input" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="sal">Salary range</label>
              <input id="sal" className="input" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="₹5L – ₹8L" />
            </div>
            <div>
              <label className="label" htmlFor="type">Type</label>
              <select id="type" className="input" value={type} onChange={(e) => setType(e.target.value as typeof type)}>
                <option>Full-time</option>
                <option>Internship</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label" htmlFor="desc">Description</label>
            <textarea
              id="desc"
              className="input min-h-28"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will this person build? Why is your team a great place to learn?"
            />
          </div>

          <div>
            <span className="label">Required verified skills & minimum scores</span>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map((s) => {
                const req = reqSkills.find((r) => r.skillId === s.id);
                return (
                  <div
                    key={s.id}
                    className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                      req ? "border-accent bg-accent/5" : "border-line hover:border-ink-3"
                    }`}
                  >
                    <button type="button" onClick={() => toggleSkill(s.id)} className="flex items-center gap-1.5">
                      <span className={req ? "font-semibold text-accent" : ""}>{s.name}</span>
                    </button>
                    {req && (
                      <select
                        aria-label={`Minimum score for ${s.name}`}
                        value={req.minScore}
                        onChange={(e) => setMinScore(s.id, Number(e.target.value))}
                        className="rounded-full bg-accent/10 px-1.5 py-0.5 text-xs font-semibold text-accent"
                      >
                        {[40, 50, 60, 70, 80].map((n) => (
                          <option key={n} value={n}>{n}+</option>
                        ))}
                      </select>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={!role.trim() || reqSkills.length === 0 || busy}
            className="btn-primary"
          >
            {busy ? "Publishing…" : "Publish job — live in the student feed"}
          </button>
        </form>
      </main>
    </div>
  );
}
