from __future__ import annotations
from datetime import datetime
from pydantic import BaseModel

class DealBase(BaseModel):
    campaign_id: int | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    zip_code: str | None = None

    status: str | None = None  # lead | under_contract | closed | dead

    purchase_price: float | None = None
    arv: float | None = None
    repair_estimate: float | None = None

    notes: str | None = None

class DealCreate(DealBase):
    pass

class DealUpdate(DealBase):
    pass

class DealOut(BaseModel):
    id: int
    created_by_user_id: int
    campaign_id: int | None

    address: str | None
    city: str | None
    state: str | None
    zip_code: str | None

    status: str

    purchase_price: float | None
    arv: float | None
    repair_estimate: float | None
    notes: str | None

    created_at: datetime
    updated_at: datetime

class DealEventCreate(BaseModel):
    event_type: str
    message: str | None = None
    occurred_at: datetime | None = None

class DealEventOut(BaseModel):
    id: int
    deal_id: int
    event_type: str
    message: str | None
    occurred_at: datetime
    created_at: datetime
