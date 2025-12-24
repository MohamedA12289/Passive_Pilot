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
from app.schemas.deals import DealCreate, DealOut, DealUpdate, DealEventCreate, DealEventOut

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
    return [
        DealOut(
            id=d.id,
            created_by_user_id=d.created_by_user_id,
            campaign_id=d.campaign_id,
            address=d.address,
            city=d.city,
            state=d.state,
            zip_code=d.zip_code,
            status=d.status,
            purchase_price=d.purchase_price,
            arv=d.arv,
            repair_estimate=d.repair_estimate,
            notes=d.notes,
            created_at=d.created_at,
            updated_at=d.updated_at,
        )
        for d in deals
    ]

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

    return DealOut(
        id=d.id,
        created_by_user_id=d.created_by_user_id,
        campaign_id=d.campaign_id,
        address=d.address,
        city=d.city,
        state=d.state,
        zip_code=d.zip_code,
        status=d.status,
        purchase_price=d.purchase_price,
        arv=d.arv,
        repair_estimate=d.repair_estimate,
        notes=d.notes,
        created_at=d.created_at,
        updated_at=d.updated_at,
    )

@router.get("/{deal_id}", response_model=DealOut)
def get_deal(
    deal_id: int,
    current_user: User = Depends(require_active_subscription),
    db: Session = Depends(get_db),
):
    d = _ensure_deal_owned(db, current_user.id, deal_id)
    return DealOut(
        id=d.id,
        created_by_user_id=d.created_by_user_id,
        campaign_id=d.campaign_id,
        address=d.address,
        city=d.city,
        state=d.state,
        zip_code=d.zip_code,
        status=d.status,
        purchase_price=d.purchase_price,
        arv=d.arv,
        repair_estimate=d.repair_estimate,
        notes=d.notes,
        created_at=d.created_at,
        updated_at=d.updated_at,
    )

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

    return DealOut(
        id=d.id,
        created_by_user_id=d.created_by_user_id,
        campaign_id=d.campaign_id,
        address=d.address,
        city=d.city,
        state=d.state,
        zip_code=d.zip_code,
        status=d.status,
        purchase_price=d.purchase_price,
        arv=d.arv,
        repair_estimate=d.repair_estimate,
        notes=d.notes,
        created_at=d.created_at,
        updated_at=d.updated_at,
    )

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
