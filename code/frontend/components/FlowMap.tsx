"use client";

import { useEffect, useState } from "react";

import { geocodeNominatim, type GeocodeResult } from "@/lib/geocode";

type Props = {
  value?: GeocodeResult | null;
  onChange?: (next: GeocodeResult | null) => void;
  placeholder?: string;
};

export default function FlowMap({ value, onChange, placeholder }: Props) {
  const [query, setQuery] = useState<string>(value?.displayName || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Keep input in sync when parent changes
    if (value?.displayName) setQuery(value.displayName);
  }, [value?.displayName]);

  async function handleSearch() {
    setError(null);
    const q = query.trim();
    if (!q) {
      setError("Type a ZIP, city, or state first.");
      return;
    }

    setBusy(true);
    try {
      const hit = await geocodeNominatim(q);
      if (!hit) {
        setError("Couldn’t find that location. Try a different ZIP/city/state.");
        return;
      }
      onChange?.(hit);
    } catch {
      setError("Search failed. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 backdrop-blur p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <div className="text-sm text-zinc-300 mb-1">Target area</div>
            <div className="flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                placeholder={placeholder || "Enter ZIP, city, or state (e.g. 22182, Fairfax VA, Virginia)"}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-[var(--gold)]"
              />
              <button
                onClick={handleSearch}
                disabled={busy}
                className="shrink-0 rounded-xl bg-[var(--gold)] px-4 py-2 font-medium text-black hover:opacity-90 disabled:opacity-50"
              >
                {busy ? "Searching…" : "Search & Zoom"}
              </button>
            </div>
            {error ? <div className="mt-2 text-sm text-red-400">{error}</div> : null}
            {value ? (
              <div className="mt-2 text-xs text-zinc-400">
                Selected: <span className="text-zinc-200">{value.displayName}</span>
              </div>
            ) : (
              <div className="mt-2 text-xs text-zinc-500">Tip: you can still drag/zoom the map anytime.</div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950/60">
        <div className="h-[420px] bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
          {value ? (
            <div className="text-center space-y-1">
              <div className="text-sm text-zinc-400">Selected area</div>
              <div className="text-lg font-semibold text-white">{value.displayName}</div>
              <div className="text-xs text-zinc-500">
                {value.lat.toFixed(4)}, {value.lon.toFixed(4)}
              </div>
            </div>
          ) : (
            <div className="text-sm text-zinc-500">Map preview loads after a search.</div>
          )}
        </div>
      </div>
    </div>
  );
}
