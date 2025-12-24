from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import require_active_subscription
from app.models.campaign import Campaign
from app.models.lead import Lead
from app.models.user import User
from app.schemas.analyzer import (
    AnalyzerCampaignSummary,
    AnalyzerZipBreakdown,
    LeadScoreInput,
    LeadScoreResponse,
    LeadScoreRow,
)
from app.services.analyzer_engine import campaign_summary, campaign_zip_breakdown, score_lead

router = APIRouter()


def _ensure_campaign_owned(db: Session, user_id: int, campaign_id: int) -> Campaign:
    c = db.query(Campaign).filter(Campaign.id == campaign_id, Campaign.created_by_user_id == user_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return c


@router.get("/campaign/{campaign_id}/summary", response_model=AnalyzerCampaignSummary)
def get_campaign_summary(
    campaign_id: int,
    current_user: User = Depends(require_active_subscription),
    db: Session = Depends(get_db),
):
    _ensure_campaign_owned(db, current_user.id, campaign_id)
    return AnalyzerCampaignSummary(**campaign_summary(db, campaign_id))


@router.get("/campaign/{campaign_id}/zip-breakdown", response_model=AnalyzerZipBreakdown)
def get_campaign_zip_breakdown(
    campaign_id: int,
    current_user: User = Depends(require_active_subscription),
    db: Session = Depends(get_db),
):
    _ensure_campaign_owned(db, current_user.id, campaign_id)
    return AnalyzerZipBreakdown(**campaign_zip_breakdown(db, campaign_id))


@router.post("/score-leads", response_model=LeadScoreResponse)
def score_leads(
    payload: LeadScoreInput,
    current_user: User = Depends(require_active_subscription),
    db: Session = Depends(get_db),
):
    # If campaign_id is provided, we score all leads in that campaign.
    leads = []
    if payload.campaign_id is not None:
        _ensure_campaign_owned(db, current_user.id, payload.campaign_id)
        leads = db.query(Lead).filter(Lead.campaign_id == payload.campaign_id).all()
    else:
        if not payload.lead_ids:
            raise HTTPException(status_code=400, detail="Provide campaign_id or lead_ids")
        # Ensure every lead belongs to campaigns owned by this user.
        leads = db.query(Lead).filter(Lead.id.in_(payload.lead_ids)).all()
        if len(leads) != len(set(payload.lead_ids)):
            raise HTTPException(status_code=404, detail="One or more leads not found")
        owned_campaign_ids = {
            c.id for c in db.query(Campaign).filter(Campaign.created_by_user_id == current_user.id).all()
        }
        for l in leads:
            if l.campaign_id not in owned_campaign_ids:
                raise HTTPException(status_code=403, detail="Not enough permissions")

    results = []
    for l in leads:
        s = score_lead(l)
        results.append(LeadScoreRow(lead_id=s.lead_id, score=s.score, reasons=s.reasons, metadata=s.metadata))

    # Sort by best score first
    results.sort(key=lambda r: r.score, reverse=True)
    return LeadScoreResponse(results=results)
