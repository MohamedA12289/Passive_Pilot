from datetime import datetime
from pydantic import BaseModel


class ShareLinkCreate(BaseModel):
    expires_at: datetime | None = None


class ShareLinkOut(BaseModel):
    id: int
    analysis_id: int
    token: str
    created_at: datetime
    expires_at: datetime | None = None
    revoked_at: datetime | None = None
