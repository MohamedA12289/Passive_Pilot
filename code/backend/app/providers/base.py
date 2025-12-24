from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol

from app.schemas.filters import FilterSpec


@dataclass
class ProviderLead:
    # Basic info
    address: str | None = None
    city: str | None = None
    state: str | None = None
    zip_code: str | None = None
    owner_name: str | None = None
    phone: str | None = None
    
    # Property details for deal scoring
    bedrooms: int | None = None
    bathrooms: float | None = None
    sqft: int | None = None
    lot_size: int | None = None
    year_built: int | None = None
    property_type: str | None = None
    
    # Financial data
    estimated_value: float | None = None  # AVM/estimated market value
    assessed_value: float | None = None
    last_sale_price: float | None = None
    last_sale_date: str | None = None
    
    # Owner/mortgage info
    owner_occupied: bool | None = None
    absentee_owner: bool | None = None
    equity_percent: float | None = None
    mortgage_amount: float | None = None
    
    # Provider metadata
    provider_id: str | None = None  # Unique ID from provider
    raw_data: dict | None = None  # Store raw response for debugging


class LeadProvider(Protocol):
    name: str

    def configured(self) -> tuple[bool, list[str]]: ...

    async def fetch_leads(
        self,
        zipcode: str | None,
        limit: int,
        filters: FilterSpec | None = None,
    ) -> list[ProviderLead]: ...
