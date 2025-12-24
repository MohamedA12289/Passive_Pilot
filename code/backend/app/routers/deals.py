from __future__ import annotations
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import require_active_subscription
from app.models.user import User
from app.models.campaign import Campaign
from app.models.deal import Deal
from app.models.deal_event import DealEvent
from app.schemas.deals import (
    DealCreate, DealOut, DealUpdate, DealEventCreate, DealEventOut,
    PropertyDataForAnalysis, DealAnalysisOut
)
from app.services.deal_scoring import analyze_deal
from app.providers.base import ProviderLead

router = APIRouter()

VALID_STATUSES = {"lead", "under_contract", "closed", "dead"}

def _ensure_campaign_owned(db: Session, user_id: int, campaign_id: int) -> Campaign:
    c = db.query(Campaign).filter(Campaign.id == campaign_id, Campaign.created_by_user_id == user_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return c

def _ensure_deal_owned(db: Session, user_id: int, deal_id: int) -> Deal:
    d = db.query(Deal).filter(Deal.id == deal_id, Deal.created_by_user_id == user_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Deal not found")
    return d

def _deal_to_out(d: Deal) -> DealOut:
    """Convert Deal model to DealOut schema"""
    return DealOut(
        id=d.id,
        created_by_user_id=d.created_by_user_id,
        campaign_id=d.campaign_id,
        address=d.address,
        city=d.city,
        state=d.state,
        zip_code=d.zip_code,
        bedrooms=d.bedrooms,
        bathrooms=d.bathrooms,
        sqft=d.sqft,
        lot_size=d.lot_size,
        year_built=d.year_built,
        property_type=d.property_type,
        status=d.status,
        purchase_price=d.purchase_price,
        list_price=d.list_price,
        estimated_value=d.estimated_value,
        assessed_value=d.assessed_value,
        last_sale_price=d.last_sale_price,
        arv=d.arv,
        repair_estimate=d.repair_estimate,
        mao=d.mao,
        deal_score=d.deal_score,
        equity_percent=d.equity_percent,
        mortgage_amount=d.mortgage_amount,
        owner_occupied=d.owner_occupied,
        absentee_owner=d.absentee_owner,
        notes=d.notes,
        provider_name=d.provider_name,
        provider_id=d.provider_id,
        created_at=d.created_at,
        updated_at=d.updated_at,
    )

@router.get("/", response_model=list[DealOut])
def list_deals(
    campaign_id: int | None = None,
    status: str | None = None,
    current_user: User = Depends(require_active_subscription),
    db: Session = Depends(get_db),
):
    q = db.query(Deal).filter(Deal.created_by_user_id == current_user.id)

    if campaign_id is not None:
        _ensure_campaign_owned(db, current_user.id, campaign_id)
        q = q.filter(Deal.campaign_id == campaign_id)

    if status is not None:
        if status not in VALID_STATUSES:
            raise HTTPException(status_code=400, detail="Invalid status")
        q = q.filter(Deal.status == status)

    q = q.order_by(Deal.id.desc())
    deals = q.all()
    return [_deal_to_out(d) for d in deals]

@router.post("/", response_model=DealOut)
def create_deal(
    payload: DealCreate,
    current_user: User = Depends(require_active_subscription),
    db: Session = Depends(get_db),
):
    if payload.status and payload.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status")

    if payload.campaign_id is not None:
        _ensure_campaign_owned(db, current_user.id, payload.campaign_id)

    d = Deal(
        created_by_user_id=current_user.id,
        campaign_id=payload.campaign_id,
        address=payload.address,
        city=payload.city,
        state=payload.state,
        zip_code=payload.zip_code,
        status=(payload.status or "lead"),
        purchase_price=payload.purchase_price,
        arv=payload.arv,
        repair_estimate=payload.repair_estimate,
        notes=payload.notes,
    )
    db.add(d)
    db.commit()
    db.refresh(d)

    # create a default event to start timeline
    ev = DealEvent(deal_id=d.id, event_type="note", message="Deal created")
    db.add(ev)
    db.commit()

    return _deal_to_out(d)

@router.get("/{deal_id}", response_model=DealOut)
def get_deal(
    deal_id: int,
    current_user: User = Depends(require_active_subscription),
    db: Session = Depends(get_db),
):
    d = _ensure_deal_owned(db, current_user.id, deal_id)
    return _deal_to_out(d)

@router.patch("/{deal_id}", response_model=DealOut)
def update_deal(
    deal_id: int,
    payload: DealUpdate,
    current_user: User = Depends(require_active_subscription),
    db: Session = Depends(get_db),
):
    d = _ensure_deal_owned(db, current_user.id, deal_id)

    if payload.status is not None and payload.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status")

    if payload.campaign_id is not None:
        _ensure_campaign_owned(db, current_user.id, payload.campaign_id)
        d.campaign_id = payload.campaign_id

    # patch fields
    for field in ["address","city","state","zip_code","notes","purchase_price","arv","repair_estimate","status"]:
        val = getattr(payload, field)
        if val is not None:
            setattr(d, field, val)

    db.add(d)
    db.commit()
    db.refresh(d)

    # timeline event if status changed
    if payload.status is not None:
        ev = DealEvent(deal_id=d.id, event_type="status_change", message=f"Status set to {payload.status}")
        db.add(ev)
        db.commit()

    return _deal_to_out(d)

@router.delete("/{deal_id}")
def delete_deal(
    deal_id: int,
    current_user: User = Depends(require_active_subscription),
    db: Session = Depends(get_db),
):
    d = _ensure_deal_owned(db, current_user.id, deal_id)
    db.delete(d)
    db.commit()
    return {"deleted": True, "deal_id": deal_id}

@router.get("/{deal_id}/events", response_model=list[DealEventOut])
def list_deal_events(
    deal_id: int,
    current_user: User = Depends(require_active_subscription),
    db: Session = Depends(get_db),
):
    _ensure_deal_owned(db, current_user.id, deal_id)
    q = db.query(DealEvent).filter(DealEvent.deal_id == deal_id).order_by(DealEvent.occurred_at.asc(), DealEvent.id.asc())
    events = q.all()
    return [
        DealEventOut(
            id=e.id,
            deal_id=e.deal_id,
            event_type=e.event_type,
            message=e.message,
            occurred_at=e.occurred_at,
            created_at=e.created_at,
        )
        for e in events
    ]

@router.post("/{deal_id}/events", response_model=DealEventOut)
def create_deal_event(
    deal_id: int,
    payload: DealEventCreate,
    current_user: User = Depends(require_active_subscription),
    db: Session = Depends(get_db),
):
    _ensure_deal_owned(db, current_user.id, deal_id)

    occurred_at = payload.occurred_at or datetime.utcnow()
    e = DealEvent(
        deal_id=deal_id,
        event_type=payload.event_type,
        message=payload.message,
        occurred_at=occurred_at,
    )
    db.add(e)
    db.commit()
    db.refresh(e)

    return DealEventOut(
        id=e.id,
        deal_id=e.deal_id,
        event_type=e.event_type,
        message=e.message,
        occurred_at=e.occurred_at,
        created_at=e.created_at,
    )


@router.post("/analyze", response_model=DealAnalysisOut)
def analyze_property_deal(
    payload: PropertyDataForAnalysis,
    current_user: User = Depends(require_active_subscription),
):
    """
    Analyze a property deal and calculate ARV, repair estimates, MAO, and deal score.
    
    This endpoint does not save anything to the database - it's a pure calculation.
    Use this to analyze properties before creating deals.
    
    Example:
        POST /deals/analyze
        {
            "address": "123 Main St",
            "city": "Austin",
            "state": "TX",
            "zip_code": "78704",
            "bedrooms": 3,
            "bathrooms": 2,
            "sqft": 1800,
            "year_built": 1985,
            "estimated_value": 350000,
            "asking_price": 280000
        }
    """
    # Convert request to ProviderLead format
    lead = ProviderLead(
        address=payload.address,
        city=payload.city,
        state=payload.state,
        zip_code=payload.zip_code,
        bedrooms=payload.bedrooms,
        bathrooms=payload.bathrooms,
        sqft=payload.sqft,
        lot_size=payload.lot_size,
        year_built=payload.year_built,
        property_type=payload.property_type,
        estimated_value=payload.estimated_value,
        assessed_value=payload.assessed_value,
        last_sale_price=payload.last_sale_price,
        last_sale_date=payload.last_sale_date,
        owner_name=payload.owner_name,
        owner_occupied=payload.owner_occupied,
        absentee_owner=payload.absentee_owner,
        equity_percent=payload.equity_percent,
        mortgage_amount=payload.mortgage_amount,
    )
    
    try:
        # Run deal analysis
        analysis = analyze_deal(
            lead=lead,
            asking_price=payload.asking_price,
            condition_override=payload.condition_override,
        )
        
        return DealAnalysisOut(
            arv=analysis.arv,
            repair_estimate=analysis.repair_estimate,
            mao=analysis.mao,
            deal_score=analysis.deal_score,
            estimated_value=analysis.estimated_value,
            spread=analysis.spread,
            spread_percent=analysis.spread_percent,
            score_breakdown=analysis.score_breakdown,
            recommendation=analysis.recommendation,
            notes=analysis.notes,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))