# NestAI — AI Housing Intelligence Platform · Implementation Notes

Full-stack AI-powered housing recommendation platform (M.Sc. IT Semester 3 project).
Repo root contains `frontend/`, `backend/`, `start.sh`, the project synopsis `.docx`,
and this file.

---

## 1. How to run the project

### 1.1 Prerequisites

| Tool | Version used | Check |
|---|---|---|
| Node.js + npm | Node v24, npm 11 | `node -v && npm -v` |
| Python | 3.12 | `python3 --version` |
| OS | Linux (bash) | — |

No database server, API keys, or paid services are required for the default run.
Internet access is needed for property photos (Unsplash CDN) and map tiles (CARTO/OSM).

### 1.2 One-command start (recommended)

```bash
./start.sh
```

This starts **both** servers and prefixes their logs:

- Backend (FastAPI + uvicorn --reload): `http://localhost:8000` · docs at `/docs`
- Frontend (Vite dev): `http://localhost:5173` (or next free port) · `/api` proxied to the backend

Stop everything with `Ctrl+C` (the script traps the signal and kills both children).

Useful variants:

```bash
BACKEND_PORT=8000 FRONTEND_PORT=5173 ./start.sh   # explicit ports (defaults)
./start.sh --no-seed                              # skip the DB seed check
VITE_PROXY_TARGET=http://host:8000 ./start.sh     # point Vite at a remote API
```

On first run `start.sh` auto-seeds the SQLite DB (`backend/nestai.db`) if missing,
and aborts with a helpful message if `backend/.venv` or `frontend/node_modules`
don't exist yet (see manual setup below).

### 1.3 Manual setup (first time / CI)

```bash
# Backend
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python -m data.seed_db          # → nestai.db: 72 listings, 180 POIs, 144 snapshots
.venv/bin/python -m uvicorn app.main:app --reload --port 8000

# Frontend (second terminal)
cd frontend
npm install
npm run dev                                # → http://localhost:5173
```

### 1.4 Verify it's working

```bash
curl http://localhost:8000/health
# {"status":"ok","synthetic_data":true,"mapbox":false}

# Through the Vite proxy (proves end-to-end wiring):
curl -X POST http://localhost:5173/api/recommendations \
  -H 'Content-Type: application/json' \
  -d '{"persona":"student","filters":{"minPrice":0,"maxPrice":100000,"types":[],"bedrooms":[],"location":"","amenities":[],"personas":[]},"searchQuery":""}'
```

Then open `http://localhost:5173`: pick a persona → **Get AI Recommendations** →
map markers + ranked cards → click a card for liveability / commute / affordability →
compare up to 3 homes → rent-trend chart at the page bottom.

### 1.5 Tests & production builds

```bash
cd backend  && .venv/bin/python -m pytest tests/ -q   # 9 API tests
cd frontend && npx tsc --noEmit && npm run build      # type-check + dist/
```

### 1.6 Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `Cannot reach the NestAI backend` in the UI | Backend isn't running — start it or use `./start.sh`; ErrorState offers Retry (strict mode, no silent mock) |
| Vite proxy 502 on custom ports | Fixed in `start.sh`: it exports `VITE_PROXY_TARGET` derived from `BACKEND_PORT` (this exact bug was caught in testing) |
| Page went white after ~2 s (historical) | Fixed: `LocateButton` called `useMap()` outside `<MapContainer>`; now inside + wrapped in an `ErrorBoundary` |
| `MAPBOX_TOKEN` unset | Expected — routing uses calibrated estimates labelled `estimated`; set a token in `backend/.env` for live durations |
| Port already in use | Vite auto-picks the next free port; override with `FRONTEND_PORT=` / `BACKEND_PORT=` |

---

## 2. Decisions made — and why

### 2.1 Product & UX decisions (user-confirmed)

- **Brand `NestAI` + emerald/teal on deep navy.** Premium-proptech feel per the brief;
  accent used sparingly (CTAs, match scores, active states), no gradients/neon.
- **Single `Home` page + modal detail** (not multi-route). The brief mandates one cohesive
  page in strict section order (Navbar → Hero → Map → Listings → Footer); a modal keeps
  that order intact while new sections (Trends) append after Listings.
- **Persona-first journey.** Persona cards are the hero's primary interaction because the
  whole product thesis is "a great location depends on who is searching".
- **Explainability as differentiator.** Every score ships with "Why this home?" reasons,
  liveability bars, and commute/affordability panels — recommendations never look arbitrary.
- **Strict backend-down behavior (no mock fallback).** Chosen for demo honesty: failures show
  `ErrorState` + Retry instead of silently serving stale mock data that could be mistaken
  for AI output.
- **Vite dev proxy (`/api` → `:8000`).** Zero CORS issues in dev, relative URLs in prod,
  overridable via `VITE_API_URL` / `VITE_PROXY_TARGET`.
- **Recharts for charts** (donut, gauge, trend lines) per the synopsis visualization table,
  code-split into lazy chunks so the initial bundle stays lean.

### 2.2 Frontend stack decisions

- **Tailwind v4** (Vite plugin, CSS `@theme` tokens) — current, no config-file boilerplate.
- **React-Leaflet + CARTO/OSM tiles** — free, no API key; custom `divIcon` price pills
  (`₹28K`), selected-marker highlight, popups with match %; map wrapped in an
  `ErrorBoundary` + lazy chunk so a map failure can never white-screen the app again.
- **Unsplash remote URLs** for photos (realistic) with `onError` fallback image.
- **Saved homes + persona + income in `localStorage`** — persistence without accounts.
- **Income input in filter drawer + details modal** — affordability and personalized price
  scoring need rent-to-income; drawer placement keeps the hero uncluttered.

### 2.3 Backend stack decisions

- **`backend/` sibling of `frontend/`**, both run from repo root via `start.sh`.
- **FastAPI (Python 3.12) + SQLite dev DB.** User-chose SQLite: zero-ops semester setup.
  Consequence handled deliberately — no PostGIS, so radius/decay math lives in Python
  services (`shapely`, haversine, BallTree-style prefiltering) and models keep plain
  `latitude/longitude` (+JSON) columns so a Postgres+PostGIS migration is an engine-URL
  change, not a rewrite. Supabase (free Postgres+PostGIS) is the documented prod path.
- **Mapbox for routing (user choice) with eyes open.** Mapbox Matrix covers driving/walking,
  but has **no public-transit profile** — so transit is a calibrated estimate
  (haversine at city-transit speed + wait), always labelled `live` vs `estimated` in API
  responses and UI. A provider interface keeps this a contained compromise.
- **Synthetic dataset (user choice, seed=42).** 72 listings / 180 POIs / 12×12 rent snapshots
  across 12 real Mumbai localities. Deterministic reseeds keep demos and thesis figures
  stable. Price-trend charts carry a synthetic-data footnote for viva honesty
  (no multi-year rental history exists for these micro-markets — hence no LSTM/XGBoost
  forecasting in the core build; it's Future Scope).
- **camelCase API aliases.** Pydantic `alias_generator` + `response_model_by_alias` makes
  responses byte-identical to the frontend `Property` type — the swap was a thin `fetch`
  change, verified by contract test.
- **All six synopsis modules**, phased core-first: properties → recommender → liveability →
  affordability → commute → compare/trends.

### 2.4 Algorithm decisions (viva-ready)

- **Hybrid = MAUT + content-based cosine** (`Match = w1·Price + w2·Commute + w3·Liveability +
  w4·AmenitySimilarity`), persona weight vectors centralized in `core/config.py`.
  Framed as knowledge-based + content-based, *not* collaborative — with no interaction
  logs, claiming collaborative filtering would not survive examiner questions
  (cold-start reality).
- **Weight provenance documented** (AHP-style, Zhang et al. for commute-first professional
  weighting, Chen et al. for demographic conditioning) instead of silent hardcoding.
- **Liveability:** 25/20/20/15/20 dims, 5 km radius, Gaussian decay (σ=800 m),
  saturating aggregation, per-property caching.
- **POI/Overpass treated as ingestion, never runtime.** Per-request Overpass calls would be
  throttled mid-demo; POIs are pre-fetched into the DB (synthetic now, `fetch_overpass`
  helper later) with identical table shape.
- **Every external call cached** (liveability, commute matrix) to protect Mapbox quota.

### 2.5 Bugs found by verification (kept as record)

1. White-screen-after-2s: `useMap()` outside `<MapContainer>` → moved inside + ErrorBoundary.
2. `start.sh` custom-port bug: proxy still pointed at `:8000` → script now derives
   `VITE_PROXY_TARGET` from `BACKEND_PORT` (caught by proxy test, re-verified 200).
3. Test asserted snake_case on a camelCase API — fixed the test, proving aliasing works.
4. Replaced deprecated FastAPI `on_event` with `lifespan`; removed dead mock code
   (`data/properties.ts`, client-side rank/boost) after the swap.
