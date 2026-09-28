# NestAI — start backend (FastAPI) + frontend (Vite) together on Windows (PowerShell).
#
# Usage:
#   .\start.ps1                    # backend :8000, frontend :5173
#   $env:BACKEND_PORT=8000; $env:FRONTEND_PORT=5173; .\start.ps1
#   .\start.ps1 -NoSeed            # skip the automatic DB seed check
#
# Stop: close both windows or press Ctrl+C in each.
# If blocked by execution policy, run once: Set-ExecutionPolicy -Scope CurrentUser RemoteSigned

param([switch]$NoSeed)

$ErrorActionPreference = 'Stop'
$ROOT = $PSScriptRoot
$BACKEND_DIR = Join-Path $ROOT 'backend'
$FRONTEND_DIR = Join-Path $ROOT 'frontend'
if (-not $env:BACKEND_PORT) { $env:BACKEND_PORT = '8000' }
if (-not $env:FRONTEND_PORT) { $env:FRONTEND_PORT = '5173' }
$BACKEND_PORT = $env:BACKEND_PORT
$FRONTEND_PORT = $env:FRONTEND_PORT

function Fail($msg) { Write-Error "[start] $msg"; exit 1 }

if (-not (Test-Path $BACKEND_DIR)) { Fail "backend/ not found at $BACKEND_DIR" }
if (-not (Test-Path $FRONTEND_DIR)) { Fail "frontend/ not found at $FRONTEND_DIR" }
$VenvPython = Join-Path $BACKEND_DIR '.venv\Scripts\python.exe'
if (-not (Test-Path $VenvPython)) { Fail "backend\.venv missing — run: cd backend; py -3.12 -m venv .venv; .venv\Scripts\pip install -r requirements.txt" }
if (-not (Test-Path (Join-Path $FRONTEND_DIR 'node_modules'))) { Fail "frontend\node_modules missing — run: cd frontend; npm install" }
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { Fail 'npm not found on PATH' }

# --- seed DB on first run ----------------------------------------------------
if (-not $NoSeed -and -not (Test-Path (Join-Path $BACKEND_DIR 'nestai.db'))) {
  Write-Host '[start] nestai.db not found — seeding synthetic dataset…'
  Push-Location $BACKEND_DIR
  try { & $VenvPython -m data.seed_db } finally { Pop-Location }
}

# Vite reads VITE_PROXY_TARGET for the /api proxy; default it from BACKEND_PORT
# so custom ports stay in sync (an explicit VITE_PROXY_TARGET always wins).
if (-not $env:VITE_PROXY_TARGET) { $env:VITE_PROXY_TARGET = "http://localhost:$BACKEND_PORT" }

Write-Host "[start] backend  → http://localhost:$BACKEND_PORT  (docs: /docs)"
Start-Process -FilePath $VenvPython -ArgumentList @('-m', 'uvicorn', 'app.main:app', '--reload', '--port', $BACKEND_PORT) -WorkingDirectory $BACKEND_DIR -Title 'NestAI backend'

# Give the API a moment so the Vite proxy target is up first.
Start-Sleep -Seconds 2

Write-Host "[start] frontend → http://localhost:$FRONTEND_PORT  (proxies /api → :$BACKEND_PORT)"
Start-Process -FilePath 'cmd' -ArgumentList @('/k', "npm run dev -- --port $FRONTEND_PORT") -WorkingDirectory $FRONTEND_DIR -Title 'NestAI frontend'

Write-Host '[start] both running — close both windows to stop.'
