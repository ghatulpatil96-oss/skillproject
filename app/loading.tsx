export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-16 sm:px-6">
      <div className="mx-auto h-8 w-64 rounded-lg bg-tile" />
      <div className="mx-auto mt-4 h-4 w-96 max-w-full rounded bg-tile" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card h-40 p-5">
            <div className="h-10 w-10 rounded-lg bg-tile" />
            <div className="mt-4 h-4 w-3/4 rounded bg-tile" />
            <div className="mt-2 h-3 w-1/2 rounded bg-tile" />
          </div>
        ))}
      </div>
    </div>
  );
}
