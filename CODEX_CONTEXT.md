# Aryones Project - Codex Rules

## NON-NEGOTIABLE RULES
- PR-only workflow. Never push to main.
- Always create a new branch per task.
- Small focused changes. One task per PR.
- Do NOT delete or rename existing endpoints, models, UI pages, or env vars unless explicitly told.
- Do NOT commit secrets (.env, keys, tokens).
- Run tests before PR. If tests missing, add minimal safe smoke tests.
- If uncertain, stop and report instead of guessing.

## How to run
Backend:
- cd backend
- python -m venv venv
- venv\Scripts\activate
- pip install -r requirements.txt
- uvicorn app.main:app --reload

Frontend:
- cd frontend
- npm install
- npm run dev

## Key folders
- backend/app/routers: API routes
- backend/app/models: DB models
- frontend/app: UI routes/components
