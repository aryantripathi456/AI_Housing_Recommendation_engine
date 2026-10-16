"""POI service: cached-first access; Overpass ingestion helper for later.

Runtime reads NEVER hit Overpass (rate limits) — they use the local POI
table seeded synthetically now. `fetch_overpass()` is provided for the
future Kaggle/real-data phase and writes through the same table.
"""

import httpx
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models import POI

# OSM tag mapping per liveability dimension (used by fetch_overpass).
OVERPASS_TAGS: dict[str, list[tuple[str, str]]] = {
    'transport': [('railway', 'station'), ('highway', 'bus_stop'), ('railway', 'halt')],
    'education': [('amenity', 'school'), ('amenity', 'college'), ('amenity', 'library')],
    'healthcare': [('amenity', 'hospital'), ('amenity', 'clinic'), ('amenity', 'pharmacy')],
    'shopping': [('shop', 'supermarket'), ('shop', 'convenience'), ('amenity', 'marketplace')],
    'environment': [('leisure', 'park'), ('leisure', 'garden'), ('natural', 'water')],
}


def count_near(db: Session, lat: float, lng: float) -> dict[str, int]:
    from app.services import liveability as liv
    res = liv.compute_liveability(db, lat, lng)
    return res['poi_counts']


def nearest_stations(db: Session, lat: float, lng: float, limit: int = 3) -> list[dict]:
    """3 nearest railway stations with haversine distances (km).

    Reads the seeded real-station POIs (category=transport,
    kind=railway_station). Pure Python distance sort — same SQLite-friendly
    pattern as liveability (no PostGIS operators).
    """
    from app.core.geo import haversine_km

    rows = db.query(POI).filter(
        POI.category == 'transport', POI.kind == 'railway_station').all()
    scored = [{
        'name': p.name,
        'distance_km': round(haversine_km(lat, lng, p.latitude, p.longitude), 2),
        'latitude': p.latitude,
        'longitude': p.longitude,
        'locality': p.locality or '',
    } for p in rows]
    scored.sort(key=lambda s: s['distance_km'])
    return scored[:limit]


def fetch_overpass(db: Session, south: float, west: float, north: float, east: float,
                   locality: str = '') -> int:
    """One-shot ingestion: pull amenity nodes for a bbox into the POI table."""
    union = '\n'.join(
        f'node["{k}"="{v}"]({south},{west},{north},{east});'
        for tags in OVERPASS_TAGS.values() for k, v in tags
    )
    query = f'[out:json][timeout:60];({union});out center 2000;'
    r = httpx.post(settings.overpass_url, data={'data': query}, timeout=90.0)
    r.raise_for_status()
    n = 0
    tag_to_dim = {tag: dim for dim, tags in OVERPASS_TAGS.items() for tag in tags}
    for el in r.json().get('elements', []):
        if el.get('type') != 'node':
            continue
        tags = el.get('tags', {})
        dim = next((tag_to_dim[(k, v)] for k, v in tags.items() if (k, v) in tag_to_dim), None)
        if dim is None:
            continue
        db.add(POI(
            name=tags.get('name', f'OSM node {el["id"]}'),
            category=dim,
            kind=f'{dim}_osm',
            latitude=el['lat'], longitude=el['lon'], locality=locality,
        ))
        n += 1
    db.commit()
    return n
