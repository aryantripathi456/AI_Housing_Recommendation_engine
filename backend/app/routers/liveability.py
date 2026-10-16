"""Module 3 endpoint — liveability breakdown for radar/donut charts."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.models import Property
from app.db.session import get_db
from app.schemas.property import LiveabilityOut, NearestStationsOut, NearestStationOut
from app.services import liveability as liv
from app.services import poi as poi_service

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


@router.get('/{property_id}/nearest-stations', response_model=NearestStationsOut,
            response_model_by_alias=True)
def nearest_stations(property_id: str, db: Session = Depends(get_db)):
    """3 nearest railway stations + distances (km) for a property."""
    p = db.query(Property).filter_by(id=property_id).first()
    if not p:
        raise HTTPException(status_code=404, detail='Property not found')
    stations = poi_service.nearest_stations(db, p.latitude, p.longitude)
    return NearestStationsOut(
        property_id=p.id,
        stations=[NearestStationOut(**s) for s in stations],
    )
