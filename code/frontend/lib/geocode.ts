export type GeocodeResult = {
  displayName: string;
  lat: number;
  lon: number;
  bbox?: [number, number, number, number]; // [south, north, west, east]
};

// Client-side geocode using OpenStreetMap Nominatim.
// Works for ZIP, city, state, address, etc.
export async function geocodeNominatim(query: string): Promise<GeocodeResult | null> {
  const q = query.trim();
  if (!q) return null;

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('q', q);

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      // Some environments are picky; setting a referrer is harmless.
      'Accept': 'application/json',
    },
  });

  if (!res.ok) return null;
  const data = (await res.json()) as any[];
  if (!Array.isArray(data) || data.length === 0) return null;

  const hit = data[0];
  const lat = Number(hit.lat);
  const lon = Number(hit.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  let bbox: [number, number, number, number] | undefined;
  // Nominatim returns boundingbox: [south, north, west, east] as strings.
  if (Array.isArray(hit.boundingbox) && hit.boundingbox.length === 4) {
    const south = Number(hit.boundingbox[0]);
    const north = Number(hit.boundingbox[1]);
    const west = Number(hit.boundingbox[2]);
    const east = Number(hit.boundingbox[3]);
    if ([south, north, west, east].every(Number.isFinite)) {
      bbox = [south, north, west, east];
    }
  }

  return {
    displayName: String(hit.display_name || q),
    lat,
    lon,
    bbox,
  };
}
