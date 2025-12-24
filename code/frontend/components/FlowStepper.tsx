"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type FlowStep = {
  key: string;
  title: string;
  href: (campaignId: string) => string;
};

export const FLOW_STEPS: FlowStep[] = [
  { key: "1-create", title: "Create", href: (id) => `/campaigns/${id}/flow/1-create` },
  { key: "2-map", title: "Map", href: (id) => `/campaigns/${id}/flow/2-map` },
  { key: "3-provider", title: "Provider", href: (id) => `/campaigns/${id}/flow/3-provider` },
  { key: "4-filters", title: "Filters", href: (id) => `/campaigns/${id}/flow/4-filters` },
  { key: "5-preview", title: "Preview", href: (id) => `/campaigns/${id}/flow/5-preview` },
  { key: "6-score", title: "Score", href: (id) => `/campaigns/${id}/flow/6-score` },
  { key: "7-export", title: "Export", href: (id) => `/campaigns/${id}/flow/7-export` },
  { key: "8-done", title: "Done", href: (id) => `/campaigns/${id}/flow/8-done` },
];

function stepIndexFromPath(pathname: string) {
  const m = pathname.match(/\/flow\/(\d+-[a-z-]+)/i);
  if (!m) return -1;
  const key = m[1];
  return FLOW_STEPS.findIndex((s) => s.key === key);
}

export function FlowStepper({ campaignId }: { campaignId: string }) {
  const pathname = usePathname();
  const activeIndex = stepIndexFromPath(pathname || "");

  return (
    <div className="rounded-2xl border border-zinc-900/70 bg-zinc-950/30 p-4">
      <div className="flex flex-wrap items-center gap-2">
        {FLOW_STEPS.map((s, idx) => {
          const href = s.href(campaignId);
          const active = idx === activeIndex;
          const done = activeIndex >= 0 && idx < activeIndex;

          return (
            <Link key={s.key} href={href} className="group">
              <div className="flex items-center gap-2">
                <span
                  className={[
                    "grid h-7 w-7 place-items-center rounded-full text-xs font-semibold",
                    done
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
                      : active
                        ? "bg-white/10 text-white border border-white/15"
                        : "bg-zinc-900/50 text-zinc-400 border border-zinc-800/70 group-hover:text-zinc-200 group-hover:border-zinc-700",
                  ].join(" ")}
                >
                  {idx + 1}
                </span>

                <span
                  className={[
                    "text-sm",
                    done ? "text-emerald-200" : active ? "text-zinc-100" : "text-zinc-400 group-hover:text-zinc-200",
                  ].join(" ")}
                >
                  {s.title}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-3 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}
