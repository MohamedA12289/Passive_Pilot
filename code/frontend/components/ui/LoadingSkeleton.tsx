"use client";

type Props = {
  lines?: number;
  className?: string;
};

export default function LoadingSkeleton({ lines = 6, className = "" }: Props) {
  const widths = ["w-11/12", "w-10/12", "w-9/12"]; // cycle

  return (
    <div className={`w-full rounded-2xl border border-neutral-800 bg-neutral-950/60 p-6 ${className}`}>
      <div className="animate-pulse space-y-4">
        <div className="h-5 w-56 rounded bg-neutral-800" />

        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className={`h-3 rounded bg-neutral-800 ${widths[i % widths.length]}`} />
        ))}

        <div className="h-10 w-40 rounded-xl bg-neutral-800" />
      </div>
    </div>
  );
}
