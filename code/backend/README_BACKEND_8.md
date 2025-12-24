# Passive Pilot — Backend 8 (Exports: Leads by ZIP)

## What this adds
- Export leads grouped by ZIP code into a single ZIP download containing:
  - `*_ALL.csv` (all leads for campaign)
  - `*_ZIP_<zip>.csv` (one file per zip; blank zip -> `unknown`)

## New routes (subscription-protected)
- `POST /exports/campaigns/{campaign_id}/leads-by-zip`
  - Returns `{ filename, download_url }`
- `GET /exports`
  - Lists last ~50 zip exports on disk
- `GET /exports/{filename}`
  - Downloads the zip

## Notes
- Files are written to `EXPORT_DIR` (default `./exports`).
- This is a simple dev-friendly export store (not per-user isolated yet).

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
