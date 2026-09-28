# NestAI — End-to-End Project Explanation

**What it is:** AI Housing Intelligence Platform — an AI-driven real-estate analytics,
liveability assessment, and neighbourhood evaluation system for Mumbai rentals.
A user picks a lifestyle persona (Student / Professional / Family / Senior), and the
platform ranks homes with an explainable AI match score backed by spatial liveability,
commute, and affordability intelligence.

**Stack:** FastAPI (Python) + SQLite backend · React + TypeScript + Vite + Tailwind v4
frontend · React-Leaflet maps · Recharts visualisations · scikit-learn scoring.

---

## 1. Big picture — how data flows through the system

```text
SYNTHETIC GENERATORS (data/synthetic.py, seed=42)
  │  72 listings · 180 POIs · 144 rent snapshots
  ▼
SQLite (nestai.db: properties, pois, liveability_cache, price_snapshots, commute_cache)
  │  seeded by data/seed_db.py
  ▼
INTELLIGENCE SERVICES (app/services/)
  │  liveability · recommender (MAUT+cosine) · commute · affordability · poi
  ▼
FastAPI ROUTERS (/api/*, camelCase JSON, OpenAPI at /docs)
  │  Vite dev proxy: frontend /api → localhost:8000
  ▼
REACT FRONTEND (Hero → Map → Listings → Trends → Footer)
     persona select → ranked cards + markers → modal intelligence → compare
```

A single user action (`Get AI Recommendations`) travels the whole chain:
`Hero` → `POST /api/recommendations` → MAUT/cosine ranking over cached liveability →
ranked `Property[]` → map markers + cards + reasons.

---

## 2. Data ingestion (`backend/data/`)

No external dataset is required. `synthetic.py` (deterministic, `RNG_SEED=42`) generates:

- **Listings (`generate_properties`, 6 × 12 localities = 72):** real Mumbai locality
  centres (Bandra West, Powai, BKC, …), jittered coordinates (±2.2 km), type-aware
  bedrooms/area/price (locality base rent × bedroom factor ± spread, rounded to ₹500),
  sampled amenities, rule-assigned personas (cheap→student, 3BHK→family, …),
  distances to the BKC work hub and IIT-Powai college hub, ratings, Unsplash images,
  and per-persona reason templates.
- **POIs (`generate_pois`, ~180):** 2–4 places per liveability dimension per locality
  (metro/rail/bus, schools/colleges, hospitals/clinics, supermarkets, parks),
  jittered ±2.5 km. Same table shape real OSM data would use.
- **Rent snapshots (`generate_price_snapshots`, 12×12=144):** monthly locality averages
  with upward drift (~0.4 %/mo) + annual seasonality + noise. Labelled synthetic —
  no multi-year rental history exists for these micro-markets (hence no LSTM/XGBoost
  forecasting in the core build).

`seed_db.py` (`python -m data.seed_db --reset`) creates tables and bulk-inserts
(verified output: `{'properties': 72, 'pois': 180, 'snapshots': 144}`).

**Upgrade path (no schema change):** `import_kaggle.py`-style CSV normalisation +
Nominatim geocoding for listings, and `services/poi.py::fetch_overpass()` for real OSM
POIs — both write through the same tables. Overpass is ingestion-only by design
(per-request calls would be throttled mid-demo).

---

## 3. Data model (`app/db/models.py`)

SQLite by choice (zero-ops semester setup), but every model is PostGIS-migratable:
plain `latitude/longitude` floats + JSON columns, all geo math in Python services —
so migration is an engine-URL change, not a rewrite.

| Table | Purpose |
|---|---|
| `properties` | Listings incl. `amenities`, `personas`, distances, `recommendation_reasons` JSON |
| `pois` | Cached POIs: `category` (5 liveability dims), `kind`, coords, locality |
| `liveability_cache` | Per-property `{overall, dimensions, poi_counts}` — computed once |
| `price_snapshots` | `(locality, month → avg_rent)` for trend charts |
| `commute_cache` | `(origin, dest, mode → duration, distance, live/estimated)` — protects Mapbox quota |

---

## 4. Spatial & math core (`app/core/`)

- `geo.py`: haversine distance, **Gaussian decay kernel** (σ=800 m — an amenity at
  200 m scores ~0.97, beyond ~2 km ~negligible, per the synopsis), min-max scaling,
  saturating aggregation.
- `config.py`: the thesis-critical constants in one auditable place — persona weight
  vectors, liveability sub-weights (Transport 25 / Education 20 / Healthcare 20 /
  Shopping 15 / Neighbourhood 20), affordability bands (30 % / 40 %), fallback speeds.

---

## 5. Model building — the recommendation engine (`app/services/`)

### 5.1 Match score (Modules 1+2, `recommender.py`)

```text
Match = w1·Price + w2·Commute + w3·Liveability + w4·AmenitySimilarity   (×100)
```

- **Price:** `1 − price/reference`, reference = `income×0.35` when income is known
  (filter drawer/modal input), else the max-price filter.
- **Commute:** Gaussian decay of distance-to-work (σ=4 km); recomputed live if the
  caller passes work coordinates.
- **Liveability:** cached index ÷ 100.
- **Amenity:** sklearn **cosine similarity** between the property amenity vector and the
  persona-desired profile, blended 50/50 with selected-amenity coverage.

Persona weights (`config.PERSONA_WEIGHTS`, rows sum to 1):
student `(.40,.20,.20,.20)`, professional `(.20,.40,.20,.20)`,
family `(.25,.15,.40,.20)`, senior `(.25,.10,.45,.20)` — emphasis follows Zhang et
al. (commute-first professionals) and Chen et al. (demographic conditioning).
Framed honestly as **knowledge-based (MAUT) + content-based**: with no interaction
logs, collaborative filtering is impossible (cold start), and the thesis says so.

`build_reasons()` fuses stored templates with computed facts
("2.1 km from BKC", "rent is 28 % of income") → the frontend's "Why this home?".

### 5.2 Liveability (`liveability.py`, Module 3)

Bounding-box prefilter in SQL → exact haversine in Python → per-dimension
`100·saturate(Σ decay, 3)` → weighted overall. Cached per property; endpoint also
returns POI counts (proof of evidence in the UI).

### 5.3 Commute (`commute.py`, Module 4)

Mapbox Matrix (driving-traffic + walking, batched, cached) when `MAPBOX_TOKEN` is set;
otherwise calibrated city-speed estimates. **Transit is always estimated** — Mapbox has
no transit profile — and every mode reports `source: live|estimated`, surfaced as
badges in the UI.

### 5.4 Affordability (`affordability.py`, Module 5)

Rent-to-income → `Affordable (≤30 %) / Moderate Risk (≤40 %) / Over Budget` + advice
sentence. Pure logic, no external dependency.

---

## 6. API building (`app/`)

`main.py`: app factory, CORS (Vite origins), `lifespan` table creation, `/health`
(`{status, synthetic_data, mapbox}`), five routers under `/api`, auto docs at `/docs`.

| Router | Endpoints | Consumer |
|---|---|---|
| `properties.py` | `GET /properties` (filter/search/sort/paginate), `GET /properties/{id}` | listings, detail |
| `recommendations.py` | `POST /recommendations {persona, filters, searchQuery, monthlyIncome?, workLat/Lng?}` | Hero CTA |
| `liveability.py` | `GET /properties/{id}/liveability` | modal donut + bars |
| `intelligence.py` | `POST /commute`, `POST /affordability` | modal panels |
| `dashboard.py` | `POST /compare` (≤3 + optional income), `GET /trends?localities=`, `GET /localities` | tray/modal, trends chart |

`schemas/property.py` uses a camelCase `alias_generator` + `response_model_by_alias`,
so responses are **byte-identical to the frontend `Property` type** — integration was a
thin `fetch` swap, proven by a contract test. `routers/common.py::to_out()` gives
unranked listings a neutral rating-anchored score. `tests/test_api.py` (9 tests) covers
every group: shapes, filters/sort, all-persona ranking + re-ranking proof, caching,
bands, compare limits, trend ordering.

---

## 7. Frontend building (`frontend/src/`)

**Stack:** React 19 + TS + Vite + Tailwind v4 (`@theme` tokens: navy/emerald),
React-Leaflet (CARTO/OSM, keyless), Recharts (lazy-chunked), Lucide icons, React Router
(single `Home` route).

**Page order** (per brief, in `pages/Home.tsx`): Navbar → Hero (persona + search + AI CTA)
→ Map (60/40 split, price-pill markers synced with cards) → Listings (sort/filter grid)
→ Trends (new) → Footer. Detail is a modal; compare is a floating tray + matrix modal.

**Key flows & state:**
- `hooks/useRecommendations.ts` — persona/search/filters/**income**/sort/results/loading;
  staged loading messages; income + persona + saved homes persist in `localStorage`.
  Backend owns filtering/ranking; `utils/recommendation.ts` keeps only instant
  client re-sort + INR formatting (old mock rank code deleted).
- `api/` — `client.ts` (timeout, typed `ApiError`) + one module per endpoint group;
  same-origin `/api` via Vite proxy, `VITE_API_URL` override for prod.
- Intelligence surfaces — `components/intelligence/`: `LiveabilityPanel`,
  `CommutePanel` (work/college toggle), `AffordabilityPanel` (inline income input);
  `components/compare/` tray + modal; `components/trends/` chart section.
- **Resilience:** `ErrorBoundary` around the lazy map (a past `useMap()`-outside-provider
  crash white-screened the app — fixed and guarded), skeleton/empty/error states
  everywhere, strict backend-down `ErrorState` + Retry (no silent mock data).

---

## 8. Running & verifying (detail in `implementation.md`)

```bash
./start.sh                                   # both servers; Ctrl+C stops both
cd backend && .venv/bin/python -m pytest tests/ -q
cd frontend && npx tsc --noEmit && npm run build
```

Proven live: 72 ranked results through the Vite proxy with exact contract keys;
liveability/commute/affordability/compare/trends/localities all exercised through the
proxy; backend-down yields honest 502→ErrorState; single `start.sh` port-sync bug
found and fixed during verification.

## 9. Known limits → future scope

Mapbox transit gap · synthetic trends (labelled) · SQLite scale ceiling · no auth ·
single-city (Mumbai; Pune named in synopsis EDA needs an explicit pick) →
mobile app, LLM conversational search, AQI/crime layers, XGBoost valuation, AR
walkthroughs (all per synopsis § Future Scope).
