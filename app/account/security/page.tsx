"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import { useSession } from "@/components/SessionProvider";

type PasswordField = "currentPassword" | "newPassword" | "confirmPassword";

const passwordFields: { name: PasswordField; label: string; autocomplete: string }[] = [
  { name: "currentPassword", label: "Current password", autocomplete: "current-password" },
  { name: "newPassword", label: "New password", autocomplete: "new-password" },
  { name: "confirmPassword", label: "Confirm new password", autocomplete: "new-password" },
];

export default function AccountSecurityPage() {
  const router = useRouter();
  const { user, loading } = useSession();
  const [values, setValues] = useState<Record<PasswordField, string>>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [visible, setVisible] = useState<Record<PasswordField, boolean>>({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [busy, setBusy] = useState(false);
  const [logoutBusy, setLogoutBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login?next=/account/security");
  }, [loading, user, router]);

  async function changePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch("/api/account/security/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Unable to change your password.");
        return;
      }
      setValues({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setSuccess("Your password has been changed. This device remains signed in; other sessions have been revoked.");
    } catch {
      setError("Could not change your password. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function logoutAllDevices() {
    if (!window.confirm("Log out of SkillBridge on all devices?")) return;
    setLogoutBusy(true);
    setLogoutError(null);
    try {
      const response = await fetch("/api/account/security/logout-all", { method: "POST" });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setLogoutError(data.error ?? "Could not log out of all devices.");
        return;
      }
      window.dispatchEvent(new CustomEvent("sb-session", { detail: null }));
      router.push("/login");
      router.refresh();
    } catch {
      setLogoutError("Could not log out of all devices. Check your connection and try again.");
    } finally {
      setLogoutBusy(false);
    }
  }

  return (
    <div className="min-h-screen">
      <TopBar title="Account security" />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link href="/profile" className="text-sm font-semibold text-accent hover:underline">
          ← Back to profile
        </Link>
        <section className="card mt-5 p-6 sm:p-8">
          <h1 className="text-2xl font-extrabold">Security</h1>
          <p className="mt-2 text-sm text-ink-2">
            Change your password. You’ll stay signed in on this device, and all other sessions will be revoked.
          </p>

          <form onSubmit={changePassword} className="mt-6 flex flex-col gap-4">
            {passwordFields.map((field) => (
              <div key={field.name}>
                <label className="label" htmlFor={field.name}>{field.label}</label>
                <div className="flex gap-2">
                  <input
                    id={field.name}
                    name={field.name}
                    type={visible[field.name] ? "text" : "password"}
                    autoComplete={field.autocomplete}
                    className="input min-w-0 flex-1"
                    value={values[field.name]}
                    onChange={(event) =>
                      setValues((previous) => ({ ...previous, [field.name]: event.target.value }))
                    }
                    required
                  />
                  <button
                    type="button"
                    className="rounded-lg border border-line px-3 text-sm font-semibold hover:bg-tile"
                    aria-label={`${visible[field.name] ? "Hide" : "Show"} ${field.label.toLowerCase()}`}
                    onClick={() =>
                      setVisible((previous) => ({ ...previous, [field.name]: !previous[field.name] }))
                    }
                  >
                    {visible[field.name] ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            ))}
            <p className="text-xs text-ink-3">Use at least 10 characters and avoid common passwords.</p>
            {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            {success && <p role="status" className="rounded-lg bg-verify/10 px-3 py-2 text-sm text-verify">{success}</p>}
            <button type="submit" disabled={busy} className="btn-primary w-full sm:w-auto">
              {busy ? "Changing password…" : "Change password"}
            </button>
          </form>
        </section>

        <section className="card mt-6 p-6 sm:p-8">
          <h2 className="text-lg font-bold">Sessions</h2>
          <p className="mt-1 text-sm text-ink-2">
            This signs you out everywhere, including this device.
          </p>
          {logoutError && <p role="alert" className="mt-3 text-sm text-red-600">{logoutError}</p>}
          <button
            type="button"
            disabled={logoutBusy}
            onClick={() => void logoutAllDevices()}
            className="mt-4 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
          >
            {logoutBusy ? "Signing out…" : "Log out of all devices"}
          </button>
        </section>
      </main>
    </div>
  );
}
