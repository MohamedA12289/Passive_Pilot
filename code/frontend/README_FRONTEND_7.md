# Passive Pilot — Frontend 7

## What changed from Frontend 6
- Added **Toast notifications** (small popups) for quick feedback.
- Added **AI Assist** page (`/ai`):
  - Lets you generate/iterate SMS templates with an AI endpoint (placeholder until backend is wired).
  - Shows a live preview using a sample lead.
- Settings page: added **Copy tokens** helper + “Test toast” button.

## Notes
AI Assist expects backend endpoint (placeholder for now):
- `POST /ai/generate-sms`
  - returns `{ message: "..." }`
If not implemented yet, the UI will show a warning toast.

## Setup
```powershell
cd frontend
npm install
copy .env.local.example .env.local
npm run dev
```
