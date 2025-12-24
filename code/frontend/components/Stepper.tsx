export type Step = {
  title: string;
  desc: string;
  href?: string;
};

export function Stepper({ steps }: { steps: Step[] }) {
  return (
    <ol className="space-y-3">
      {steps.map((s, idx) => (
        <li key={idx} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 rounded-full border border-zinc-800 bg-zinc-900 flex items-center justify-center text-sm font-semibold">
              {idx + 1}
            </div>
            {idx < steps.length - 1 ? <div className="w-px flex-1 bg-zinc-900 my-2" /> : null}
          </div>
          <div className="pt-1 min-w-0">
            <div className="font-medium">
              {s.href ? (
                <a className="underline decoration-zinc-700 hover:decoration-zinc-400" href={s.href}>
                  {s.title}
                </a>
              ) : (
                s.title
              )}
            </div>
            <div className="text-sm text-zinc-400">{s.desc}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}
