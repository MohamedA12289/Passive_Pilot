# Passive Pilot — Backend 4 (Roles + Access Control)

## What this adds
- Role constants: `client`, `admin`, `dev`
- Role-based dependency guard: `require_roles([...])`
- Admin endpoints (protected):
  - `GET /admin/users`
  - `POST /admin/users/{user_id}/role`

Only `admin` and `dev` can use `/admin/*` routes.

## Optional: Bootstrap an admin (dev helper)
In `.env`:
```
BOOTSTRAP_ADMIN_EMAIL=you@example.com
```
On startup, if that user exists, their role is set to `admin`.

## Run / Migrate (PowerShell)
```powershell
cd backend
.env\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
alembic -c alembic.ini upgrade head
uvicorn app.main:app --reload
```
Docs: http://127.0.0.1:8000/docs
