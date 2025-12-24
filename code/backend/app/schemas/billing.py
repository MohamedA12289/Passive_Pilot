from datetime import datetime
from pydantic import BaseModel


class CheckoutSessionOut(BaseModel):
    url: str


class PortalSessionOut(BaseModel):
    url: str


class SubscriptionOut(BaseModel):
    status: str
    current_period_end: datetime | None = None
