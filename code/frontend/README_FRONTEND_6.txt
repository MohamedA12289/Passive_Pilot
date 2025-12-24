Frontend 6 - Interactive Map Step (search + zoom)

What it adds:
- components/FlowMap.tsx (Leaflet + react-leaflet)
- lib/geocode.ts (Nominatim geocode helper)
- app/campaigns/[id]/flow/2-map/page.tsx (map step page)

Install deps (in frontend folder):
  npm install leaflet react-leaflet

If you already have a different map route, only keep:
- components/FlowMap.tsx
- lib/geocode.ts
and paste FlowMap usage into your existing map page.
