from __future__ import annotations

from sqlalchemy import Column, Integer, DateTime, func, ForeignKey, String
from sqlalchemy.orm import relationship
from sqlalchemy.types import JSON

from app.core.db import Base


class CampaignFlow(Base):
    """Persisted campaign wizard/flow state.

    This enables a resumable multi-step campaign build process.
    """

    __tablename__ = "campaign_flows"

    id = Column(Integer, primary_key=True, index=True)

    # One flow record per campaign
    campaign_id = Column(Integer, ForeignKey("campaigns.id"), nullable=False, unique=True, index=True)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Basic progress
    current_step = Column(Integer, nullable=False, default=1)
    status = Column(String, nullable=False, default="in_progress")  # in_progress|completed|archived

    # Arbitrary JSON state used by the frontend
    state = Column(JSON, nullable=False, default=dict)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    campaign = relationship("Campaign")
    created_by = relationship("User")
