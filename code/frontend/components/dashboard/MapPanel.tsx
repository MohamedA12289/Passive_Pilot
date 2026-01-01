"use client";

import { Search, SlidersHorizontal, MapPin, Navigation, Crosshair } from "lucide-react";

type MapPoint = {
  id: string;
  x: number;
  y: number;
  label: string;
};

type MapPanelProps = {
  points: MapPoint[];
};

export function MapPanel({ points }: MapPanelProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/15 bg-gradient-to-br from-neutral-900/90 via-black to-neutral-950 shadow-[0_20px_60px_rgba(0,0,0,0.65)]">
      <div className="flex items-center justify-between border-b border-amber-500/10 bg-black/40 px-4 py-3 text-sm text-amber-100/80">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full border border-amber-500/20 bg-black/60 px-3 py-1.5">
            <Search className="h-4 w-4 text-amber-300" />
            <input
              className="bg-transparent text-xs text-amber-50 placeholder:text-amber-100/50 focus:outline-none"
              placeholder="Search city or ZIP"
              defaultValue="Atlanta, GA"
            />
          </div>
          <button className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-100 hover:border-amber-400/60 hover:text-amber-50">
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button className="rounded-full border border-amber-500/20 bg-black/60 px-3 py-1.5 text-amber-100/80 hover:border-amber-400/60 hover:text-amber-50">Save Search</button>
          <button className="rounded-full border border-amber-500/20 bg-black/60 px-3 py-1.5 text-amber-100/80 hover:border-amber-400/60 hover:text-amber-50">Share</button>
        </div>
      </div>

      <div className="relative h-[460px] w-full">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.12),transparent_40%),radial-gradient(circle_at_70%_60%,rgba(251,191,36,0.08),transparent_40%),linear-gradient(135deg,rgba(255,255,255,0.02),rgba(0,0,0,0.15))]" />
        <div className="absolute inset-3 rounded-2xl border border-amber-500/10 bg-[url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-40" aria-hidden />
        <div className="absolute inset-0">
          {points.map((point) => (
            <div
              key={point.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
            >
              <div className="relative flex items-center gap-2 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-amber-50 shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-black shadow-lg shadow-amber-500/50">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] text-amber-100/80">{point.label}</p>
                  <p className="text-[10px] text-amber-200">$210k · 4bd · 2ba</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-amber-500/20 bg-black/70 px-3 py-1.5 text-xs text-amber-100/80 backdrop-blur">
          <Navigation className="h-4 w-4 text-amber-300" />
          <span>In-app drive time estimates coming soon</span>
        </div>
        <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full border border-amber-500/20 bg-black/70 px-3 py-1.5 text-xs text-amber-100/80 backdrop-blur">
          <Crosshair className="h-4 w-4 text-amber-300" />
          <span>Draw regions to refine search</span>
        </div>
      </div>
    </div>
  );
}

export default MapPanel;
