from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class AnalyzerCampaignSummary(BaseModel):
    campaign_id: int
    total_leads: int
    leads_with_phone: int
    leads_missing_phone: int
    leads_with_owner: int
    leads_missing_owner: int
    distinct_zip_codes: int


class ZipBreakdownRow(BaseModel):
    zip_code: Optional[str] = None
    total_leads: int
    leads_with_phone: int
    leads_missing_phone: int
    leads_with_owner: int
    leads_missing_owner: int


class AnalyzerZipBreakdown(BaseModel):
    campaign_id: int
    rows: List[ZipBreakdownRow]


class LeadScoreInput(BaseModel):
    lead_ids: List[int] = Field(default_factory=list)
    campaign_id: Optional[int] = None


class LeadScoreRow(BaseModel):
    lead_id: int
    score: int
    reasons: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class LeadScoreResponse(BaseModel):
    results: List[LeadScoreRow]
