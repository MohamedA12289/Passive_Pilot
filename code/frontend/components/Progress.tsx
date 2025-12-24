export function Progress({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="w-full h-2 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden">
      <div className="h-full bg-white" style={{ width: `${pct}%` }} />
    </div>
  );
}
