#!/usr/bin/env bash
#
# NestAI — start backend (FastAPI) + frontend (Vite) together.
#
# Usage:
#   ./start.sh                 # backend :8000, frontend :5173 (or next free port)
#   BACKEND_PORT=8000 FRONTEND_PORT=5173 ./start.sh
#   ./start.sh --no-seed       # skip the automatic DB seed check
#
# Stop everything with Ctrl+C.
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT/backend"
FRONTEND_DIR="$ROOT/frontend"
BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"
SEED=true
if [[ "${1:-}" == "--no-seed" ]]; then SEED=false; fi

log()  { printf '\033[1;36m[start]\033[0m %s\n' "$*"; }
fail() { printf '\033[1;31m[start]\033[0m %s\n' "$*" >&2; exit 1; }

# --- prerequisite checks -----------------------------------------------------
[[ -d "$BACKEND_DIR" ]]  || fail "backend/ not found at $BACKEND_DIR"
[[ -d "$FRONTEND_DIR" ]] || fail "frontend/ not found at $FRONTEND_DIR"
[[ -x "$BACKEND_DIR/.venv/bin/python" ]] || fail "backend/.venv missing — run: cd backend && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt"
[[ -d "$FRONTEND_DIR/node_modules" ]]    || fail "frontend/node_modules missing — run: cd frontend && npm install"
command -v npm >/dev/null || fail "npm not found on PATH"

# --- seed DB on first run ----------------------------------------------------
if $SEED && [[ ! -f "$BACKEND_DIR/nestai.db" ]]; then
  log "nestai.db not found — seeding synthetic dataset…"
  (cd "$BACKEND_DIR" && .venv/bin/python -m data.seed_db)
fi

# --- launch both, tear both down on exit -------------------------------------
PIDS=()
cleanup() {
  log "stopping…"
  for pid in "${PIDS[@]:-}"; do kill "$pid" 2>/dev/null || true; done
  wait 2>/dev/null || true
}
trap cleanup INT TERM EXIT

log "backend  → http://localhost:${BACKEND_PORT}  (docs: /docs)"
(cd "$BACKEND_DIR" && .venv/bin/python -m uvicorn app.main:app --reload --port "$BACKEND_PORT" 2>&1 | sed 's/^/[backend] /') &
PIDS+=($!)

# Give the API a moment so the Vite proxy target is up first.
sleep 2

log "frontend → http://localhost:${FRONTEND_PORT}  (proxies /api → :${BACKEND_PORT})"
# Vite reads VITE_PROXY_TARGET for the /api proxy; default it from BACKEND_PORT
# so custom ports stay in sync (an explicit VITE_PROXY_TARGET always wins).
export VITE_PROXY_TARGET="${VITE_PROXY_TARGET:-http://localhost:${BACKEND_PORT}}"
(cd "$FRONTEND_DIR" && npm run dev -- --port "$FRONTEND_PORT" 2>&1 | sed 's/^/[frontend] /') &
PIDS+=($!)

log "both running — press Ctrl+C to stop."
wait
