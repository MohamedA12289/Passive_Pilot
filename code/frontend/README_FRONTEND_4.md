# Passive Pilot — Frontend 4

## What changed from Frontend 3
- Added **Settings** page (local UI config):
  - Brand name
  - Logo mode (letter or image from `/public/logo.png`)
  - Default SMS template + signature
- Added **Subscription gate**:
  - If `/billing/me` exists and status is not active/trialing, the app redirects to `/billing`.
  - Billing/Providers/Settings remain accessible.
- Header now shows **user email** and **subscription status** badge (when available).

## Setup
```powershell
cd frontend
npm install
copy .env.local.example .env.local
npm run dev
```

## Logo
To use your real logo:
- Put your logo file at: `frontend/public/logo.png`
- Go to Settings → Logo mode → Image
