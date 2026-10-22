"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/components/SessionProvider";

export default function LoginEmailPreference() {
  const { user } = useSession();
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) setEnabled(user.emailLoginNotifications !== false);
  }, [user]);

  async function updatePreference(nextEnabled: boolean) {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/auth/login-email-notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: nextEnabled }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Could not update this setting.");
        return;
      }
      setEnabled(nextEnabled);
      setMessage("Your preference has been saved.");
    } catch {
      setError("Could not update this setting. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card mt-6 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="font-bold">Security and email preferences</h2>
        <p className="mt-1 text-sm text-ink-2">
          Choose whether we email you when your account is used to log in.
          Password-change and password-reset emails are always sent.
        </p>
        {message && <p className="mt-2 text-sm text-verify">{message}</p>}
        {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
      <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={enabled}
            disabled={saving}
            onChange={(event) => void updatePreference(event.target.checked)}
            className="h-4 w-4 accent-accent"
          />
          Email me when I log in
        </label>
        <a href="/account/security" className="text-sm font-semibold text-accent hover:underline">
          Manage password and sessions →
        </a>
      </div>
    </section>
  );
}
