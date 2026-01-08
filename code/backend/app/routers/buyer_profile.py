from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List

from app.core.db import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.buyer_profile import BuyerProfile

router = APIRouter()


class BuyerProfileIn(BaseModel):
    buying_status: Optional[str] = None  # cash, financing, either
    price_min: Optional[int] = None
    price_max: Optional[int] = None
    bedrooms_min: Optional[int] = None
    bathrooms_min: Optional[int] = None
    property_types: Optional[List[str]] = None
    preferred_locations: Optional[str] = None
    investment_strategy: Optional[str] = None
    timeline: Optional[str] = None
    notes: Optional[str] = None


class BuyerProfileOut(BaseModel):
    id: int
    user_id: int
    buying_status: Optional[str] = None
    price_min: Optional[int] = None
    price_max: Optional[int] = None
    bedrooms_min: Optional[int] = None
    bathrooms_min: Optional[int] = None
    property_types: Optional[List[str]] = None
    preferred_locations: Optional[str] = None
    investment_strategy: Optional[str] = None
    timeline: Optional[str] = None
    notes: Optional[str] = None


def _profile_to_out(profile: BuyerProfile) -> BuyerProfileOut:
    import json
    property_types = None
    if profile.property_types:
        try:
            property_types = json.loads(profile.property_types)
        except:
            property_types = []
    return BuyerProfileOut(
        id=profile.id,
        user_id=profile.user_id,
        buying_status=profile.buying_status,
        price_min=profile.price_min,
        price_max=profile.price_max,
        bedrooms_min=profile.bedrooms_min,
        bathrooms_min=profile.bathrooms_min,
        property_types=property_types,
        preferred_locations=profile.preferred_locations,
        investment_strategy=profile.investment_strategy,
        timeline=profile.timeline,
        notes=profile.notes,
    )


@router.get("/me", response_model=Optional[BuyerProfileOut])
def get_my_buyer_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(BuyerProfile).filter(BuyerProfile.user_id == current_user.id).first()
    if not profile:
        return None
    return _profile_to_out(profile)


@router.put("/me", response_model=BuyerProfileOut)
def upsert_my_buyer_profile(
    payload: BuyerProfileIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    import json
    profile = db.query(BuyerProfile).filter(BuyerProfile.user_id == current_user.id).first()

    property_types_str = json.dumps(payload.property_types) if payload.property_types else None

    if profile:
        profile.buying_status = payload.buying_status
        profile.price_min = payload.price_min
        profile.price_max = payload.price_max
        profile.bedrooms_min = payload.bedrooms_min
        profile.bathrooms_min = payload.bathrooms_min
        profile.property_types = property_types_str
        profile.preferred_locations = payload.preferred_locations
        profile.investment_strategy = payload.investment_strategy
        profile.timeline = payload.timeline
        profile.notes = payload.notes
    else:
        profile = BuyerProfile(
            user_id=current_user.id,
            buying_status=payload.buying_status,
            price_min=payload.price_min,
            price_max=payload.price_max,
            bedrooms_min=payload.bedrooms_min,
            bathrooms_min=payload.bathrooms_min,
            property_types=property_types_str,
            preferred_locations=payload.preferred_locations,
            investment_strategy=payload.investment_strategy,
            timeline=payload.timeline,
            notes=payload.notes,
        )
        db.add(profile)

    db.commit()
    db.refresh(profile)
    return _profile_to_out(profile)
