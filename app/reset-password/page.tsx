"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    setToken(fragment.get("token") ?? "");
    if (window.location.hash) {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    }
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword, confirmPassword }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string; redirect?: string };
      if (!response.ok) {
        setError(data.error ?? "Could not reset your password.");
        return;
      }
      router.replace(data.redirect ?? "/login");
      router.refresh();
    } catch {
      setError("Could not reset your password. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-extrabold">Set a new password</h1>
        <p className="mt-2 text-sm text-ink-2">Choose a password with at least 10 characters.</p>
        {!token ? (
          <p role="alert" className="mt-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            This reset link is invalid or incomplete. Request a new link.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
            <div>
              <label className="label" htmlFor="newPassword">New password</label>
              <input
                id="newPassword"
                type={visible ? "text" : "password"}
                autoComplete="new-password"
                className="input"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="confirmPassword">Confirm new password</label>
              <input
                id="confirmPassword"
                type={visible ? "text" : "password"}
                autoComplete="new-password"
                className="input"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </div>
            <button
              type="button"
              onClick={() => setVisible((current) => !current)}
              className="self-start text-sm font-semibold text-accent hover:underline"
              aria-label={visible ? "Hide password" : "Show password"}
            >
              {visible ? "Hide passwords" : "Show passwords"}
            </button>
            {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? "Saving…" : "Reset password"}
            </button>
          </form>
        )}
        <p className="mt-5 text-center text-sm">
          <Link href="/login" className="font-semibold text-accent hover:underline">Back to log in</Link>
        </p>
      </section>
    </main>
  );
}
