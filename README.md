# NestAI — AI Housing Intelligence Platform

AI-driven real-estate analytics, liveability assessment, and neighbourhood
evaluation for Mumbai rentals *(M.Sc. IT Semester 3 project)*. Pick a lifestyle
persona — **Student, Professional, Family, Senior** — and get explainably ranked
homes backed by spatial liveability, commute, and affordability intelligence.

- Persona-aware AI match scores with "Why this home?" reasons
- Liveability breakdown (transport, education, healthcare, shopping, green & calm)
- Commute times to work/college across driving, transit, walking
- Rent-to-income affordability gauge + side-by-side compare + rent-trend charts
- Interactive map with price markers synced to listings

## Monorepo map

| Path | What |
|---|---|
| `frontend/` | React 19 + TypeScript + Vite + Tailwind v4 app |
| `backend/` | FastAPI + SQLite API (MAUT + cosine recommender) |
| `start.sh` | Starts backend + frontend together |
| `explain.md` | How the project works end to end |
| `implementation.md` | How to run it + every decision and why |
| `M.Sc. IT … .docx` | Project synopsis (requirements source of truth) |

## Prerequisites

- Node.js v24 + npm 11 (`node -v && npm -v`)
- Python 3.12 (`python3 --version`)
- No API keys required (Mapbox token optional — see Configuration)

## Quickstart

```bash
./start.sh
```

| Service | URL |
|---|---|
| App | http://localhost:5173 |
| API | http://localhost:8000 |
| API docs (OpenAPI) | http://localhost:8000/docs |

Press `Ctrl+C` to stop both. First run auto-seeds the demo database.
Custom ports: `BACKEND_PORT=8000 FRONTEND_PORT=5173 ./start.sh`
Skip seeding: `./start.sh --no-seed`

## Manual setup

```bash
# Backend
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python -m data.seed_db        # 72 listings · 180 POIs · 144 snapshots
.venv/bin/python -m uvicorn app.main:app --reload --port 8000

# Frontend (second terminal)
cd frontend
npm install
npm run dev
```

## Configuration

| Variable | Where | Required? | Effect |
|---|---|---|---|
| `MAPBOX_TOKEN` | `backend/.env` | No | Live driving/walking durations; without it all modes are labelled `estimated` (transit is estimated either way) |
| `VITE_API_URL` | `frontend/.env` | No | Explicit API origin in production; unset = same-origin `/api` |
| `VITE_PROXY_TARGET` | shell / `start.sh` | No | Vite dev proxy target (auto-derived from `BACKEND_PORT`) |
| `CORS_ORIGINS` | `backend/.env` | No | Allowed frontend origins |
| `DATABASE_URL` | `backend/.env` | No | Defaults to local `nestai.db` |

Copy each package's `.env.example` to `.env` to use these. Never commit `.env` files.

## Tests & builds

```bash
cd backend  && .venv/bin/python -m pytest tests/ -q   # 9 API tests
cd frontend && npx tsc --noEmit && npm run build      # type-check + dist/
```

## API overview

| Endpoint | Purpose |
|---|---|
| `GET /api/properties`, `GET /api/properties/{id}` | Listing feed + detail |
| `POST /api/recommendations` | Persona-ranked homes (`{persona, filters, searchQuery, monthlyIncome?}`) |
| `GET /api/properties/{id}/liveability` | 5-dimension index for charts |
| `POST /api/commute` | Durations per mode (`live` vs `estimated`) |
| `POST /api/affordability` | Rent-to-income band + advice |
| `POST /api/compare` | Up-to-3 side-by-side matrix |
| `GET /api/trends`, `GET /api/localities` | Rent trajectories + locality list |
| `GET /health` | `{status, synthetic_data, mapbox}` capability probe |

## Docs

- `explain.md` — data → model → API → frontend, end to end
- `implementation.md` — run guide, decision log, troubleshooting
- Synopsis `.docx` — original academic requirements

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Cannot reach the NestAI backend` in the UI | Start the backend (`./start.sh`); the error card has Retry — no silent mock data by design |
| Vite proxy `502` on custom ports | `start.sh` derives `VITE_PROXY_TARGET` from `BACKEND_PORT` automatically |
| Blank page after ~2 s (historical) | Fixed: map component bug + `ErrorBoundary`; hard-refresh (`Ctrl+Shift+R`) once if cached |
| Map shows key-demand tiles (historical) | Fixed: keyless OSM tiles; hard-refresh once if stale tiles persist |
| Slow first load on free hosting | Cold start after sleep — open the URL ~2 min before a demo |
