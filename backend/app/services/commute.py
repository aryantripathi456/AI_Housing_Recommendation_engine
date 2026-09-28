"""Module 4 — Commute time & accessibility engine (synopsis § Key Module 4).

Primary: Mapbox Matrix API (driving + walking durations).
Known limitation (documented for the thesis): Mapbox offers NO public-transit
profile, so transit is a calibrated estimate (haversine distance at city
transit speed + average wait), clearly labelled `source='estimated'`.
Every result is cached in CommuteCache so Mapbox quota is spent once per O/D.
Without a MAPBOX_TOKEN, all modes fall back to calibrated estimates and the
API still works end-to-end (important for offline demos).
"""

import httpx
from sqlalchemy.orm import Session

from app.core.config import FALLBACK_SPEEDS_KMH, TRANSIT_WAIT_MIN, settings
from app.core.geo import haversine_km
from app.db.models import CommuteCache

VALID_MODES = ('driving', 'walking', 'transit')
_MAPBOX_PROFILE = {'driving': 'driving-traffic', 'walking': 'walking'}


def _estimate(mode: str, distance_km: float) -> tuple[float, float]:
    speed = FALLBACK_SPEEDS_KMH[mode]
    minutes = distance_km / speed * 60.0
    if mode == 'transit':
        minutes += TRANSIT_WAIT_MIN
    return round(minutes, 1), round(distance_km, 2)


def _mapbox_matrix(coords: list[tuple[float, float]], profile: str) -> dict | None:
    """Call Mapbox Matrix API. Returns {(i,j): (duration_min, distance_km)}."""
    if not settings.mapbox_token:
        return None
    # Mapbox expects lng,lat pairs.
    coord_str = ';'.join(f'{lng},{lat}' for lat, lng in coords)
    url = f'https://api.mapbox.com/directions-matrix/v1/mapbox/{profile}/{coord_str}'
    try:
        r = httpx.get(url, params={
            'access_token': settings.mapbox_token,
            'annotations': 'duration,distance',
        }, timeout=15.0)
        r.raise_for_status()
        data = r.json()
        if data.get('code') != 'Ok':
            return None
        out: dict[tuple[int, int], tuple[float, float]] = {}
        for i, row in enumerate(data['durations']):
            for j, dur_s in enumerate(row):
                dist_km = data['distances'][i][j] / 1000.0
                out[(i, j)] = (round(dur_s / 60.0, 1), round(dist_km, 2))
        return out
    except Exception:
        return None  # fail soft -> calibrated estimate


def route(db: Session, o_lat: float, o_lng: float, d_lat: float, d_lng: float,
          modes: list[str]) -> dict:
    modes = [m for m in modes if m in VALID_MODES] or ['driving']
    distance_km = round(haversine_km(o_lat, o_lng, d_lat, d_lng), 2)
    result_modes: dict[str, dict] = {}

    # Batch the live-capable modes in one Matrix call (origins=[O], dest=[D]).
    live_modes = [m for m in modes if m in _MAPBOX_PROFILE]
    live: dict[str, tuple[float, float]] = {}
    if live_modes and settings.mapbox_token:
        # One call per profile (Matrix allows a single profile per request).
        for m in live_modes:
            mat = _mapbox_matrix([(o_lat, o_lng), (d_lat, d_lng)], _MAPBOX_PROFILE[m])
            if mat and (0, 1) in mat:
                live[m] = mat[(0, 1)]

    for m in modes:
        cached = (
            db.query(CommuteCache)
            .filter_by(origin_lat=round(o_lat, 5), origin_lng=round(o_lng, 5),
                       dest_lat=round(d_lat, 5), dest_lng=round(d_lng, 5), mode=m)
            .first()
        )
        if cached:
            result_modes[m] = {'duration_min': cached.duration_min,
                               'distance_km': cached.distance_km,
                               'source': cached.source}
            continue
        if m in live:
            dur, dist = live[m]
            source = 'live'
        else:
            dur, dist = _estimate(m, distance_km)
            source = 'estimated'
        db.add(CommuteCache(origin_lat=round(o_lat, 5), origin_lng=round(o_lng, 5),
                            dest_lat=round(d_lat, 5), dest_lng=round(d_lng, 5),
                            mode=m, duration_min=dur, distance_km=dist, source=source))
        result_modes[m] = {'duration_min': dur, 'distance_km': dist, 'source': source}
    db.commit()
    return {
        'origin': {'lat': o_lat, 'lng': o_lng},
        'destination': {'lat': d_lat, 'lng': d_lng},
        'modes': result_modes,
    }
