'use client';

import { useEffect, useRef } from 'react';

interface PropertyMapProps {
  address: string;
}

export default function PropertyMap({ address }: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setAttribute('data-address', address);
  }, [address]);

  return (
    <div
      ref={mapRef}
      className="flex h-full w-full items-center justify-center rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-4 text-center"
    >
      <div>
        <div className="text-xs uppercase tracking-wide text-zinc-500">Map placeholder</div>
        <div className="mt-2 text-sm text-zinc-300">{address}</div>
      </div>
    </div>
  );
}
