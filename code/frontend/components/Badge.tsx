export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "good" | "warn" | "bad" }) {
  const cls =
    tone === "good"
      ? "border-green-700 text-green-300"
      : tone === "warn"
      ? "border-yellow-700 text-yellow-300"
      : tone === "bad"
      ? "border-red-700 text-red-300"
      : "border-zinc-800 text-zinc-300";
  return <span className={`text-xs px-2 py-1 rounded-full border ${cls}`}>{children}</span>;
}
