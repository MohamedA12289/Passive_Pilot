from pydantic import BaseModel
from app.schemas.filters import FilterSpec


class CampaignFiltersOut(BaseModel):
    campaign_id: int
    filters: FilterSpec


class CampaignFiltersIn(BaseModel):
    filters: FilterSpec
