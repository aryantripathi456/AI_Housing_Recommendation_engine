# NestAI on Windows — Run Guide

## Prerequisites

- Python 3.12 (`py --version`), Node.js v24 + npm 11 (`node -v && npm -v`)
- No API keys required.

## Quickstart

```powershell
.\start.bat
# or
.\start.ps1
```

| Service | URL |
|---|---|
| App | http://localhost:5173 |
| API | http://localhost:8000 |
| API docs | http://localhost:8000/docs |

First run auto-seeds `backend\nestai.db`. Two `NestAI` windows open; close both or `Ctrl+C` in each to stop.

Custom ports / skip seed:

```powershell
set BACKEND_PORT=8000& set FRONTEND_PORT=5173& start.bat
start.bat --no-seed
$env:BACKEND_PORT=8000; $env:FRONTEND_PORT=5173; .\start.ps1
.\start.ps1 -NoSeed
```

## Manual setup (first time)

```powershell
# Backend
cd backend
py -3.12 -m venv .venv
.venv\Scripts\pip install -r requirements.txt
.venv\Scripts\python -m data.seed_db
.venv\Scripts\python -m uvicorn app.main:app --reload --port 8000

# Frontend (second terminal)
cd frontend
npm install
npm run dev
```

Note: venv Python is `.venv\Scripts\python.exe` (not `.venv/bin/python`), and the launcher is `py`, not `python3`.

## Tests & builds

```powershell
cd backend; .venv\Scripts\python -m pytest tests/ -q
cd ..\frontend; npx tsc --noEmit; npm run build
```

## Troubleshooting

| Symptom | Fix |
|---|---|
| `backend\.venv missing` | Run the `py -3.12 -m venv .venv` + `pip install` steps above from `backend\` |
| `frontend\node_modules missing` | Run `npm install` from `frontend\` |
| `.\start.ps1 cannot be loaded` | Run once: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, or use `start.bat` |
| `Cannot reach the NestAI backend` in UI | Backend isn't running — start it first; click Retry |
| `pip install` fails on `uvloop` | Use current `requirements.txt` (`uvicorn`, not `uvicorn[standard]`) |
