"""Shared router helpers: ORM -> response models, neutral base scores."""

from app.db.models import Property
from app.schemas.property import PropertyOut


def to_out(p: Property, match_score: float | None = None,
           reasons: dict[str, list[str]] | None = None) -> PropertyOut:
    out = PropertyOut.model_validate(p)
    # Neutral pre-recommendation score so GET /api/properties still yields a
    # meaningful matchScore (rating-anchored, 70..97 range).
    out.match_score = round(match_score if match_score is not None
                            else min(97.0, 70.0 + p.rating * 5.0), 1)
    if reasons is not None:
        out.recommendation_reasons = reasons
    return out
