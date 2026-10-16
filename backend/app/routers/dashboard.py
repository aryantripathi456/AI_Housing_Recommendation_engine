"""Module 6 endpoints — side-by-side comparison matrix + rent trends."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.models import PriceSnapshot, Property
from app.db.session import get_db
from app.routers.common import to_out
from app.schemas.property import CompareRequest, PropertyOut, TrendOut, TrendPoint
from app.services import affordability as aff
from app.services import liveability as liv
from app.services import recommender

router = APIRouter(tags=['dashboard'])


@router.post('/compare')
def compare(req: CompareRequest, db: Session = Depends(get_db)):
    from app.services import poi as poi_service

    if len(req.ids) > 3:
        raise HTTPException(status_code=422, detail='Compare at most 3 properties')
    items = []
    for pid in req.ids:
        p = db.query(Property).filter_by(id=pid).first()
        if not p:
            raise HTTPException(status_code=404, detail=f'Property {pid} not found')
        l = liv.get_for_property(db, p.id, p.latitude, p.longitude)
        entry: dict = {
            'property': to_out(
                p, nearest_stations=poi_service.nearest_stations(
                    db, p.latitude, p.longitude)).model_dump(by_alias=True),
            'liveability': {'overall': l['overall'], 'dimensions': l['dimensions']},
        }
        if req.monthly_income:
            entry['affordability'] = aff.evaluate(
                p.price, req.monthly_income,
                getattr(p, 'listing_type', 'rent') or 'rent')
        items.append(entry)
    return {'items': items}


@router.get('/trends', response_model=list[TrendOut], response_model_by_alias=True)
def trends(localities: str = Query(description='Comma-separated localities'),
           db: Session = Depends(get_db)):
    locs = [l.strip() for l in localities.split(',') if l.strip()]
    if not locs:
        raise HTTPException(status_code=422, detail='Provide at least one locality')
    out = []
    for loc in locs:
        rows = (
            db.query(PriceSnapshot).filter_by(locality=loc)
            .order_by(PriceSnapshot.month).all()
        )
        if not rows:
            raise HTTPException(status_code=404, detail=f'No trend data for {loc}')
        out.append(TrendOut(locality=loc,
                            points=[TrendPoint(month=r.month, avg_rent=r.avg_rent) for r in rows]))
    return out


@router.get('/localities')
def localities(db: Session = Depends(get_db)):
    rows = db.query(PriceSnapshot.locality).distinct().order_by(PriceSnapshot.locality).all()
    locs = [r[0] for r in rows]
    if not locs:
        locs = sorted({p.location for p in db.query(Property.location).distinct()})
    return {'localities': locs}
