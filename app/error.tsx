"use client";

function WrenchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-14 w-14 text-accent" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M14.7 6.3a4.5 4.5 0 0 0-6 6L3 18v3h3l5.7-5.7a4.5 4.5 0 0 0 6-6l-2.8 2.8-2.1-2.1 2.9-2.7z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <WrenchIcon />
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight">Something went wrong</h1>
      <p className="mt-3 max-w-md text-ink-2">
        An unexpected error occurred{error.digest ? ` (ref: ${error.digest})` : ""}.
        Try again. If it keeps failing, <a href="/contact" className="font-semibold text-accent hover:underline">tell us what you were doing</a> so we can fix it.
      </p>
      <button onClick={reset} className="btn-primary mt-8">Try again</button>
    </main>
  );
}
