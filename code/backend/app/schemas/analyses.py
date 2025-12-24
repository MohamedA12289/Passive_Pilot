from datetime import datetime
from pydantic import BaseModel


class AnalysisCreate(BaseModel):
    campaign_id: int | None = None
    title: str | None = None
    kind: str = "campaign_summary"
    payload_json: str = "{}"


class AnalysisOut(BaseModel):
    id: int
    created_by_user_id: int
    campaign_id: int | None = None
    title: str | None = None
    kind: str
    payload_json: str
    created_at: datetime
