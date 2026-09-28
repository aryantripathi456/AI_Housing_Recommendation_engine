"""POST /api/recommendations — persona-ranked properties (Modules 1+2).

Drop-in replacement for the frontend mock `getRecommendations()`.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.models import Property
from app.db.session import get_db
from app.routers.common import to_out
from app.schemas.property import PropertyOut, RecommendationRequest
from app.services import recommender

router = APIRouter(prefix='/recommendations', tags=['recommendations'])


@router.post('', response_model=list[PropertyOut], response_model_by_alias=True)
def recommend(req: RecommendationRequest, db: Session = Depends(get_db)):
    f = req.filters.model_dump()
    work = (req.work_lat, req.work_lng) if req.work_lat is not None and req.work_lng is not None else None
    properties = db.query(Property).all()
    ranked = recommender.rank(
        db, properties, req.persona, f,
        search_query=req.search_query,
        income=req.monthly_income, work=work,
    )
    return [
        to_out(p, match_score=score,
               reasons={req.persona: recommender.build_reasons(p, req.persona, subs, req.monthly_income)}
               | {k: v for k, v in (p.recommendation_reasons or {}).items() if k != req.persona})
        for p, score, subs in ranked
    ]
