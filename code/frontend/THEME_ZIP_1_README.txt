Passive Pilot - Frontend Theme Zip 1 (Theme Lock)

What this zip does
- Applies the OLD Passive Pilot color system + typography tokens (gold accent, dark UI) to your NEW frontend.
- Drops in:
  - app/globals.css
  - tailwind.config.ts
  - postcss.config.js

How to install
1) Close `npm run dev` if it's running.
2) Copy/merge these files into:
   C:\Passive Pilot\code\frontend\
   (overwrite if prompted)
3) Re-install deps just in case:
   cd "C:\Passive Pilot\code\frontend"
   npm install
4) Start:
   npm run dev

Notes
- globals.css imports Leaflet CSS:
    @import 'leaflet/dist/leaflet.css';
  If you haven't installed Leaflet yet, run:
    npm install leaflet react-leaflet
- If your existing Tailwind config has extra customizations, re-apply them after overwrite.

After this zip
- Next zip will bring over the old site's Nav/Footer + reusable UI components so your pages visually match 1:1.
