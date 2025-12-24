from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class CampaignFlowUpdate(BaseModel):
    """Update the campaign flow state."""

    current_step: Optional[int] = Field(default=None, ge=1)
    status: Optional[str] = None
    state: Optional[Dict[str, Any]] = None
    replace_state: bool = False


class CampaignFlowStepUpdate(BaseModel):
    current_step: int = Field(ge=1)


class CampaignFlowOut(BaseModel):
    id: int
    campaign_id: int
    created_by_user_id: int
    current_step: int
    status: str
    state: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
