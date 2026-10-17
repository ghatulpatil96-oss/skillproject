import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="tnum text-7xl font-semibold text-accent sm:text-8xl">404</p>
      <h1 className="mt-6 text-3xl sm:text-4xl">We could not find that page</h1>
      <p className="mt-3 max-w-md text-ink-2">
        The link may be old or mistyped. These pages are good places to pick up:
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary">Go home</Link>
        <Link href="/roadmaps" className="btn-ghost">Roadmaps</Link>
        <Link href="/trending" className="btn-ghost">Trending skills</Link>
        <Link href="/jobs" className="btn-ghost">Jobs</Link>
      </div>
    </main>
  );
}
