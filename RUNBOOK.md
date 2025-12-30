# RUNBOOK (Local Dev)

## Backend (Windows PowerShell)
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload

API: http://127.0.0.1:8000
Docs: http://127.0.0.1:8000/docs

## Frontend
cd frontend
npm install
npm run dev

UI: http://localhost:3000
