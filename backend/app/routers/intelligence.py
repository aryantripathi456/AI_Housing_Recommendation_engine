"""Module 4 + 5 endpoints — commute matrix and affordability gauge data."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.models import Property
from app.db.session import get_db
from app.schemas.property import (
    AffordabilityOut,
    AffordabilityRequest,
    CommuteOut,
    CommuteRequest,
)
from app.services import affordability as aff
from app.services import commute as com

router = APIRouter(tags=['intelligence'])


@router.post('/commute', response_model=CommuteOut, response_model_by_alias=True)
def commute(req: CommuteRequest, db: Session = Depends(get_db)):
    return com.route(db, req.origin_lat, req.origin_lng, req.dest_lat, req.dest_lng, req.modes)


@router.post('/affordability', response_model=AffordabilityOut, response_model_by_alias=True)
def affordability(req: AffordabilityRequest, db: Session = Depends(get_db)):
    price = req.price
    if price is None and req.property_id:
        p = db.query(Property).filter_by(id=req.property_id).first()
        if not p:
            raise HTTPException(status_code=404, detail='Property not found')
        price = p.price
    if price is None:
        raise HTTPException(status_code=422, detail='Provide price or property_id')
    try:
        return aff.evaluate(price, req.monthly_income)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
