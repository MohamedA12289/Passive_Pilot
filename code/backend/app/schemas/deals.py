from __future__ import annotations
from datetime import datetime
from pydantic import BaseModel

class DealBase(BaseModel):
    campaign_id: int | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    zip_code: str | None = None
    
    # Property details
    bedrooms: int | None = None
    bathrooms: float | None = None
    sqft: int | None = None
    lot_size: int | None = None
    year_built: int | None = None
    property_type: str | None = None

    status: str | None = None  # lead | under_contract | closed | dead

    # Financial data
    purchase_price: float | None = None
    list_price: float | None = None
    estimated_value: float | None = None
    assessed_value: float | None = None
    last_sale_price: float | None = None
    
    # Deal scoring
    arv: float | None = None
    repair_estimate: float | None = None
    mao: float | None = None
    deal_score: float | None = None
    
    # Owner/equity
    equity_percent: float | None = None
    mortgage_amount: float | None = None
    owner_occupied: bool | None = None
    absentee_owner: bool | None = None

    notes: str | None = None
    
    # Provider metadata
    provider_name: str | None = None
    provider_id: str | None = None

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
    
    # Property details
    bedrooms: int | None
    bathrooms: float | None
    sqft: int | None
    lot_size: int | None
    year_built: int | None
    property_type: str | None

    status: str

    # Financial data
    purchase_price: float | None
    list_price: float | None
    estimated_value: float | None
    assessed_value: float | None
    last_sale_price: float | None
    
    # Deal scoring
    arv: float | None
    repair_estimate: float | None
    mao: float | None
    deal_score: float | None
    
    # Owner/equity
    equity_percent: float | None
    mortgage_amount: float | None
    owner_occupied: bool | None
    absentee_owner: bool | None
    
    notes: str | None
    
    # Provider metadata
    provider_name: str | None
    provider_id: str | None

    created_at: datetime
    updated_at: datetime


# Deal Analysis Schemas
class PropertyDataForAnalysis(BaseModel):
    """Input data for deal analysis"""
    address: str
    city: str | None = None
    state: str | None = None
    zip_code: str | None = None
    
    # Property details
    bedrooms: int | None = None
    bathrooms: float | None = None
    sqft: int | None = None
    lot_size: int | None = None
    year_built: int | None = None
    property_type: str | None = None
    
    # Financial data (from ATTOM or other source)
    estimated_value: float | None = None
    assessed_value: float | None = None
    last_sale_price: float | None = None
    last_sale_date: str | None = None
    
    # Owner info
    owner_name: str | None = None
    owner_occupied: bool | None = None
    absentee_owner: bool | None = None
    equity_percent: float | None = None
    mortgage_amount: float | None = None
    
    # Current listing
    asking_price: float | None = None  # Current list price for comparison
    
    # Optional overrides
    condition_override: str | None = None  # "excellent", "good", "average", "fair", "poor"


class DealAnalysisOut(BaseModel):
    """Result of deal analysis"""
    # Core metrics
    arv: float
    repair_estimate: float
    mao: float
    deal_score: float
    
    # Supporting data
    estimated_value: float
    spread: float  # MAO - asking_price
    spread_percent: float
    
    # Breakdown
    score_breakdown: dict[str, float]
    recommendation: str
    notes: list[str]

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
