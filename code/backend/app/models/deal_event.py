from sqlalchemy import Column, Integer, String, DateTime, func, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.db import Base

class DealEvent(Base):
    __tablename__ = "deal_events"
    id = Column(Integer, primary_key=True, index=True)
    deal_id = Column(Integer, ForeignKey("deals.id"), nullable=False, index=True)

    event_type = Column(String, nullable=False)  # note | status_change | call | offer | contract | close | other
    message = Column(Text, nullable=True)

    occurred_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    deal = relationship("Deal", back_populates="events")
