"use client";

import { useState } from "react";
import { CONTACT_EMAIL } from "@/lib/site-content";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("General question");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      // delivered like any platform email: Resend in prod, Dev Inbox locally
      const res = await fetch("/api/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: CONTACT_EMAIL,
          subject: `[Contact · ${topic}] ${name}`,
          html: `
            <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
            <p><strong>Topic:</strong> ${topic}</p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:12px 0" />
            <p>${message.replace(/\n/g, "<br/>")}</p>
          `,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Could not send your message.");
      }
      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send your message.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="card bg-green-50 p-8 text-center">
        <div className="text-4xl">✅</div>
        <h2 className="mt-3 text-xl font-extrabold">Message sent!</h2>
        <p className="mt-2 text-sm text-ink-2">
          Thanks, {name.split(" ")[0] || "friend"} — we&apos;ll reply to{" "}
          <strong>{email}</strong> within two working days.
        </p>
        <p className="mt-3 text-xs text-ink-3">
          You can see it land in the <a href="/dev-inbox" className="font-semibold text-accent hover:underline">Dev Inbox</a>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card flex flex-col gap-4 p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="c-name">Your name</label>
          <input id="c-name" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ananya Sharma" required minLength={2} />
        </div>
        <div>
          <label className="label" htmlFor="c-email">Email</label>
          <input id="c-email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="c-topic">Topic</label>
        <select id="c-topic" className="input" value={topic} onChange={(e) => setTopic(e.target.value)}>
          <option>General question</option>
          <option>Recruiter / hiring plans</option>
          <option>College partnership</option>
          <option>Bug report</option>
          <option>Feedback</option>
        </select>
      </div>
      <div>
        <label className="label" htmlFor="c-msg">Message</label>
        <textarea id="c-msg" className="input min-h-[140px] py-3" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us what's on your mind…" required minLength={10} />
      </div>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={status === "sending"} className="btn-primary w-full">
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
