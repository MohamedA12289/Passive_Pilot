export function Card({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-4">
      <div className="font-medium">{title}</div>
      {subtitle ? <div className="mt-1 text-sm text-zinc-400">{subtitle}</div> : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
