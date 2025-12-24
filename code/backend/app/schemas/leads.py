from datetime import datetime
from pydantic import BaseModel


class LeadCreate(BaseModel):
    address: str | None = None
    city: str | None = None
    state: str | None = None
    zip_code: str | None = None
    owner_name: str | None = None
    phone: str | None = None

    # optional at create time
    status: str | None = None
    dnc: bool | None = None
    notes: str | None = None


class LeadPatch(BaseModel):
    status: str | None = None
    dnc: bool | None = None
    notes: str | None = None
    last_contacted_at: datetime | None = None


class LeadOut(BaseModel):
    id: int
    campaign_id: int
    address: str | None = None
    city: str | None = None
    state: str | None = None
    zip_code: str | None = None
    owner_name: str | None = None
    phone: str | None = None

    # ✅ new fields
    status: str
    dnc: bool
    notes: str | None = None
    last_contacted_at: datetime | None = None

    created_at: datetime
