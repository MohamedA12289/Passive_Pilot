from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, Field


class GeocodeRequest(BaseModel):
    q: str = Field(..., min_length=3, max_length=300, description="Address/place text to geocode")


class GeocodeResult(BaseModel):
    q: str
    provider: str
    lat: float
    lon: float
    cached: bool = False
    created_at: datetime | None = None
