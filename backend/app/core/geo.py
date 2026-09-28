"""Pure geo/math helpers: haversine, Gaussian distance decay, min-max scaling."""

import math

EARTH_RADIUS_M = 6_371_000.0


def haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance in metres."""
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * EARTH_RADIUS_M * math.asin(math.sqrt(a))


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    return haversine_m(lat1, lon1, lat2, lon2) / 1000.0


def gaussian_decay(distance_m: float, sigma_m: float) -> float:
    """Proximity score in (0, 1]: ~1 when very close, ~0 when far.

    Synopsis § Data Analysis: Gaussian decay kernel — an amenity 200m away
    scores near-maximum, beyond ~2km the contribution is negligible.
    """
    if distance_m < 0:
        return 0.0
    return math.exp(-0.5 * (distance_m / sigma_m) ** 2)


def minmax(value: float, lo: float, hi: float) -> float:
    """Min-max scale to [0, 1] (synopsis § normalisation step)."""
    if hi <= lo:
        return 0.0
    return max(0.0, min(1.0, (value - lo) / (hi - lo)))


def saturate(x: float, half: float) -> float:
    """Diminishing-returns aggregation: x/(x+half), in [0, 1)."""
    if x <= 0:
        return 0.0
    return x / (x + half)
