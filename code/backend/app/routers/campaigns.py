from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.deps import require_active_subscription
from app.models.campaign import Campaign
from app.models.user import User
from app.schemas.campaigns import CampaignCreate, CampaignOut, CampaignUpdate

router = APIRouter()

@router.get("/", response_model=list[CampaignOut])
def list_campaigns(current_user: User = Depends(require_active_subscription), db: Session = Depends(get_db)):
    q = db.query(Campaign).filter(Campaign.created_by_user_id == current_user.id).order_by(Campaign.id.desc())
    return [CampaignOut(id=c.id, name=c.name, created_at=c.created_at) for c in q.all()]

@router.post("/", response_model=CampaignOut)
def create_campaign(payload: CampaignCreate, current_user: User = Depends(require_active_subscription), db: Session = Depends(get_db)):
    c = Campaign(name=payload.name, created_by_user_id=current_user.id)
    db.add(c); db.commit(); db.refresh(c)
    return CampaignOut(id=c.id, name=c.name, created_at=c.created_at)

@router.get("/{campaign_id}", response_model=CampaignOut)
def get_campaign(campaign_id: int, current_user: User = Depends(require_active_subscription), db: Session = Depends(get_db)):
    c = db.query(Campaign).filter(Campaign.id == campaign_id, Campaign.created_by_user_id == current_user.id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return CampaignOut(id=c.id, name=c.name, created_at=c.created_at)

@router.patch("/{campaign_id}", response_model=CampaignOut)
def update_campaign(campaign_id: int, payload: CampaignUpdate, current_user: User = Depends(require_active_subscription), db: Session = Depends(get_db)):
    c = db.query(Campaign).filter(Campaign.id == campaign_id, Campaign.created_by_user_id == current_user.id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Campaign not found")
    c.name = payload.name
    db.commit(); db.refresh(c)
    return CampaignOut(id=c.id, name=c.name, created_at=c.created_at)

@router.delete("/{campaign_id}")
def delete_campaign(campaign_id: int, current_user: User = Depends(require_active_subscription), db: Session = Depends(get_db)):
    c = db.query(Campaign).filter(Campaign.id == campaign_id, Campaign.created_by_user_id == current_user.id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Campaign not found")
    db.delete(c); db.commit()
    return {"deleted": True, "campaign_id": campaign_id}
