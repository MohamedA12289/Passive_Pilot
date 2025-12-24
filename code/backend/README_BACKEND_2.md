# Passive Pilot — Backend 2 (Models + Migrations)

This part adds:
- SQLAlchemy models: `users`, `campaigns`, `leads`
- Alembic migrations (recommended for anything beyond dev/testing)

## Merge instructions
Unzip this into your **existing** `passive-pilot/backend/` folder and allow overwrite.

## Install / update deps
```powershell
cd backend
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Create your `.env`
```powershell
copy .env.example .env
```
Then set:
- `SECRET_KEY=...` (any long random string)

## Run migrations (recommended)
From `backend/`:
```powershell
alembic -c alembic.ini upgrade head
```

## Run the API
```powershell
uvicorn app.main:app --reload
```

Docs: http://127.0.0.1:8000/docs

> Note: `AUTO_CREATE_TABLES=true` will still auto-create tables in dev,
> but migrations are the correct path for production.
