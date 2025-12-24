from datetime import datetime
from pydantic import BaseModel
class CampaignCreate(BaseModel):
    name: str
class CampaignUpdate(BaseModel):
    name: str
class CampaignOut(BaseModel):
    id: int
    name: str
    created_at: datetime
