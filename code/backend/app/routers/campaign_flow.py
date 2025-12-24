from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import require_active_subscription
from app.models.campaign import Campaign
from app.models.campaign_flow import CampaignFlow
from app.models.user import User
from app.schemas.campaign_flow import CampaignFlowOut, CampaignFlowStepUpdate, CampaignFlowUpdate

router = APIRouter()


def _get_owned_campaign(db: Session, campaign_id: int, user_id: int) -> Campaign:
    c = (
        db.query(Campaign)
        .filter(Campaign.id == campaign_id, Campaign.created_by_user_id == user_id)
        .first()
    )
    if not c:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return c


def _get_or_create_flow(db: Session, campaign_id: int, user_id: int) -> CampaignFlow:
    flow = (
        db.query(CampaignFlow)
        .filter(CampaignFlow.campaign_id == campaign_id, CampaignFlow.created_by_user_id == user_id)
        .first()
    )
    if flow:
        return flow
    flow = CampaignFlow(
        campaign_id=campaign_id,
        created_by_user_id=user_id,
        current_step=1,
        status="in_progress",
        state={},
    )
    db.add(flow)
    db.commit()
    db.refresh(flow)
    return flow


@router.get("/{campaign_id}/flow", response_model=CampaignFlowOut)
def get_campaign_flow(
    campaign_id: int,
    current_user: User = Depends(require_active_subscription),
    db: Session = Depends(get_db),
):
    _get_owned_campaign(db, campaign_id, current_user.id)
    flow = _get_or_create_flow(db, campaign_id, current_user.id)
    return flow


@router.put("/{campaign_id}/flow", response_model=CampaignFlowOut)
def update_campaign_flow(
    campaign_id: int,
    payload: CampaignFlowUpdate,
    current_user: User = Depends(require_active_subscription),
    db: Session = Depends(get_db),
):
    _get_owned_campaign(db, campaign_id, current_user.id)
    flow = _get_or_create_flow(db, campaign_id, current_user.id)

    if payload.current_step is not None:
        flow.current_step = payload.current_step
    if payload.status is not None:
        flow.status = payload.status

    if payload.state is not None:
        if payload.replace_state:
            flow.state = payload.state
        else:
            merged = dict(flow.state or {})
            merged.update(payload.state)
            flow.state = merged

    db.commit()
    db.refresh(flow)
    return flow


@router.post("/{campaign_id}/flow/step", response_model=CampaignFlowOut)
def set_campaign_flow_step(
    campaign_id: int,
    payload: CampaignFlowStepUpdate,
    current_user: User = Depends(require_active_subscription),
    db: Session = Depends(get_db),
):
    _get_owned_campaign(db, campaign_id, current_user.id)
    flow = _get_or_create_flow(db, campaign_id, current_user.id)
    flow.current_step = payload.current_step
    db.commit()
    db.refresh(flow)
    return flow


@router.post("/{campaign_id}/flow/reset")
def reset_campaign_flow(
    campaign_id: int,
    current_user: User = Depends(require_active_subscription),
    db: Session = Depends(get_db),
):
    _get_owned_campaign(db, campaign_id, current_user.id)
    flow = (
        db.query(CampaignFlow)
        .filter(CampaignFlow.campaign_id == campaign_id, CampaignFlow.created_by_user_id == current_user.id)
        .first()
    )
    if flow:
        db.delete(flow)
        db.commit()
    return {"reset": True, "campaign_id": campaign_id}
