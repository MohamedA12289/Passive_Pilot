"use client";

import "leaflet/dist/leaflet.css";
import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function FitController({ center, bbox }: { center?: { lat: number; lng: number }; bbox?: [number, number, number, number] }) {
  const map = useMap();

  useEffect(() => {
    if (bbox) {
      const [s, w, n, e] = bbox;
      const bounds = L.latLngBounds(L.latLng(s, w), L.latLng(n, e));
      map.fitBounds(bounds, { padding: [24, 24] });
      return;
    }
    if (center) map.setView([center.lat, center.lng], 12);
  }, [bbox, center, map]);

  return null;
}

export default function LeafletMapInner({
  center,
  bbox,
  label,
}: {
  center?: { lat: number; lng: number };
  bbox?: [number, number, number, number];
  label?: string;
}) {
  const initial = center ?? { lat: 38.9072, lng: -77.0369 }; // DC
  return (
    <div className="h-[420px] w-full overflow-hidden rounded-2xl border border-zinc-900/70">
      <MapContainer center={[initial.lat, initial.lng]} zoom={10} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitController center={center} bbox={bbox} />
        {center ? (
          <Marker position={[center.lat, center.lng]}>
            <Popup>{label || "Selected area"}</Popup>
          </Marker>
        ) : null}
      </MapContainer>
    </div>
  );
}
