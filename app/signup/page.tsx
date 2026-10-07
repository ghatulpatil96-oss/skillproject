"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Role = "student" | "recruiter";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [college, setCollege] = useState("");
  const [gradYear, setGradYear] = useState("2027");
  const [company, setCompany] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name, email, password, role,
        college: role === "student" ? college : undefined,
        gradYear: role === "student" ? Number(gradYear) : undefined,
        company: role === "recruiter" ? company : undefined,
      }),
    });
    const data = (await res.json()) as { error?: string; user?: { role: string } };
    setBusy(false);
    if (!res.ok || !data.user) {
      setError(data.error ?? "Signup failed");
      return;
    }
    // update header instantly (SessionProvider listens for this)
    window.dispatchEvent(new CustomEvent("sb-session", { detail: data.user }));
    router.push(data.user.role === "recruiter" ? "/recruiter" : "/roadmaps");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-lg font-black text-white">S</span>
          <span className="text-xl font-extrabold">Skill<span className="text-accent">Bridge</span></span>
        </Link>

        <div className="card p-8">
          <h1 className="text-2xl font-extrabold">Create your account</h1>
          <p className="mt-1 text-sm text-ink-2">Free forever for students.</p>

          {/* role picker */}
          <div className="mt-5 grid grid-cols-2 gap-2">
            {(
              [
                { id: "student", label: "I'm a student", sub: "Learn & get hired" },
                { id: "recruiter", label: "I'm hiring", sub: "Find verified talent" },
              ] as const
            ).map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={`rounded-xl border-2 p-4 text-left transition ${
                  role === r.id ? "border-accent bg-accent/5" : "border-line hover:border-ink-3"
                }`}
              >
                <div className="text-sm font-bold">{r.label}</div>
                <div className="text-xs text-ink-2">{r.sub}</div>
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-5 flex flex-col gap-4">
            <div>
              <label className="label" htmlFor="name">Full name</label>
              <input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ananya Sharma" required minLength={2} />
            </div>
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input id="password" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" required minLength={8} />
            </div>

            {role === "student" ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label" htmlFor="college">College</label>
                  <input id="college" className="input" value={college} onChange={(e) => setCollege(e.target.value)} placeholder="VJTI Mumbai" />
                </div>
                <div>
                  <label className="label" htmlFor="year">Graduation year</label>
                  <select id="year" className="input" value={gradYear} onChange={(e) => setGradYear(e.target.value)}>
                    {["2026", "2027", "2028", "2029"].map((y) => <option key={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <label className="label" htmlFor="company">Company</label>
                <input id="company" className="input" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="PixelForge Labs" required />
                <p className="mt-1 text-xs text-ink-3">
                  Recruiter accounts are reviewed before posting jobs — you'll get an email when verified.
                </p>
              </div>
            )}

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? "Creating account…" : role === "recruiter" ? "Create recruiter account" : "Create free account"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-ink-2">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-accent hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
