"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <span className="text-6xl">🛠️</span>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight">Something went wrong</h1>
      <p className="mt-3 max-w-md text-ink-2">
        An unexpected error occurred{error.digest ? ` (ref: ${error.digest})` : ""}. It&apos;s
        us, not you — try again, and if it keeps happening please{" "}
        <a href="/contact" className="font-semibold text-accent hover:underline">tell us</a>.
      </p>
      <button onClick={reset} className="btn-primary mt-8">Try again</button>
    </main>
  );
}
