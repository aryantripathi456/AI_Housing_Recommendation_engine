"""Module 3 — Geo-spatial liveability index (synopsis § Key Module 3).

overall = Σ_dim w_dim * dim_score, dims in 0..100.
dim_score = 100 * saturate(Σ_pois gaussian_decay(d), SATURATION).
POIs come from the cached POI table (synthetic seed now, Overpass later).
Results are cached per property in LiveabilityCache.
"""

from sqlalchemy.orm import Session

from app.core.config import (
    DECAY_SIGMA_M,
    DIMENSION_SATURATION,
    LIVEABILITY_RADIUS_M,
    LIVEABILITY_WEIGHTS,
    settings,
)
from app.core.geo import gaussian_decay, haversine_m
from app.db.models import LiveabilityCache, POI

DIMENSIONS = list(LIVEABILITY_WEIGHTS.keys())


def _nearby_pois(db: Session, lat: float, lng: float) -> list[POI]:
    # SQLite has no PostGIS radius operator: coarse bounding-box prefilter in
    # SQL, exact haversine in Python. Bounding box ≈ radius at Mumbai latitude.
    dlat = LIVEABILITY_RADIUS_M / 111_000.0
    dlng = LIVEABILITY_RADIUS_M / (111_000.0 * 0.94)
    candidates = (
        db.query(POI)
        .filter(POI.latitude.between(lat - dlat, lat + dlat))
        .filter(POI.longitude.between(lng - dlng, lng + dlng))
        .all()
    )
    return [
        p for p in candidates
        if haversine_m(lat, lng, p.latitude, p.longitude) <= LIVEABILITY_RADIUS_M
    ]


def compute_liveability(db: Session, lat: float, lng: float) -> dict:
    """Return {overall, dimensions, poi_counts} with dims in 0..100."""
    pois = _nearby_pois(db, lat, lng)
    dimensions: dict[str, float] = {}
    counts: dict[str, int] = {}
    for dim in DIMENSIONS:
        dim_pois = [p for p in pois if p.category == dim]
        counts[dim] = len(dim_pois)
        from app.core.geo import saturate
        mass = sum(
            gaussian_decay(haversine_m(lat, lng, p.latitude, p.longitude), DECAY_SIGMA_M)
            for p in dim_pois
        )
        dimensions[dim] = round(100 * saturate(mass, DIMENSION_SATURATION), 1)
    overall = round(sum(dimensions[d] * LIVEABILITY_WEIGHTS[d] for d in DIMENSIONS), 1)
    return {'overall': overall, 'dimensions': dimensions, 'poi_counts': counts}


def get_for_property(db: Session, property_id: str, lat: float, lng: float) -> dict:
    cached = db.query(LiveabilityCache).filter_by(property_id=property_id).first()
    if cached:
        return {
            'property_id': property_id,
            'overall': cached.overall,
            'dimensions': cached.dimensions,
            'poi_counts': cached.poi_counts,
            'cached': True,
        }
    res = compute_liveability(db, lat, lng)
    db.add(LiveabilityCache(
        property_id=property_id, overall=res['overall'],
        dimensions=res['dimensions'], poi_counts=res['poi_counts'],
    ))
    db.commit()
    return {'property_id': property_id, **res, 'cached': False}
