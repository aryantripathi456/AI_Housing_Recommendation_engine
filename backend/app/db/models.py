"""SQLAlchemy models.

SQLite-dev note: spatial columns are plain latitude/longitude floats (+ JSON).
This keeps every model migratable to PostgreSQL + PostGIS later by swapping
the engine URL and adding geography columns — no query logic lives in SQL
that PostGIS would need to own (all geo math is in Python services).
"""

from sqlalchemy import JSON, Boolean, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class Property(Base):
    __tablename__ = 'properties'

    id: Mapped[str] = mapped_column(String(16), primary_key=True)
    title: Mapped[str] = mapped_column(String(160))
    location: Mapped[str] = mapped_column(String(80))  # neighbourhood, e.g. Bandra West
    city: Mapped[str] = mapped_column(String(80))
    price: Mapped[int] = mapped_column(Integer)  # monthly rent (rent) or total price (sale), INR
    listing_type: Mapped[str] = mapped_column(String(8), default='rent', index=True)  # rent|sale
    type: Mapped[str] = mapped_column(String(24))  # Apartment|House|Studio|Villa|Shared
    bedrooms: Mapped[int] = mapped_column(Integer)
    bathrooms: Mapped[int] = mapped_column(Integer)
    area: Mapped[int] = mapped_column(Integer)  # sq.ft
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    image: Mapped[str] = mapped_column(Text)
    amenities: Mapped[list] = mapped_column(JSON, default=list)
    personas: Mapped[list] = mapped_column(JSON, default=list)
    distance_to_work: Mapped[float | None] = mapped_column(Float, nullable=True)
    distance_to_college: Mapped[float | None] = mapped_column(Float, nullable=True)
    rating: Mapped[float] = mapped_column(Float, default=4.0)
    furnished: Mapped[bool] = mapped_column(Boolean, default=False)
    description: Mapped[str] = mapped_column(Text, default='')
    # {"student": [...], "professional": [...], "family": [...], "senior": [...]}
    recommendation_reasons: Mapped[dict] = mapped_column(JSON, default=dict)


class POI(Base):
    """Cached point of interest (synthetic seed now; Overpass ingestion later)."""

    __tablename__ = 'pois'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(160))
    # transport | education | healthcare | shopping | environment
    category: Mapped[str] = mapped_column(String(24), index=True)
    kind: Mapped[str] = mapped_column(String(64), default='')  # e.g. metro_station
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    locality: Mapped[str] = mapped_column(String(80), default='')


class LiveabilityCache(Base):
    __tablename__ = 'liveability_cache'

    property_id: Mapped[str] = mapped_column(
        String(16), ForeignKey('properties.id'), primary_key=True
    )
    overall: Mapped[float] = mapped_column(Float)
    dimensions: Mapped[dict] = mapped_column(JSON, default=dict)  # 0-100 per dimension
    poi_counts: Mapped[dict] = mapped_column(JSON, default=dict)


class PriceSnapshot(Base):
    """Monthly average rent per locality — feeds the trend visualizer."""

    __tablename__ = 'price_snapshots'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    locality: Mapped[str] = mapped_column(String(80), index=True)
    month: Mapped[str] = mapped_column(String(7), index=True)  # YYYY-MM
    avg_rent: Mapped[int] = mapped_column(Integer)


class CommuteCache(Base):
    """Cached routing results so Mapbox quota is spent once per O/D/mode."""

    __tablename__ = 'commute_cache'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    origin_lat: Mapped[float] = mapped_column(Float)
    origin_lng: Mapped[float] = mapped_column(Float)
    dest_lat: Mapped[float] = mapped_column(Float)
    dest_lng: Mapped[float] = mapped_column(Float)
    mode: Mapped[str] = mapped_column(String(16))  # driving | walking | transit
    duration_min: Mapped[float] = mapped_column(Float)
    distance_km: Mapped[float] = mapped_column(Float)
    source: Mapped[str] = mapped_column(String(16), default='estimated')  # live|estimated
