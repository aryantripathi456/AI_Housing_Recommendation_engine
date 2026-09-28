@echo off
REM NestAI - start backend (FastAPI) + frontend (Vite) together on Windows.
REM Usage:
REM   start.bat                 ^| backend :8000, frontend :5173
REM   set BACKEND_PORT=8000 ^& set FRONTEND_PORT=5173 ^& start.bat
REM   start.bat --no-seed       ^| skip the automatic DB seed check
REM Stop: close both "NestAI" windows or press Ctrl+C in each.

setlocal EnableDelayedExpansion

set "ROOT=%~dp0"
set "ROOT=%ROOT:~0,-1%"
set "BACKEND_DIR=%ROOT%\backend"
set "FRONTEND_DIR=%ROOT%\frontend"

if not defined BACKEND_PORT set "BACKEND_PORT=8000"
if not defined FRONTEND_PORT set "FRONTEND_PORT=5173"

set "SEED=1"
if "%~1"=="--no-seed" set "SEED=0"

if not exist "%BACKEND_DIR%" (
  echo [start] backend/ not found at %BACKEND_DIR% 1>&2
  exit /b 1
)
if not exist "%FRONTEND_DIR%" (
  echo [start] frontend/ not found at %FRONTEND_DIR% 1>&2
  exit /b 1
)
if not exist "%BACKEND_DIR%\.venv\Scripts\python.exe" (
  echo [start] backend\.venv missing - run: cd backend ^&^& py -3.12 -m venv .venv ^&^& .venv\Scripts\pip install -r requirements.txt 1>&2
  exit /b 1
)
if not exist "%FRONTEND_DIR%\node_modules" (
  echo [start] frontend\node_modules missing - run: cd frontend ^&^& npm install 1>&2
  exit /b 1
)
where npm >nul 2>nul
if errorlevel 1 (
  echo [start] npm not found on PATH 1>&2
  exit /b 1
)

if "%SEED%"=="1" (
  if not exist "%BACKEND_DIR%\nestai.db" (
    echo [start] nestai.db not found - seeding synthetic dataset...
    pushd "%BACKEND_DIR%" || exit /b 1
    ".\.venv\Scripts\python.exe" -m data.seed_db || exit /b 1
    popd
  )
)

if not defined VITE_PROXY_TARGET set "VITE_PROXY_TARGET=http://localhost:%BACKEND_PORT%"

echo [start] backend  -^> http://localhost:%BACKEND_PORT%  ^(docs: /docs^)
start "NestAI backend" /D "%BACKEND_DIR%" cmd /k "".\.venv\Scripts\python.exe" -m uvicorn app.main:app --reload --port %BACKEND_PORT%"

REM Give the API a moment so the Vite proxy target is up first.
timeout /t 2 /nobreak >nul

echo [start] frontend -^> http://localhost:%FRONTEND_PORT%  ^(proxies /api -^> :%BACKEND_PORT%^)
start "NestAI frontend" /D "%FRONTEND_DIR%" cmd /k "npm run dev -- --port %FRONTEND_PORT%"

echo [start] both running - close both windows to stop.
endlocal
