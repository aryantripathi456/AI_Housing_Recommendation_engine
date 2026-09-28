"""Module 2 — Hybrid recommender: MAUT + content-based cosine similarity.

Match Score = w1*Price + w2*Commute + w3*Liveability + w4*AmenitySimilarity
with persona weight vectors from app.core.config (rows sum to 1.0).

Sub-scores (all 0..1):
- price:      1 - price/reference, where reference = monthly_income*0.35 if
              income is known, else filters.max_price. Clamped to [0,1].
- commute:    gaussian decay of distance-to-work (sigma 4km); falls back to
              liveability transport dim when no work location is known.
- liveability: overall index / 100 (cached per property).
- amenity:    cosine similarity between the property amenity vector and the
              persona-desired amenity profile (sklearn), blended 50/50 with
              amenities-filter coverage when the user selected amenities.
"""

from sklearn.metrics.pairwise import cosine_similarity

from app.core.config import ALL_AMENITIES, PERSONA_AMENITIES, PERSONA_WEIGHTS
from app.core.geo import gaussian_decay, minmax
from app.db.models import Property
from app.services import liveability as liv_service


def _amenity_vector(amenities: list[str]) -> list[int]:
    s = set(amenities)
    return [1 if a in s else 0 for a in ALL_AMENITIES]


def amenity_similarity(prop_amenities: list[str], persona: str,
                       selected: list[str] | None = None) -> float:
    import numpy as np
    pv = [_amenity_vector(prop_amenities)]
    qv = [_amenity_vector(PERSONA_AMENITIES.get(persona, []))]
    cos = float(cosine_similarity(pv, qv)[0][0])
    if selected:
        sel = [a for a in selected if a in ALL_AMENITIES or True]
        coverage = sum(1 for a in sel if a in set(prop_amenities)) / max(len(sel), 1)
        return 0.5 * cos + 0.5 * coverage
    return cos


def price_score(price: int, max_price: float, income: float | None) -> float:
    reference = income * 0.35 if income and income > 0 else max_price
    if reference <= 0:
        return 0.5
    return minmax(reference - price, 0, reference)


def commute_score(distance_km: float | None) -> float:
    if distance_km is None:
        return 0.5
    return gaussian_decay(distance_km * 1000.0, 4000.0)


def _matches_filters(p: Property, f: dict, q: str) -> bool:
    if not (f.get('min_price', 0) <= p.price <= f.get('max_price', 100000)):
        return False
    if f.get('types') and p.type not in f['types']:
        return False
    if f.get('bedrooms'):
        def hit(b: int) -> bool:
            return (p.bedrooms >= 4) if b >= 4 else (p.bedrooms == b)
        if not any(hit(b) for b in f['bedrooms']):
            return False
    if f.get('amenities') and not all(a in (p.amenities or []) for a in f['amenities']):
        return False
    if f.get('personas') and not any(x in (p.personas or []) for x in f['personas']):
        return False
    loc = (f.get('location') or '').strip().lower()
    if loc and loc not in f'{p.location} {p.city}'.lower():
        return False
    if q:
        hay = f'{p.title} {p.location} {p.city} {p.type}'.lower()
        if not all(t in hay for t in q.lower().split()):
            return False
    return True


def rank(db, properties: list[Property], persona: str, filters: dict,
         search_query: str = '', income: float | None = None,
         work: tuple[float, float] | None = None) -> list[tuple[Property, float, dict]]:
    """Return [(property, matchScore 0..100, subscores)] sorted desc."""
    w = PERSONA_WEIGHTS.get(persona, PERSONA_WEIGHTS['professional'])
    q = (search_query or '').strip()
    ranked = []
    for p in properties:
        if not _matches_filters(p, filters, q):
            continue
        liv = liv_service.get_for_property(db, p.id, p.latitude, p.longitude)
        dist = p.distance_to_work
        if work is not None:
            from app.core.geo import haversine_km
            dist = round(haversine_km(p.latitude, p.longitude, work[0], work[1]), 1)
        subs = {
            'price': round(price_score(p.price, filters.get('max_price', 100000), income), 3),
            'commute': round(commute_score(dist), 3),
            'liveability': round(liv['overall'] / 100.0, 3),
            'amenity': round(amenity_similarity(p.amenities or [], persona, filters.get('amenities')), 3),
        }
        score = round(100 * sum(subs[k] * w[k] for k in ('price', 'commute', 'liveability', 'amenity')), 1)
        ranked.append((p, score, subs))
    ranked.sort(key=lambda r: r[1], reverse=True)
    return ranked


def build_reasons(p: Property, persona: str, score_subs: dict,
                  income: float | None = None) -> list[str]:
    """Transparent 'why this home' bullets: stored templates + computed facts."""
    reasons = list((p.recommendation_reasons or {}).get(persona, [])[:3])
    facts: list[str] = []
    if p.distance_to_work is not None:
        facts.append(f'{p.distance_to_work} km from the BKC work hub')
    if income and income > 0:
        ratio = p.price / income
        facts.append(f'Rent is {ratio:.0%} of your stated income')
    if p.rating >= 4.5:
        facts.append(f'Highly rated at {p.rating}/5 by residents')
    if p.furnished:
        facts.append('Furnished — move in with no setup cost')
    return (reasons + facts)[:5] or ['Matches your search filters']
