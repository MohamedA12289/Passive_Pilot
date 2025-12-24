# Passive Pilot — Backend 9 (SMS module + message log)

## What this adds
- SMS message logging table (`sms_messages`)
- SMS endpoints (subscription-protected):
  - `GET /sms/status`
  - `POST /sms/send`
  - `POST /sms/batch-send`
  - `GET /sms/messages`

## Current behavior (by design)
- Default `SMS_PROVIDER=stub` => nothing actually sends; messages get logged as `skipped` with a note.
- Twilio + other providers are placeholders: **PUT API HERE**.

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
