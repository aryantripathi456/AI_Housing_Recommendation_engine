"""Module 3 endpoint — liveability breakdown for radar/donut charts."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.models import Property
from app.db.session import get_db
from app.schemas.property import LiveabilityOut
from app.services import liveability as liv

router = APIRouter(prefix='/properties', tags=['liveability'])


@router.get('/{property_id}/liveability', response_model=LiveabilityOut,
            response_model_by_alias=True)
def liveability(property_id: str, db: Session = Depends(get_db)):
    p = db.query(Property).filter_by(id=property_id).first()
    if not p:
        raise HTTPException(status_code=404, detail='Property not found')
    res = liv.get_for_property(db, p.id, p.latitude, p.longitude)
    return LiveabilityOut(property_id=p.id, overall=res['overall'],
                          dimensions=res['dimensions'],
                          poi_counts=res['poi_counts'], cached=res['cached'])
