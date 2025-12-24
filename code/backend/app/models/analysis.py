from sqlalchemy import Column, Integer, String, DateTime, func, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.core.db import Base


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Optional linkage (nice for campaign-based analyses)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"), nullable=True, index=True)

    title = Column(String, nullable=True)
    kind = Column(String, nullable=False, default="campaign_summary")

    # Store as JSON string (keeps SQLite simple)
    payload_json = Column(Text, nullable=False, default="{}")

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    created_by = relationship("User")
    campaign = relationship("Campaign")
    share_links = relationship("ShareLink", back_populates="analysis", cascade="all,delete-orphan")
