'use client';

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import type { MapMarker } from '@/lib/types';

interface MapPanelProps {
  markers?: MapMarker[];
  selectedMarkerId?: string;
  onMarkerClick?: (marker: MapMarker) => void;
  height?: string;
  className?: string;
}

export default function MapPanel({
  markers = [],
  selectedMarkerId,
  onMarkerClick,
  height = '500px',
  className = '',
}: MapPanelProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const [mapLoaded, setMapLoaded] = useState(false);

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    if (!MAPBOX_TOKEN) {
      console.warn('NEXT_PUBLIC_MAPBOX_TOKEN is not set. Map will not be displayed.');
      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-98.5795, 39.8283], // Center of US
      zoom: 4,
    });

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [MAPBOX_TOKEN]);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    if (markers.length === 0) return;

    // Add new markers
    const bounds = new mapboxgl.LngLatBounds();

    markers.forEach((marker) => {
      if (!marker.latitude || !marker.longitude) return;

      const isSelected = marker.id === selectedMarkerId;

      // Create custom marker element
      const el = document.createElement('div');
      el.className = isSelected ? 'custom-marker selected' : 'custom-marker';
      el.style.width = isSelected ? '40px' : '30px';
      el.style.height = isSelected ? '40px' : '30px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = isSelected ? '#000000' : '#f59e0b';
      el.style.border = isSelected ? '3px solid #d4af37' : '2px solid #ffffff';
      el.style.cursor = 'pointer';
      el.style.transition = 'all 0.3s ease';
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';

      // Add hover effect
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      // Create popup
      let popupContent = `<div style="color: black; padding: 8px;">`;

      if (marker.property) {
        popupContent += `
          <div style="font-weight: bold; margin-bottom: 4px;">${marker.property.address}</div>
          <div style="font-size: 18px; font-weight: bold; color: #d4af37; margin-bottom: 8px;">
            $${marker.property.price.toLocaleString()}
          </div>
        `;

        if (marker.deal) {
          popupContent += `
            <div style="margin-bottom: 4px;">
              <span style="color: #666;">ARV:</span>
              <span style="font-weight: bold;">$${marker.deal.arv.toLocaleString()}</span>
            </div>
            <div style="margin-bottom: 8px;">
              <span style="color: #666;">Discount:</span>
              <span style="font-weight: bold; color: #d4af37;">${marker.deal.discount}%</span>
            </div>
          `;
        }

        popupContent += `
          <button
            onclick="window.location.href='/deals/analyze/${marker.deal?.id || marker.id}'"
            style="
              width: 100%;
              padding: 6px 12px;
              background: #d4af37;
              color: black;
              border: none;
              border-radius: 4px;
              font-weight: bold;
              cursor: pointer;
            "
          >
            View Details
          </button>
        `;
      }

      popupContent += `</div>`;

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent);

      // Create and add marker
      const mapboxMarker = new mapboxgl.Marker({ element: el })
        .setLngLat([marker.longitude, marker.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      // Add click handler
      el.addEventListener('click', () => {
        onMarkerClick?.(marker);
      });

      markersRef.current[marker.id] = mapboxMarker;
      bounds.extend([marker.longitude, marker.latitude]);
    });

    // Fit map to markers
    if (markers.length > 0) {
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15,
      });
    }
  }, [markers, selectedMarkerId, mapLoaded, onMarkerClick]);

  if (!MAPBOX_TOKEN) {
    return (
      <div
        className={`flex items-center justify-center bg-[#1a1a1a] border border-[#262626] rounded-lg ${className}`}
        style={{ height }}
      >
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
      className={`rounded-lg overflow-hidden ${className}`}
      style={{ height }}
    />
  );
}
