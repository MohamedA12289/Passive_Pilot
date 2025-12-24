"use client";

import React, { useMemo, useState } from "react";
import type { Filters } from "@/lib/flowStore";

function num(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export function FiltersForm({
  value,
  onChange,
}: {
  value?: Filters;
  onChange: (next: Filters) => void;
}) {
  const [local, setLocal] = useState<Filters>(() => value ?? {});

  const cleaned = useMemo(() => ({ ...(value ?? {}), ...(local ?? {}) }), [value, local]);

  function patch(p: Partial<Filters>) {
    const next = { ...cleaned, ...p };
    setLocal(next);
    onChange(next);
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-semibold text-zinc-100">Equity</div>
        <label className="mt-2 block text-xs text-zinc-400">Min equity %</label>
        <input
          className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950/50 px-3 py-2 text-sm text-zinc-100"
          type="number"
          min={0}
          max={100}
          value={cleaned.equityMinPct ?? ""}
          onChange={(e) => patch({ equityMinPct: num(e.target.value) })}
          placeholder="e.g. 30"
        />
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-semibold text-zinc-100">Property flags</div>
        <div className="mt-3 space-y-2">
          <label className="flex items-center gap-2 text-sm text-zinc-200">
            <input
              type="checkbox"
              checked={!!cleaned.absentee}
              onChange={(e) => patch({ absentee: e.target.checked })}
            />
            Absentee owner
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-200">
            <input type="checkbox" checked={!!cleaned.vacant} onChange={(e) => patch({ vacant: e.target.checked })} />
            Vacant
          </label>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-semibold text-zinc-100">Beds / Baths</div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-zinc-400">Min beds</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950/50 px-3 py-2 text-sm text-zinc-100"
              type="number"
              min={0}
              value={cleaned.minBeds ?? ""}
              onChange={(e) => patch({ minBeds: num(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400">Min baths</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950/50 px-3 py-2 text-sm text-zinc-100"
              type="number"
              min={0}
              step="0.5"
              value={cleaned.minBaths ?? ""}
              onChange={(e) => patch({ minBaths: num(e.target.value) })}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-semibold text-zinc-100">Year built</div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-zinc-400">Min</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950/50 px-3 py-2 text-sm text-zinc-100"
              type="number"
              value={cleaned.yearBuiltMin ?? ""}
              onChange={(e) => patch({ yearBuiltMin: num(e.target.value) })}
              placeholder="1900"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400">Max</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950/50 px-3 py-2 text-sm text-zinc-100"
              type="number"
              value={cleaned.yearBuiltMax ?? ""}
              onChange={(e) => patch({ yearBuiltMax: num(e.target.value) })}
              placeholder="2025"
            />
          </div>
        </div>
      </div>

      <div className="md:col-span-2 rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-semibold text-zinc-100">Last sale</div>
        <label className="mt-2 block text-xs text-zinc-400">Only properties sold before</label>
        <input
          className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950/50 px-3 py-2 text-sm text-zinc-100"
          type="date"
          value={cleaned.lastSaleBefore ?? ""}
          onChange={(e) => patch({ lastSaleBefore: e.target.value || undefined })}
        />
      </div>
    </div>
  );
}
