# Passive Pilot — Backend 7 (Providers Layer + Populate Endpoint)

## What this adds
- Provider abstraction + stubs:
  - DealMachine
  - ATTOM
  - Repliers

- New routes (subscription-protected):
  - `GET /providers/status`
  - `POST /campaigns/{campaign_id}/populate`

## Current behavior (by design)
- Providers are **stubbed** until you add real base URLs + API logic.
- Populate returns `created_leads=0` until you implement `fetch_leads()`.

## Run (PowerShell)
```powershell
cd backend
.env\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
alembic -c alembic.ini upgrade head
uvicorn app.main:app --reload
```
Docs: http://127.0.0.1:8000/docs
