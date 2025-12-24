FRONTEND 9 (Part B) — Analysis + Share Pages

What this adds
- Tools → Saved Analyses: /tools/analysis
- Tools → Share Links: /tools/share
- Public share viewer: /share/[id]
- Tools index updated to include the two new cards

How to install
1) Open your project folder:
   F:\realestate software\code\frontend

2) Copy/MERGE the folders from this package into your existing frontend folder:
   - frontend\app\tools\analysis\page.tsx
   - frontend\app\tools\share\page.tsx
   - frontend\app\share\[id]\page.tsx
   - frontend\components\analysis\*
   - frontend\app\tools\page.tsx (UPDATED)

3) Run frontend:
   npm run dev

Notes
- For now, analyses are saved in browser localStorage (UI-only) until we wire backend persistence.
- Share links work on the same device/browser right now.
