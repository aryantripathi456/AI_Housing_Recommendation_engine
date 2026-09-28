"""NestAI Housing Intelligence API — FastAPI application factory."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.models import Base
from app.db.session import engine
from app.routers import dashboard, intelligence, liveability, properties, recommendations

@asynccontextmanager
async def lifespan(_app: FastAPI):
    Base.metadata.create_all(engine)
    yield


app = FastAPI(
    title=settings.app_name,
    description=(
        'AI-driven real-estate analytics: persona recommendations (MAUT + cosine), '
        'liveability index, commute analysis, affordability evaluation, comparison '
        'and rent trends. Synopsis: AI Housing Intelligence Platform.'
    ),
    version='0.1.0',
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.get('/health')
def health():
    return {'status': 'ok', 'synthetic_data': True, 'mapbox': bool(settings.mapbox_token)}


app.include_router(properties.router, prefix='/api')
app.include_router(recommendations.router, prefix='/api')
app.include_router(liveability.router, prefix='/api')
app.include_router(intelligence.router, prefix='/api')
app.include_router(dashboard.router, prefix='/api')
