# Passive Pilot — Backend (Part 1)

This part gives you a clean FastAPI skeleton with:
- Settings + env loading
- SQLAlchemy base + session
- User model (minimal)
- Auth endpoints (register, login, me) using JWT
- Health + root endpoints
- CORS configured

## 1) Put this folder
Unzip into:
```
passive-pilot/
  backend/   <-- this folder
  frontend/  <-- later
```

## 2) Create + activate venv (PowerShell)
From `passive-pilot/backend`:
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

## 3) Install deps
```powershell
pip install -r requirements.txt
```

## 4) Create your .env
Copy `.env.example` -> `.env` and edit:
```powershell
copy .env.example .env
```

## 5) Run API
```powershell
uvicorn app.main:app --reload
```

Open:
- API root: http://127.0.0.1:8000
- Docs: http://127.0.0.1:8000/docs

## 6) Quick test (docs)
1. POST `/auth/register`
2. POST `/auth/login` (copy access_token)
3. Click "Authorize" in Swagger and paste: `Bearer <token>`
4. GET `/auth/me`

## Notes
- This uses SQLite for dev.
- Alembic is installed but we will wire migrations in a later part.
