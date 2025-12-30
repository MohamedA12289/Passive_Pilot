# RUNBOOK (Local Dev)

## Backend (Windows PowerShell)
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m alembic upgrade head
python -m uvicorn app.main:app --reload

### If pip is blocked by a proxy or corporate SSL
- Set proxy env vars in the same PowerShell session before installing:
  - `$env:HTTP_PROXY="http://proxy:port"`
  - `$env:HTTPS_PROXY="http://proxy:port"`
- Or configure pip once without committing credentials: `pip config set global.proxy http://proxy:port`
- If a corporate MITM certificate is required, install the cert from IT so Python trusts the proxy (avoid disabling SSL checks; `--trusted-host` should be a last resort only).
- Offline option: on a machine with PyPI access run `pip download -r requirements.txt -d wheels`, copy the `wheels/` folder here, then install with `pip install --no-index --find-links=./wheels -r requirements.txt`.
- Common Windows commands: `.\\venv\\Scripts\\Activate.ps1` and `python -m uvicorn app.main:app --reload`.

### Windows common issues (paths with spaces, launchers)
- When the repository lives in a path with spaces (e.g., `C:\\Passive pilot\\`), prefer `python -m ...` invocations to avoid launcher path issues:
  - `python -m pip install -r requirements.txt`
  - `python -m alembic upgrade head`
  - `python -m uvicorn app.main:app --reload`
- If PowerShell blocks venv activation, allow scripts for the current session: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned`.
- If a console shortcut points to `pip.exe`/`alembic.exe` under a path with spaces, re-run the command with `python -m` as above.

API: http://127.0.0.1:8000
Docs: http://127.0.0.1:8000/docs

## Frontend
cd frontend
npm install
npm run dev

UI: http://localhost:3000
