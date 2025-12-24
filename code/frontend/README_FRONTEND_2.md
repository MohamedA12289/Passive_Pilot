# Passive Pilot — Frontend 2

## What changed from Frontend 1
- Dashboard: added **Delete all** campaigns button (dev convenience).
- Campaign detail: added **Populate leads** panel (calls `/campaigns/{id}/populate`).
- SMS: added **Message log** viewer (calls `/sms/messages`).
- Login/Register: auto-redirect to /dashboard if already logged in.

## Setup
```powershell
cd frontend
npm install
copy .env.local.example .env.local
npm run dev
```
