"use client";

import Link from "next/link";
import { toolsCatalog } from "@/lib/toolsCatalog";

const special = [
  {
    title: "Saved Analyses",
    description: "Save analyzer results and generate share links.",
    href: "/tools/analysis",
    tags: ["analysis", "share", "saved"],
  },
  {
    title: "Share Links",
    description: "Open/copy share pages for buyers and partners.",
    href: "/tools/share",
    tags: ["share", "links"],
  },
];

export default function ToolsIndexPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
          Tools
        </h1>
        <p className="mt-2 text-zinc-300">
          Quick calculators, scripts, and resources — styled like the old Passive Pilot.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {special.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="group rounded-2xl border border-amber-500/20 bg-zinc-950/60 backdrop-blur p-5 hover:border-yellow-500/50 transition"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-white group-hover:text-yellow-200">
                  {t.title}
                </div>
                <div className="mt-1 text-sm text-zinc-300">{t.description}</div>
              </div>
              <div className="shrink-0 h-9 w-9 rounded-xl border border-amber-500/20 bg-amber-500/10 flex items-center justify-center text-yellow-300">
                →
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {t.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] px-2 py-1 rounded-full border border-zinc-800 bg-zinc-900/40 text-zinc-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}

        {toolsCatalog.map((t) => (
          <Link
            key={t.slug}
            href={`/tools/${t.slug}`}
            className="group rounded-2xl border border-zinc-800 bg-zinc-950/60 backdrop-blur p-5 hover:border-yellow-500/50 transition"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-white group-hover:text-yellow-200">
                  {t.title}
                </div>
                <div className="mt-1 text-sm text-zinc-300">{t.description}</div>
              </div>
              <div className="shrink-0 h-9 w-9 rounded-xl border border-zinc-800 bg-zinc-900/60 flex items-center justify-center text-yellow-300">
                →
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {t.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] px-2 py-1 rounded-full border border-zinc-800 bg-zinc-900/40 text-zinc-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
