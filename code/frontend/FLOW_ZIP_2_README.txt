FLOW ZIP 2 (MAP STEP) - IMPORTANT

1) Install map dependencies (in frontend folder):
   npm install leaflet react-leaflet

2) Add Leaflet CSS import ONCE (recommended place: app/globals.css):
   @import "leaflet/dist/leaflet.css";

Then restart: npm run dev

This zip adds:
- components/FlowMap.tsx (search box + map)
- components/LeafletMapInner.tsx (Leaflet map, client-only, auto-zoom)
- components/FlowNav.tsx (Back/Next buttons)
- app/campaigns/[id]/flow/2-map/page.tsx (Step 2 page)
- app/campaigns/[id]/flow/1-create/page.tsx (placeholder step to avoid 404)
