# Passive Pilot — Backend 3

## What changed in Backend 3
- Users now have a `role` field (default: `client`)
- Registration forces every new user to start as `client`
- `/auth/login` includes `role` in the JWT claims
- `/auth/me` returns `{id, email, role}`
- Adds `get_current_user` dependency (will be used in Backend 4+)

## Install / Run (Windows PowerShell)
```powershell
cd backend
.env\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
alembic -c alembic.ini upgrade head
uvicorn app.main:app --reload
```

Docs: http://127.0.0.1:8000/docs
