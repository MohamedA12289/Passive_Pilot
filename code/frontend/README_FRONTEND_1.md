# Passive Pilot — Frontend 1

## What this includes
- Next.js (App Router) + Tailwind
- Auth pages: /login, /register
- App shell with brand "Passive Pilot" (top-left)
- Pages:
  - /dashboard (campaigns list + create/delete)
  - /campaigns/[id] (view leads, add/delete, export-by-zip download)
  - /providers (shows which provider env vars missing)
  - /exports (download exports)
  - /sms (batch send UI — logs only until provider wired)

## Setup (PowerShell)
From your `frontend` folder:

```powershell
npm install
copy .env.local.example .env.local
npm run dev
```

Frontend runs on:
- http://localhost:3000

Make sure backend is running on:
- http://127.0.0.1:8000
