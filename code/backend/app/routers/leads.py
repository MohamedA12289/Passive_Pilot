from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.db import get_db
from app.core.deps import require_active_subscription
from app.models.campaign import Campaign
from app.models.lead import Lead
from app.models.user import User
from app.schemas.leads import LeadCreate, LeadOut, LeadPatch

router = APIRouter()


def _ensure_campaign_owned(db: Session, user_id: int, campaign_id: int) -> Campaign:
    c = db.query(Campaign).filter(Campaign.id == campaign_id, Campaign.created_by_user_id == user_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return c


def _norm(s: str | None) -> str:
    return (s or "").strip()


def _to_out(l: Lead) -> LeadOut:
    return LeadOut(
        id=l.id,
        campaign_id=l.campaign_id,
        address=l.address,
        city=l.city,
        state=l.state,
        zip_code=l.zip_code,
        owner_name=l.owner_name,
        phone=l.phone,
        status=l.status,
        dnc=bool(l.dnc),
        notes=l.notes,
        last_contacted_at=l.last_contacted_at,
        created_at=l.created_at,
    )


@router.get("/", response_model=list[LeadOut])
def list_leads(
    campaign_id: int,
    response: Response,
    current_user: User = Depends(require_active_subscription),
    db: Session = Depends(get_db),

    # filters
    zip_code: str | None = None,
    city: str | None = None,
    state: str | None = None,
    has_phone: bool | None = None,
    q: str | None = Query(default=None, description="Search owner_name/address contains"),
    status: str | None = None,
    dnc: bool | None = None,

    # ✅ pagination
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
):
    _ensure_campaign_owned(db, current_user.id, campaign_id)

    query = db.query(Lead).filter(Lead.campaign_id == campaign_id)

    if zip_code is not None:
        query = query.filter(Lead.zip_code == zip_code)
    if city:
        query = query.filter(Lead.city == city)
    if state:
        query = query.filter(Lead.state == state)

    if has_phone is True:
        query = query.filter(Lead.phone.isnot(None)).filter(Lead.phone != "")
    if has_phone is False:
        query = query.filter(or_(Lead.phone.is_(None), Lead.phone == ""))

    if status:
        query = query.filter(Lead.status == status)

    if dnc is True:
        query = query.filter(Lead.dnc.is_(True))
    if dnc is False:
        query = query.filter(Lead.dnc.is_(False))

    if q:
        like = f"%{q.strip()}%"
        query = query.filter(or_(Lead.owner_name.ilike(like), Lead.address.ilike(like)))

    # ✅ total count (before limit/offset)
    total = query.count()
    response.headers["X-Total-Count"] = str(total)

    rows = query.order_by(Lead.id.desc()).offset(offset).limit(limit).all()
    return [_to_out(l) for l in rows]


@router.post("/", response_model=LeadOut)
def create_lead(
    campaign_id: int,
    payload: LeadCreate,
    current_user: User = Depends(require_active_subscription),
    db: Session = Depends(get_db),
):
    _ensure_campaign_owned(db, current_user.id, campaign_id)

    address = _norm(payload.address)
    if not address:
        raise HTTPException(status_code=400, detail="Address is required")

    zip_code = _norm(payload.zip_code)  # keep "" if missing

    l = Lead(
        campaign_id=campaign_id,
        address=address,
        city=_norm(payload.city) or None,
        state=_norm(payload.state) or None,
        zip_code=zip_code,
        owner_name=_norm(payload.owner_name) or None,
        phone=_norm(payload.phone) or None,

        status=_norm(payload.status) or "new",
        dnc=bool(payload.dnc) if payload.dnc is not None else False,
        notes=_norm(payload.notes) or None,
    )

    db.add(l)
    try:
        db.commit()
    except Exception:
        db.rollback()
        # likely unique index hit
        raise HTTPException(status_code=409, detail="Duplicate lead (same campaign, address, zip)")

    db.refresh(l)
    return _to_out(l)


@router.patch("/{lead_id}", response_model=LeadOut)
def update_lead(
    campaign_id: int,
    lead_id: int,
    payload: LeadPatch,
    current_user: User = Depends(require_active_subscription),
    db: Session = Depends(get_db),
):
    _ensure_campaign_owned(db, current_user.id, campaign_id)

    l = db.query(Lead).filter(Lead.id == lead_id, Lead.campaign_id == campaign_id).first()
    if not l:
        raise HTTPException(status_code=404, detail="Lead not found")

    if payload.status is not None:
        l.status = _norm(payload.status) or "new"
    if payload.dnc is not None:
        l.dnc = bool(payload.dnc)
    if payload.notes is not None:
        l.notes = _norm(payload.notes) or None
    if payload.last_contacted_at is not None:
        l.last_contacted_at = payload.last_contacted_at

    db.commit()
    db.refresh(l)
    return _to_out(l)


@router.delete("/{lead_id}")
def delete_lead(
    campaign_id: int,
    lead_id: int,
    current_user: User = Depends(require_active_subscription),
    db: Session = Depends(get_db),
):
    _ensure_campaign_owned(db, current_user.id, campaign_id)

    l = db.query(Lead).filter(Lead.id == lead_id, Lead.campaign_id == campaign_id).first()
    if not l:
        raise HTTPException(status_code=404, detail="Lead not found")

    db.delete(l)
    db.commit()
    return {"deleted": True, "lead_id": lead_id}
