"use client";

import React from "react";
import type { ProviderKey } from "@/lib/flowStore";

const OPTIONS: { key: ProviderKey; title: string; desc: string }[] = [
  { key: "dealmachine", title: "DealMachine", desc: "Use DealMachine leads (API key later)." },
  { key: "attom", title: "ATTOM", desc: "Use ATTOM property + owner data (API key later)." },
  { key: "manual_csv", title: "Manual CSV", desc: "Upload your own list and manage inside Passive Pilot." },
];

export function ProviderPicker({
  value,
  onChange,
}: {
  value?: ProviderKey;
  onChange: (next: ProviderKey) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {OPTIONS.map((o) => {
        const active = value === o.key;
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            className={[
              "text-left rounded-2xl border p-4 transition",
              active
                ? "border-white/20 bg-white/10"
                : "border-zinc-900/70 bg-zinc-950/30 hover:bg-zinc-950/50 hover:border-zinc-800",
            ].join(" ")}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-zinc-100">{o.title}</div>
                <div className="mt-1 text-xs text-zinc-400">{o.desc}</div>
              </div>
              <div
                className={[
                  "h-4 w-4 rounded-full border",
                  active ? "border-emerald-400/60 bg-emerald-400/20" : "border-white/15 bg-transparent",
                ].join(" ")}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}
