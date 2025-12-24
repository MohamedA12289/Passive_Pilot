from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.db import get_db
from app.core.deps import require_active_subscription
from app.schemas.geocode import GeocodeRequest, GeocodeResult
from app.services.geocode import geocode_query

router = APIRouter()


@router.post("", response_model=GeocodeResult)
def geocode(
    payload: GeocodeRequest,
    _: object = Depends(require_active_subscription),
    db: Session = Depends(get_db),
) -> GeocodeResult:
    q = payload.q.strip()
    if not q:
        raise HTTPException(status_code=400, detail="q is required")

    provider = (getattr(settings, "GEOCODE_PROVIDER", None) or "stub").strip().lower()

    try:
        row, cached = geocode_query(db=db, q=q, provider=provider)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    return GeocodeResult(
        q=q,
        provider=row.provider,
        lat=row.lat,
        lon=row.lon,
        cached=cached,
        created_at=row.created_at,
    )
