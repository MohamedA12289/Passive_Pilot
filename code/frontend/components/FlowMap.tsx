"use client";

import "leaflet/dist/leaflet.css";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { LatLngBoundsExpression } from "leaflet";
import L from "leaflet";

import { geocodeNominatim, type GeocodeResult } from "@/lib/geocode";

// Fix Leaflet marker icons in Next.js / Webpack
const defaultIcon = L.icon({
  iconRetinaUrl: new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url).toString(),
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).toString(),
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url).toString(),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

// Dynamically import react-leaflet to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });

type Props = {
  value?: GeocodeResult | null;
  onChange?: (next: GeocodeResult | null) => void;
  placeholder?: string;
};

export default function FlowMap({ value, onChange, placeholder }: Props) {
  const [query, setQuery] = useState<string>(value?.displayName || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Map refs
  const mapRef = useRef<any>(null);

  const center = useMemo(() => {
    if (value) return [value.lat, value.lon] as [number, number];
    // Default: US center-ish
    return [39.5, -98.35] as [number, number];
  }, [value]);

  const zoom = useMemo(() => (value ? 12 : 4), [value]);

  useEffect(() => {
    // Keep input in sync when parent changes
    if (value?.displayName) setQuery(value.displayName);
  }, [value?.displayName]);

  function fitTo(result: GeocodeResult) {
    const map = mapRef.current;
    if (!map) return;

    if (result.bbox) {
      const [south, north, west, east] = result.bbox;
      const bounds: LatLngBoundsExpression = [
        [south, west],
        [north, east],
      ];
      map.fitBounds(bounds, { padding: [30, 30] });
    } else {
      map.setView([result.lat, result.lon], 12, { animate: true });
    }
  }

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
      fitTo(hit);
    } catch (e: any) {
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

      <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950/40">
        <div className="h-[420px]">
          <MapContainer
            center={center}
            zoom={zoom}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
            ref={(r) => {
              // react-leaflet v4 stores the Leaflet map at r
              mapRef.current = (r as any) || null;
            }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {value ? <Marker position={[value.lat, value.lon]} /> : null}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
