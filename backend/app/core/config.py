"""Application settings + persona weight vectors (single source of truth).

Weight provenance (for thesis viva): base MAUT structure follows Geertman &
Stillwell (2004) spatial multi-criteria evaluation; persona emphasis follows
Zhang et al. (2019), who validate commute as the top-weighted factor for
working professionals, and Chen et al. (2023), who show demographic-conditioned
weighting improves satisfaction. Liveability sub-weights follow the synopsis
§ Module 3 specification (Transport 25 / Education 20 / Healthcare 20 /
Shopping 15 / Neighbourhood 20).
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', extra='ignore')

    app_name: str = 'NestAI Housing Intelligence API'
    database_url: str = 'sqlite:///./nestai.db'
    mapbox_token: str = ''
    cors_origins: str = 'http://localhost:5173,http://localhost:5174'
    overpass_url: str = 'https://overpass-api.de/api/interpreter'

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(',') if o.strip()]


settings = Settings()

# Match Score = w1*Price + w2*Commute + w3*Liveability + w4*AmenitySimilarity
# Rows sum to 1.0.
PERSONA_WEIGHTS: dict[str, dict[str, float]] = {
    'student': {'price': 0.40, 'commute': 0.20, 'liveability': 0.20, 'amenity': 0.20},
    'professional': {'price': 0.20, 'commute': 0.40, 'liveability': 0.20, 'amenity': 0.20},
    'family': {'price': 0.25, 'commute': 0.15, 'liveability': 0.40, 'amenity': 0.20},
    'senior': {'price': 0.25, 'commute': 0.10, 'liveability': 0.45, 'amenity': 0.20},
}

# Synopsis Module 3: liveability dimension weights (sum to 1.0).
LIVEABILITY_WEIGHTS: dict[str, float] = {
    'transport': 0.25,
    'education': 0.20,
    'healthcare': 0.20,
    'shopping': 0.15,
    'environment': 0.20,
}

LIVEABILITY_RADIUS_M = 5000.0
# Gaussian decay sigma: an amenity ~200m away scores ~0.97, ~2km scores ~0.04.
DECAY_SIGMA_M = 800.0
# Saturation constant for dimension aggregation (Michaelis-Menten form).
DIMENSION_SATURATION = 3.0

# Persona-desired amenity profiles for cosine similarity (Module 2).
PERSONA_AMENITIES: dict[str, list[str]] = {
    'student': ['WiFi', 'Furnished', 'Security', 'Gym'],
    'professional': ['Gym', 'WiFi', 'Furnished', 'Parking', 'Elevator'],
    'family': ['Parking', 'Security', 'Garden', 'Pet Friendly', 'Elevator'],
    'senior': ['Elevator', 'Security', 'Garden', 'Parking'],
}

ALL_AMENITIES = sorted({a for v in PERSONA_AMENITIES.values() for a in v})

# Synopsis Module 5: rent-to-income bands.
AFFORDABILITY_BANDS = {
    'affordable_limit': 0.30,
    'moderate_limit': 0.40,
}

# Fallback city speeds (km/h) when Mapbox is unavailable or for transit
# (Mapbox has no public-transit profile — see commute service).
FALLBACK_SPEEDS_KMH = {'driving': 22.0, 'walking': 4.5, 'transit': 18.0}
TRANSIT_WAIT_MIN = 8.0
