"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setSent(false);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Could not process your request. Please try again.");
        return;
      }
      setSent(true);
    } catch {
      setError("Could not process your request. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-extrabold">Forgot your password?</h1>
        <p className="mt-2 text-sm text-ink-2">Enter the email address on your SkillBridge account.</p>
        <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          {sent && (
            <p role="status" className="rounded-lg bg-verify/10 px-3 py-2 text-sm text-verify">
              If that email exists, we&apos;ve sent a link.
            </p>
          )}
          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? "Sending…" : "Send reset link"}
          </button>
        </form>
        <p className="mt-5 text-center text-sm">
          <Link href="/login" className="font-semibold text-accent hover:underline">Back to log in</Link>
        </p>
      </section>
    </main>
  );
}
