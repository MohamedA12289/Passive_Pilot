from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import require_active_subscription
from app.models.campaign import Campaign
from app.models.user import User

from app.schemas.providers import PopulateIn
from app.schemas.populate import PopulateResultOut
from app.schemas.filters import FilterSpec
from app.services.filters_store import parse_filter_spec

from app.services.populate import populate_campaign_from_provider

router = APIRouter()

@router.post("/{campaign_id}/populate", response_model=PopulateResultOut)
async def populate_campaign(
    campaign_id: int,
    payload: PopulateIn,
    current_user: User = Depends(require_active_subscription),
    db: Session = Depends(get_db),
):
    c = db.query(Campaign).filter(Campaign.id == campaign_id, Campaign.created_by_user_id == current_user.id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Campaign not found")

    provider = payload.provider.strip().lower()

    # ✅ DealMachine removed
    if provider not in ("attom", "repliers"):
        raise HTTPException(status_code=400, detail="Invalid provider")

    # ✅ use campaign saved filters (front-end can edit these)
    campaign_filters: FilterSpec = parse_filter_spec(c.filter_spec_json)

    # ✅ zipcode from request is still supported, and also stored into filter spec for the run
    run_filters = campaign_filters.model_copy(deep=True)
    if getattr(payload, "zipcode", None):
        if not run_filters.zip_codes:
            run_filters.zip_codes = []
        if payload.zipcode not in run_filters.zip_codes:
            run_filters.zip_codes.append(payload.zipcode)

    created = await populate_campaign_from_provider(
        db=db,
        campaign_id=c.id,
        provider_name=provider,
        zipcode=payload.zipcode,
        limit=max(1, min(payload.limit, 500)),
        filters=run_filters,  # ✅ NEW (needs populate service update below)
    )

    return PopulateResultOut(
        created_leads=created,
        provider=provider,
        note="Provider is stubbed for now. Filters are saved + passed correctly; implement provider fetch/translate next."
    )
