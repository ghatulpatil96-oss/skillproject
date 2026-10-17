"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { safeNextForRole } from "@/lib/safe-next";
import type { Role } from "@/lib/types";

const DEMOS = [
  { label: "Student demo", email: "ananya@student.in", initial: "A" },
  { label: "Recruiter demo", email: "riya@pixelforge.dev", initial: "R" },
  { label: "Admin demo", email: "admin@skillbridge.local", initial: "S" },
];

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const rawNext = params.get("next");
  const signupParams = new URLSearchParams();
  if (rawNext) signupParams.set("next", rawNext);
  if (rawNext === "/recruiter" || rawNext?.startsWith("/recruiter/")) {
    signupParams.set("role", "recruiter");
  }
  const signupHref = signupParams.size ? `/signup?${signupParams.toString()}` : "/signup";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        user?: { role: Role };
      };
      if (!res.ok || !data.user) {
        setError(data.error ?? "Login failed. Please try again.");
        return;
      }
      window.dispatchEvent(new CustomEvent("sb-session", { detail: data.user }));

      const home =
        data.user.role === "recruiter"
          ? "/recruiter"
          : data.user.role === "admin"
            ? "/admin"
            : "/jobs";
      const target = safeNextForRole(
        rawNext,
        data.user.role,
        window.location.origin,
        home
      );
      router.push(target);
      router.refresh();
    } catch {
      setError("Could not log in. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-lg font-black text-white">S</span>
          <span className="text-xl font-extrabold">Skill<span className="text-accent">Bridge</span></span>
        </Link>

        <div className="card p-8">
          <h1 className="text-2xl font-extrabold">Welcome back</h1>
          <p className="mt-1 text-sm text-ink-2">Log in to continue.</p>

          <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input id="password" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? "Logging in…" : "Log in"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-ink-2">
            New here?{" "}
            <Link href={signupHref} className="font-semibold text-accent hover:underline">Create an account</Link>
          </p>
        </div>

        {/* demo accounts — only rendered when explicitly in demo mode */}
        {process.env.NEXT_PUBLIC_DEMO_MODE === "true" && (
          <div className="card mt-4 p-4">
            <p className="text-center text-xs font-semibold uppercase tracking-wide text-ink-3">Demo accounts — password: skillbridge123</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {DEMOS.map((d) => (
                <button
                  key={d.email}
                  onClick={() => { setEmail(d.email); setPassword("skillbridge123"); }}
                  className="flex flex-col items-center gap-1 rounded-lg border border-line py-3 text-xs font-semibold transition hover:border-accent hover:text-accent"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent font-display text-sm font-bold text-canvas">{d.initial}</span>
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}
