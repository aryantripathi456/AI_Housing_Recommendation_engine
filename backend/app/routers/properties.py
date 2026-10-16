"""GET /api/properties — listing feed with filters, search and sorting."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.models import Property
from app.db.session import get_db
from app.routers.common import to_out
from app.schemas.property import PropertyOut

router = APIRouter(prefix='/properties', tags=['properties'])


def _apply(params: dict, query):
    if params.get('listing_type'):
        query = query.filter(Property.listing_type == params['listing_type'])
    if params.get('min_price') is not None:
        query = query.filter(Property.price >= params['min_price'])
    if params.get('max_price') is not None:
        query = query.filter(Property.price <= params['max_price'])
    if params.get('type'):
        query = query.filter(Property.type == params['type'])
    if params.get('bedrooms') is not None:
        b = params['bedrooms']
        query = query.filter(Property.bedrooms >= 4 if b >= 4 else Property.bedrooms == b)
    if params.get('location'):
        like = f"%{params['location']}%"
        query = query.filter((Property.location.like(like)) | (Property.city.like(like)))
    if params.get('search'):
        for tok in params['search'].lower().split():
            like = f'%{tok}%'
            query = query.filter((Property.title.like(like)) | (Property.location.like(like))
                                 | (Property.city.like(like)) | (Property.type.like(like)))
    return query


@router.get('', response_model=list[PropertyOut], response_model_by_alias=True)
def list_properties(
    min_price: int | None = Query(default=None, ge=0),
    max_price: int | None = Query(default=None, ge=0),
    type: str | None = None,  # noqa: A002 - matches frontend filter naming
    bedrooms: int | None = None,
    location: str | None = None,
    search: str | None = None,
    sort: str = 'best-match',
    limit: int = Query(default=50, le=200),
    offset: int = 0,
    listing_type: str | None = Query(default=None, description='rent|sale|all'),
    db: Session = Depends(get_db),
):
    from app.services import poi as poi_service

    # Back-compat: omitted listing_type means rent-only (original behaviour).
    # Explicit `all` returns both tenures; `sale` returns purchase listings.
    effective = 'rent' if listing_type in (None, '') else listing_type
    listing_filter = None if effective == 'all' else effective
    q = _apply({'listing_type': listing_filter, 'min_price': min_price,
                'max_price': max_price, 'type': type,
                'bedrooms': bedrooms, 'location': location, 'search': search},
               db.query(Property))
    rows = q.all()
    outs = [to_out(p, nearest_stations=poi_service.nearest_stations(
        db, p.latitude, p.longitude)) for p in rows]
    if sort == 'price-asc':
        outs.sort(key=lambda o: o.price)
    elif sort == 'price-desc':
        outs.sort(key=lambda o: -o.price)
    elif sort == 'distance':
        outs.sort(key=lambda o: o.distance_to_work if o.distance_to_work is not None else 1e9)
    elif sort == 'rating':
        outs.sort(key=lambda o: -o.rating)
    else:
        outs.sort(key=lambda o: -o.match_score)
    return outs[offset:offset + limit]


@router.get('/{property_id}', response_model=PropertyOut, response_model_by_alias=True)
def get_property(property_id: str, db: Session = Depends(get_db)):
    from app.services import poi as poi_service

    p = db.query(Property).filter_by(id=property_id).first()
    if not p:
        raise HTTPException(status_code=404, detail='Property not found')
    return to_out(p, nearest_stations=poi_service.nearest_stations(
        db, p.latitude, p.longitude))
