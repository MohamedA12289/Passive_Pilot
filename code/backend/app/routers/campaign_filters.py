from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import require_active_subscription
from app.models.campaign import Campaign
from app.models.user import User
from app.schemas.campaign_filters import CampaignFiltersIn, CampaignFiltersOut
from app.services.filters_store import parse_filter_spec, dump_filter_spec

router = APIRouter()

def _ensure_campaign_owned(db: Session, user_id: int, campaign_id: int) -> Campaign:
    c = db.query(Campaign).filter(Campaign.id == campaign_id, Campaign.created_by_user_id == user_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return c


@router.get("/{campaign_id}/filters", response_model=CampaignFiltersOut)
def get_campaign_filters(
    campaign_id: int,
    current_user: User = Depends(require_active_subscription),
    db: Session = Depends(get_db),
):
    c = _ensure_campaign_owned(db, current_user.id, campaign_id)
    spec = parse_filter_spec(c.filter_spec_json)
    return CampaignFiltersOut(campaign_id=c.id, filters=spec)


@router.put("/{campaign_id}/filters", response_model=CampaignFiltersOut)
def set_campaign_filters(
    campaign_id: int,
    payload: CampaignFiltersIn,
    current_user: User = Depends(require_active_subscription),
    db: Session = Depends(get_db),
):
    c = _ensure_campaign_owned(db, current_user.id, campaign_id)
    c.filter_spec_json = dump_filter_spec(payload.filters)
    db.commit()
    spec = parse_filter_spec(c.filter_spec_json)
    return CampaignFiltersOut(campaign_id=c.id, filters=spec)
