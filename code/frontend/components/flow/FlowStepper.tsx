"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Step = {
  n: number;
  title: string;
  href: (id: string) => string;
};

const STEPS: Step[] = [
  { n: 1, title: "Create", href: (id) => `/campaigns/${id}/flow/1-create` },
  { n: 2, title: "Map", href: (id) => `/campaigns/${id}/flow/2-map` },
  { n: 3, title: "Source", href: (id) => `/campaigns/${id}/flow/3-provider` },
  { n: 4, title: "Filters", href: (id) => `/campaigns/${id}/flow/4-filters` },
  { n: 5, title: "Preview", href: (id) => `/campaigns/${id}/flow/5-preview` },
  { n: 6, title: "Score", href: (id) => `/campaigns/${id}/flow/6-score` },
  { n: 7, title: "Export", href: (id) => `/campaigns/${id}/flow/7-export` },
  { n: 8, title: "Done", href: (id) => `/campaigns/${id}/flow/8-done` },
];

export function FlowStepper({ campaignId }: { campaignId: string }) {
  const pathname = usePathname();
  const current = (() => {
    const m = pathname.match(/\/flow\/(\d+)-/);
    return m ? Number(m[1]) : 1;
  })();

  return (
    <div className="w-full">
      <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          {STEPS.map((s) => {
            const active = s.n === current;
            const done = s.n < current;
            return (
              <Link
                key={s.n}
                href={s.href(campaignId)}
                className={cn(
                  "group inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm transition",
                  "border border-white/10 hover:border-white/20 hover:bg-white/5",
                  active && "border-yellow-400/40 bg-yellow-400/10 text-yellow-200",
                  done && "text-white/90"
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs",
                    active && "border-yellow-400/40 bg-yellow-400/10",
                    done && "border-white/20 bg-white/5",
                    !active && !done && "border-white/10 bg-black/30 text-white/70"
                  )}
                >
                  {s.n}
                </span>
                <span className={cn(active ? "font-semibold" : "text-white/80")}>
                  {s.title}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
