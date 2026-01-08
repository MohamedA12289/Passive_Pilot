"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import type { LeadProperty } from "@/lib/types";

interface LeadsMapPanelProps {
  properties: LeadProperty[];
  selectedPropertyId?: string;
  onPropertySelect?: (property: LeadProperty) => void;
  className?: string;
}

export default function LeadsMapPanel({
  properties,
  selectedPropertyId,
  onPropertySelect,
  className = "",
}: LeadsMapPanelProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const [mapLoaded, setMapLoaded] = useState(false);

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    if (!MAPBOX_TOKEN) {
      console.warn("NEXT_PUBLIC_MAPBOX_TOKEN is not set");
      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-98.5795, 39.8283],
      zoom: 4,
    });

    map.current.on("load", () => {
      setMapLoaded(true);

      // Add clustering source
      if (map.current) {
        map.current.addSource("properties", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50,
        });

        // Cluster circles
        map.current.addLayer({
          id: "clusters",
          type: "circle",
          source: "properties",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": "#d4af37",
            "circle-radius": ["step", ["get", "point_count"], 20, 10, 30, 50, 40],
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
          },
        });

        // Cluster count labels
        map.current.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "properties",
          filter: ["has", "point_count"],
          layout: {
            "text-field": "{point_count_abbreviated}",
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 12,
          },
          paint: {
            "text-color": "#000000",
          },
        });

        // Individual markers
        map.current.addLayer({
          id: "unclustered-point",
          type: "circle",
          source: "properties",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": "#d4af37",
            "circle-radius": 10,
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
          },
        });

        // Click on clusters to zoom
        map.current.on("click", "clusters", (e) => {
          const features = map.current?.queryRenderedFeatures(e.point, { layers: ["clusters"] });
          if (!features?.length) return;
          const clusterId = features[0].properties?.cluster_id;
          const source = map.current?.getSource("properties") as mapboxgl.GeoJSONSource;
          source?.getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err || !map.current) return;
            const geometry = features[0].geometry;
            if (geometry.type === "Point") {
              map.current.easeTo({
                center: geometry.coordinates as [number, number],
                zoom: zoom || 10,
              });
            }
          });
        });

        // Click on individual points
        map.current.on("click", "unclustered-point", (e) => {
          const features = e.features;
          if (!features?.length) return;
          const props = features[0].properties;
          if (props?.id) {
            const property = properties.find((p) => p.id === props.id);
            if (property) {
              onPropertySelect?.(property);
            }
          }
        });

        // Cursor changes
        map.current.on("mouseenter", "clusters", () => {
          if (map.current) map.current.getCanvas().style.cursor = "pointer";
        });
        map.current.on("mouseleave", "clusters", () => {
          if (map.current) map.current.getCanvas().style.cursor = "";
        });
        map.current.on("mouseenter", "unclustered-point", () => {
          if (map.current) map.current.getCanvas().style.cursor = "pointer";
        });
        map.current.on("mouseleave", "unclustered-point", () => {
          if (map.current) map.current.getCanvas().style.cursor = "";
        });
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [MAPBOX_TOKEN]);

  // Update markers when properties change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const source = map.current.getSource("properties") as mapboxgl.GeoJSONSource;
    if (!source) return;

    const features = properties
      .filter((p) => p.latitude && p.longitude)
      .map((p) => ({
        type: "Feature" as const,
        properties: {
          id: p.id,
          address: p.address,
          price: p.listPrice,
        },
        geometry: {
          type: "Point" as const,
          coordinates: [p.longitude, p.latitude],
        },
      }));

    source.setData({
      type: "FeatureCollection",
      features,
    });

    // Fit bounds
    if (properties.length > 0) {
      const validProps = properties.filter((p) => p.latitude && p.longitude);
      if (validProps.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        validProps.forEach((p) => bounds.extend([p.longitude, p.latitude]));
        map.current.fitBounds(bounds, { padding: 50, maxZoom: 12 });
      }
    }
  }, [properties, mapLoaded]);

  // Center on selected property
  useEffect(() => {
    if (!map.current || !mapLoaded || !selectedPropertyId) return;

    const property = properties.find((p) => p.id === selectedPropertyId);
    if (property?.latitude && property?.longitude) {
      map.current.flyTo({
        center: [property.longitude, property.latitude],
        zoom: 14,
        duration: 1000,
      });
    }
  }, [selectedPropertyId, properties, mapLoaded]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className={`flex items-center justify-center bg-[#1a1a1a] border border-[#262626] rounded-xl ${className}`}>
        <div className="text-center text-gray-400">
          <p className="text-lg font-semibold mb-2">Map Unavailable</p>
          <p className="text-sm">NEXT_PUBLIC_MAPBOX_TOKEN is required</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapContainer}
      className={`rounded-xl overflow-hidden ${className}`}
    />
  );
}
