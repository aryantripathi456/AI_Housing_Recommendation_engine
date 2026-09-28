"""Seed the SQLite dev DB with the synthetic dataset.

Usage (from backend/ with venv active):
    python -m data.seed_db [--reset]
"""

import argparse
import sys

sys.path.insert(0, '.')

from app.db.models import Base, POI, PriceSnapshot, Property
from app.db.session import SessionLocal, engine
from data.synthetic import generate_pois, generate_price_snapshots, generate_properties


def seed(reset: bool = False) -> dict[str, int]:
    if reset:
        Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    db = SessionLocal()
    try:
        counts = {}
        if db.query(Property).count() == 0 or reset:
            if reset:
                db.query(Property).delete()
            props = generate_properties()
            db.add_all(Property(**p) for p in props)
            counts['properties'] = len(props)
        else:
            counts['properties'] = db.query(Property).count()

        if db.query(POI).count() == 0 or reset:
            if reset:
                db.query(POI).delete()
            pois = generate_pois()
            db.add_all(POI(**p) for p in pois)
            counts['pois'] = len(pois)
        else:
            counts['pois'] = db.query(POI).count()

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
