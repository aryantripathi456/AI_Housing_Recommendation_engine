"""Pydantic schemas. camelCase aliases keep responses drop-in compatible
with the existing frontend TypeScript types (Property, Filters,
RecommendationRequest in frontend/src/types/property.ts).
"""

from pydantic import BaseModel, ConfigDict, Field
from typing import Literal

Persona = Literal['student', 'professional', 'family', 'senior']
PropertyType = Literal['Apartment', 'House', 'Studio', 'Villa', 'Shared']
SortOption = Literal['best-match', 'price-asc', 'price-desc', 'distance', 'rating']


def _to_camel(s: str) -> str:
    parts = s.split('_')
    return parts[0] + ''.join(p.capitalize() for p in parts[1:])


class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=_to_camel, populate_by_name=True, from_attributes=True
    )


class NearestStationOut(CamelModel):
    name: str
    distance_km: float
    latitude: float
    longitude: float
    locality: str = ''


class NearestStationsOut(CamelModel):
    property_id: str
    stations: list[NearestStationOut] = Field(default_factory=list)


class PropertyOut(CamelModel):
    id: str
    title: str
    location: str
    city: str
    price: int
    listing_type: str = 'rent'  # rent | sale
    type: str
    bedrooms: int
    bathrooms: int
    area: int
    latitude: float
    longitude: float
    image: str
    amenities: list[str] = []
    match_score: float = 0.0
    personas: list[str] = []
    distance_to_work: float | None = None
    distance_to_college: float | None = None
    rating: float = 0.0
    furnished: bool = False
    description: str = ''
    recommendation_reasons: dict[str, list[str]] = {}
    nearest_stations: list[NearestStationOut] = Field(default_factory=list)


class FiltersIn(CamelModel):
    min_price: float = 0
    max_price: float = 100000
    types: list[str] = Field(default_factory=list)
    bedrooms: list[int] = Field(default_factory=list)
    location: str = ''
    amenities: list[str] = Field(default_factory=list)
    personas: list[str] = Field(default_factory=list)
    listing_type: str | None = None  # rent | sale | None(all)


class RecommendationRequest(CamelModel):
    persona: Persona = 'professional'
    filters: FiltersIn = Field(default_factory=FiltersIn)
    search_query: str = ''
    monthly_income: float | None = None
    work_lat: float | None = None
    work_lng: float | None = None
    college_lat: float | None = None
    college_lng: float | None = None
    listing_type: str | None = None  # rent | sale | None(all)


class LiveabilityOut(CamelModel):
    property_id: str
    overall: float
    dimensions: dict[str, float]
    poi_counts: dict[str, int]
    cached: bool = False


class CommuteModeOut(CamelModel):
    duration_min: float
    distance_km: float
    source: str  # live | estimated


class CommuteOut(CamelModel):
    origin: dict[str, float]
    destination: dict[str, float]
    modes: dict[str, CommuteModeOut]


class CommuteRequest(CamelModel):
    origin_lat: float
    origin_lng: float
    dest_lat: float
    dest_lng: float
    modes: list[str] = Field(default_factory=lambda: ['driving', 'walking', 'transit'])


class AffordabilityRequest(CamelModel):
    monthly_income: float
    price: int | None = None
    property_id: str | None = None


class AffordabilityOut(CamelModel):
    price: int
    monthly_income: float
    rent_to_income: float
    band: str  # Affordable | Moderate Risk | Over Budget
    advice: str


class CompareRequest(CamelModel):
    ids: list[str]
    persona: Persona = 'professional'
    monthly_income: float | None = None


class TrendPoint(CamelModel):
    month: str
    avg_rent: int


class TrendOut(CamelModel):
    locality: str
    points: list[TrendPoint]
