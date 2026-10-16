"""Deterministic synthetic dataset (seed=42) for the NestAI backend.

Replaces the planned Kaggle import for now: generates realistic Mumbai
listings, geo-distributed POIs, and monthly rent snapshots with trend +
seasonality + noise. Every generator is seeded so reseeds are reproducible
(important for thesis figures and demo stability).

Locality centres use real Mumbai coordinates matching the frontend mock data.
"""

from __future__ import annotations

import math
import random

RNG_SEED = 42

# (locality, lat, lng, base 2BHK rent, rent spread)
LOCALITIES: list[tuple[str, float, float, int, int]] = [
    ('Bandra West', 19.0596, 72.8295, 34000, 14000),
    ('Andheri West', 19.1363, 72.8262, 27000, 9000),
    ('Powai', 19.1176, 72.9060, 25000, 9000),
    ('Lower Parel', 18.9962, 72.8302, 48000, 16000),
    ('Dadar', 19.0178, 72.8478, 29000, 8000),
    ('Vashi', 19.0770, 72.9986, 21000, 6000),
    ('Thane West', 19.1865, 72.9756, 23000, 8000),
    ('Borivali West', 19.2288, 72.8544, 22000, 6000),
    ('Ghatkopar', 19.0909, 72.9071, 26000, 7000),
    ('Colaba', 18.9217, 72.8346, 42000, 14000),
    ('Chembur', 19.0525, 72.8963, 31000, 10000),
    ('BKC', 19.0626, 72.8656, 55000, 18000),
]

WORK_HUB = (19.0626, 72.8656)  # BKC
COLLEGE_HUB = (19.1334, 72.9133)  # IIT Bombay / Powai academic cluster

TITLE_POOL = [
    'Heights Residence', 'Lakeview Homes', 'Garden Apartments', 'Metro Nest',
    'Skyline Residency', 'Comfort Homes', 'Harbour View', 'Serene Gardens',
    'Diamond Residency', 'Smart Homes', 'Palm Court', 'Sunrise Apartments',
    'Green Acres', 'Heritage House', 'Executive Suites', 'Lotus Enclave',
]

AMENITY_POOL = ['Parking', 'Gym', 'Security', 'Elevator', 'Furnished', 'Pet Friendly', 'WiFi', 'Garden']

IMAGE_POOL = [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=900&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=900&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=900&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=900&q=80&auto=format&fit=crop',
]

DESC_POOL = [
    'Bright, ventilated home with modular kitchen and reserved parking in a managed society.',
    'Well-kept residence minutes from the station with markets, clinics and parks nearby.',
    'Airy floor plan with large windows, power backup and round-the-clock security.',
    'Recently refreshed interiors, strong water supply and easy metro connectivity.',
    'Quiet residential lane with tree cover, grocery stores and daily-needs shops walkable.',
]

REASON_TEMPLATES: dict[str, list[str]] = {
    'student': [
        'Budget-friendly for shared living',
        'Strong metro and bus connectivity',
        'WiFi-ready with study-friendly layout',
        'Cafes and libraries nearby',
    ],
    'professional': [
        'Short commute to business hubs',
        'Metro access for peak-hour travel',
        'Gyms and restaurants in the vicinity',
        'Move-in ready with work-from-home space',
    ],
    'family': [
        'Schools within easy reach',
        'Parks and playgrounds nearby',
        'High neighbourhood safety profile',
        'Grocery and healthcare access close by',
    ],
    'senior': [
        'Quiet residential surroundings',
        'Elevator building with power backup',
        'Hospital and pharmacy within reach',
        'Parks suitable for daily walks',
    ],
}

# Real Mumbai suburban railway stations (name, lat, lng, locality label).
# Coordinates are approximate public station locations.
REAL_RAILWAY_STATIONS: list[tuple[str, float, float, str]] = [
    ('Chhatrapati Shivaji Maharaj Terminus', 18.9398, 72.8355, 'Colaba'),
    ('Churchgate', 18.9354, 72.8276, 'Colaba'),
    ('Marine Lines', 18.9442, 72.8243, 'Colaba'),
    ('Charni Road', 18.9519, 72.8189, 'Colaba'),
    ('Grant Road', 18.9647, 72.8164, 'Lower Parel'),
    ('Mumbai Central', 18.9690, 72.8190, 'Lower Parel'),
    ('Mahalaxmi', 18.9778, 72.8241, 'Lower Parel'),
    ('Lower Parel', 18.9962, 72.8302, 'Lower Parel'),
    ('Prabhadevi', 19.0071, 72.8370, 'Dadar'),
    ('Dadar', 19.0187, 72.8434, 'Dadar'),
    ('Matunga', 19.0272, 72.8574, 'Dadar'),
    ('Kurla', 19.0657, 72.8796, 'Ghatkopar'),
    ('Ghatkopar', 19.0909, 72.9080, 'Ghatkopar'),
    ('Chembur', 19.0525, 72.8993, 'Chembur'),
    ('Bandra', 19.0548, 72.8401, 'Bandra West'),
    ('Khar Road', 19.0688, 72.8413, 'Bandra West'),
    ('Santa Cruz', 19.0812, 72.8419, 'Bandra West'),
    ('Vile Parle', 19.1010, 72.8445, 'Andheri West'),
    ('Andheri', 19.1197, 72.8464, 'Andheri West'),
    ('BKC', 19.0626, 72.8656, 'BKC'),
    ('Borivali', 19.2290, 72.8573, 'Borivali West'),
    ('Thane', 19.1876, 72.9756, 'Thane West'),
    ('Vashi', 19.0770, 72.9948, 'Vashi'),
    ('Powai / Kanjurmarg', 19.1176, 72.9160, 'Powai'),
]

# POI kinds per liveability dimension.
# NOTE: random transport POIs exclude railway_station so seeded real stations
# stay authoritative (avoids fake "Bandra West railway station 1" names).
POI_KINDS: dict[str, list[str]] = {
    'transport': ['metro_station', 'bus_stop'],
    'education': ['school', 'college', 'library'],
    'healthcare': ['hospital', 'clinic', 'pharmacy'],
    'shopping': ['supermarket', 'grocery_store', 'market'],
    'environment': ['park', 'garden', 'lake_front'],
}


def _jitter(rng: random.Random, lat: float, lng: float, max_km: float) -> tuple[float, float]:
    r = max_km * math.sqrt(rng.random())
    theta = rng.random() * 2 * math.pi
    dlat = (r * math.cos(theta)) / 111.0
    dlng = (r * math.sin(theta)) / (111.0 * math.cos(math.radians(lat)))
    return round(lat + dlat, 6), round(lng + dlng, 6)


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    from math import asin, cos, radians, sin, sqrt
    p1, p2 = radians(lat1), radians(lat2)
    a = sin(radians(lat2 - lat1) / 2) ** 2 + cos(p1) * cos(p2) * sin(radians(lon2 - lon1) / 2) ** 2
    return 2 * 6371.0 * asin(sqrt(a))


def generate_properties(per_locality: int = 6) -> list[dict]:
    rng = random.Random(RNG_SEED)
    out: list[dict] = []
    n = 0
    for loc, clat, clng, base, spread in LOCALITIES:
        for i in range(per_locality):
            n += 1
            ptype = rng.choices(
                ['Apartment', 'Apartment', 'Apartment', 'Studio', 'Shared', 'House', 'Villa'],
                k=1,
            )[0]
            bedrooms = {'Studio': 1, 'Shared': 2, 'Apartment': rng.choice([1, 2, 2, 3]),
                        'House': 3, 'Villa': rng.choice([3, 4])}[ptype]
            bathrooms = min(bedrooms, 3) if bedrooms <= 3 else 3
            area = bedrooms * rng.randint(320, 480) + rng.randint(0, 150)
            price = int(round((base * (0.55 + 0.22 * bedrooms) + rng.uniform(-spread, spread)) / 500.0) * 500)
            price = max(9000, price)
            lat, lng = _jitter(rng, clat, clng, 2.2)
            amenities = sorted(rng.sample(AMENITY_POOL, rng.randint(3, 6)))
            furnished = 'Furnished' in amenities
            personas = []
            if price <= 30000:
                personas.append('student')
            if bedrooms >= 2:
                personas.append('family')
            if bedrooms <= 2 and price >= 20000:
                personas.append('professional')
            if 'Elevator' in amenities and price <= 40000:
                personas.append('senior')
            if not personas:
                personas = ['professional']
            rating = round(rng.uniform(3.8, 5.0), 1)
            title = f'{loc.split()[0]} {rng.choice(TITLE_POOL)}'
            out.append({
                'id': f's{n:03d}',
                'title': title,
                'location': loc,
                'city': 'Mumbai, Maharashtra',
                'price': price,
                'listing_type': 'rent',
                'type': ptype,
                'bedrooms': bedrooms,
                'bathrooms': bathrooms,
                'area': area,
                'latitude': lat,
                'longitude': lng,
                'image': IMAGE_POOL[(n - 1) % len(IMAGE_POOL)],
                'amenities': amenities,
                'personas': sorted(set(personas)),
                'distance_to_work': round(_haversine_km(lat, lng, *WORK_HUB) + rng.uniform(0, 1.5), 1),
                'distance_to_college': round(_haversine_km(lat, lng, *COLLEGE_HUB) + rng.uniform(0, 1.0), 1),
                'rating': rating,
                'furnished': furnished,
                'description': rng.choice(DESC_POOL),
                'recommendation_reasons': {
                    k: rng.sample(v, 3) for k, v in REASON_TEMPLATES.items()
                },
            })
    return out


def generate_sale_properties(per_locality: int = 3) -> list[dict]:
    """Purchase listings in INR (total price, not monthly rent)."""
    rng = random.Random(RNG_SEED + 10)
    out: list[dict] = []
    n = 0
    for loc, clat, clng, base, spread in LOCALITIES:
        # Scale monthly base rent to capital value: higher-rent localities cost more.
        # base 21k -> ~85L, base 55k -> ~3.2Cr approx.
        capital_base = int(base * 550)
        capital_spread = int(spread * 550)
        for i in range(per_locality):
            n += 1
            ptype = rng.choices(
                ['Apartment', 'Apartment', 'Apartment', 'House', 'Villa', 'Studio'],
                k=1,
            )[0]
            bedrooms = {'Studio': 1, 'Apartment': rng.choice([1, 2, 2, 3]),
                        'House': 3, 'Villa': rng.choice([3, 4])}[ptype]
            bathrooms = min(bedrooms, 3) if bedrooms <= 3 else 3
            area = bedrooms * rng.randint(340, 520) + rng.randint(50, 200)
            price = int(round((capital_base * (0.55 + 0.22 * bedrooms)
                               + rng.uniform(-capital_spread, capital_spread)) / 100000.0) * 100000)
            price = max(6000000, price)
            lat, lng = _jitter(rng, clat, clng, 2.2)
            amenities = sorted(rng.sample(AMENITY_POOL, rng.randint(3, 6)))
            furnished = 'Furnished' in amenities
            personas = ['family', 'professional']
            if price <= 15000000:
                personas.append('student')
            if 'Elevator' in amenities:
                personas.append('senior')
            rating = round(rng.uniform(3.9, 5.0), 1)
            title = f'{loc.split()[0]} {rng.choice(TITLE_POOL)} (For Sale)'
            out.append({
                'id': f'b{n:03d}',
                'title': title,
                'location': loc,
                'city': 'Mumbai, Maharashtra',
                'price': price,
                'listing_type': 'sale',
                'type': ptype,
                'bedrooms': bedrooms,
                'bathrooms': bathrooms,
                'area': area,
                'latitude': lat,
                'longitude': lng,
                'image': IMAGE_POOL[(n - 1) % len(IMAGE_POOL)],
                'amenities': amenities,
                'personas': sorted(set(personas)),
                'distance_to_work': round(_haversine_km(lat, lng, *WORK_HUB) + rng.uniform(0, 1.5), 1),
                'distance_to_college': round(_haversine_km(lat, lng, *COLLEGE_HUB) + rng.uniform(0, 1.0), 1),
                'rating': rating,
                'furnished': furnished,
                'description': 'Own this ' + rng.choice(DESC_POOL).lower(),
                'recommendation_reasons': {
                    k: rng.sample(v, 3) for k, v in REASON_TEMPLATES.items()
                },
            })
    return out


def generate_real_station_pois() -> list[dict]:
    return [{
        'name': name,
        'category': 'transport',
        'kind': 'railway_station',
        'latitude': lat,
        'longitude': lng,
        'locality': loc,
    } for name, lat, lng, loc in REAL_RAILWAY_STATIONS]


def generate_pois() -> list[dict]:
    rng = random.Random(RNG_SEED + 1)
    out: list[dict] = []
    for loc, clat, clng, _, _ in LOCALITIES:
        for dim, kinds in POI_KINDS.items():
            count = rng.randint(2, 4)
            for i in range(count):
                kind = rng.choice(kinds)
                lat, lng = _jitter(rng, clat, clng, 2.5)
                out.append({
                    'name': f'{loc} {kind.replace("_", " ").title()} {i + 1}',
                    'category': dim,
                    'kind': kind,
                    'latitude': lat,
                    'longitude': lng,
                    'locality': loc,
                })
    return out


def generate_price_snapshots(months: int = 12) -> list[dict]:
    """Monthly locality averages with upward trend + monsoon seasonality + noise.

    NOTE for thesis honesty: these are synthetic series (no multi-year rental
    history exists for these micro-markets). Label charts accordingly.
    """
    import datetime
    rng = random.Random(RNG_SEED + 2)
    out: list[dict] = []
    today = datetime.date(2026, 9, 1)
    for loc, _, _, base, _ in LOCALITIES:
        for m in range(months):
            d = today - datetime.timedelta(days=30 * (months - 1 - m))
            month = d.strftime('%Y-%m')
            trend = base * (1 + 0.004 * m)  # ~0.4%/month drift
            seasonal = base * 0.02 * math.sin(2 * math.pi * d.month / 12)
            noise = rng.uniform(-0.015, 0.015) * base
            out.append({'locality': loc, 'month': month, 'avg_rent': int(round(trend + seasonal + noise))})
    # keep chronological per locality
    out.sort(key=lambda r: (r['locality'], r['month']))
    return out
