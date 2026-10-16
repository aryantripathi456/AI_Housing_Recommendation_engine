"""Seed the SQLite dev DB with the synthetic dataset.

Usage (from backend/ with venv active):
    python -m data.seed_db [--reset]
"""

import argparse
import sys

sys.path.insert(0, '.')

from app.db.models import Base, LiveabilityCache, POI, PriceSnapshot, Property
from app.db.session import SessionLocal, engine
from data.synthetic import (
    generate_pois,
    generate_price_snapshots,
    generate_properties,
    generate_real_station_pois,
    generate_sale_properties,
)


def seed(reset: bool = False) -> dict[str, int]:
    if reset:
        Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    db = SessionLocal()
    try:
        counts = {}
        if db.query(Property).count() == 0 or reset:
            if reset:
                db.query(LiveabilityCache).delete()
                db.query(Property).delete()
            props = generate_properties() + generate_sale_properties()
            db.add_all(Property(**p) for p in props)
            counts['properties'] = len(props)
            counts['rent'] = sum(1 for p in props if p.get('listing_type', 'rent') == 'rent')
            counts['sale'] = sum(1 for p in props if p.get('listing_type') == 'sale')
        else:
            counts['properties'] = db.query(Property).count()

        if db.query(POI).count() == 0 or reset:
            if reset:
                db.query(POI).delete()
            pois = generate_pois() + generate_real_station_pois()
            db.add_all(POI(**p) for p in pois)
            counts['pois'] = len(pois)
            counts['railway_stations'] = len(generate_real_station_pois())
        else:
            # Backfill for DBs seeded before real stations / sale listings existed.
            existing_station_names = {
                r[0] for r in db.query(POI.name).filter(POI.kind == 'railway_station').all()
            }
            stations = [s for s in generate_real_station_pois()
                        if s['name'] not in existing_station_names]
            if stations:
                db.add_all(POI(**p) for p in stations)
            # Drop any legacy synthetic railway_station POIs with fake names.
            legacy = db.query(POI).filter(
                POI.kind == 'railway_station',
                POI.name.like('%railway station%'),
            ).all()
            for row in legacy:
                db.delete(row)
            # Backfill listing_type default for old rows (pre-migration DBs).
            try:
                db.query(Property).filter(Property.listing_type.is_(None)).update(
                    {'listing_type': 'rent'}, synchronize_session=False)
            except Exception:
                pass
            # Backfill sale listings if missing.
            if db.query(Property).filter(Property.listing_type == 'sale').count() == 0:
                sale = generate_sale_properties()
                db.add_all(Property(**p) for p in sale)
                counts['sale_backfilled'] = len(sale)
            counts['pois'] = db.query(POI).count()
            counts['stations_backfilled'] = len(stations)
            counts['legacy_station_pois_removed'] = len(legacy)

        if db.query(PriceSnapshot).count() == 0 or reset:
            if reset:
                db.query(PriceSnapshot).delete()
            snaps = generate_price_snapshots()
            db.add_all(PriceSnapshot(**s) for s in snaps)
            counts['snapshots'] = len(snaps)
        else:
            counts['snapshots'] = db.query(PriceSnapshot).count()

        db.commit()
        return counts
    finally:
        db.close()


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--reset', action='store_true')
    args = ap.parse_args()
    print(seed(reset=args.reset))
