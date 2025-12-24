import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-8">
        <div className="text-sm font-semibold text-yellow-500">Passive Pilot</div>
        <h1 className="mt-2 text-2xl font-bold text-neutral-100">Page not found</h1>
        <p className="mt-2 text-sm text-neutral-400">
          That route doesn’t exist (or you don’t have access yet).
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/tools"
            className="rounded-xl bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-400"
          >
            Go to Tools
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-neutral-800 bg-neutral-900/50 px-4 py-2 text-sm font-semibold text-neutral-100 hover:bg-neutral-900"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
