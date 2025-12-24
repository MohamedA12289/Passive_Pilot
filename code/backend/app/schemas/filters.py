from pydantic import BaseModel, Field
from typing import List, Optional


class FilterSpec(BaseModel):
    # Keep it simple + user friendly for v1.
    zip_codes: Optional[List[str]] = None

    has_phone: Optional[bool] = None

    city: Optional[str] = None
    state: Optional[str] = None

    # free-text search for owner/address
    q: Optional[str] = Field(default=None, description="Search owner_name/address contains")

    # future-proof fields (safe to store now, even if unused yet)
    min_equity_percent: Optional[int] = None
    absentee_owner: Optional[bool] = None
    property_types: Optional[List[str]] = None
    min_beds: Optional[int] = None
    min_baths: Optional[float] = None
