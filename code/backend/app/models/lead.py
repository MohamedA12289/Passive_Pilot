from sqlalchemy import Column, Integer, String, DateTime, func, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from app.core.db import Base


class Lead(Base):
    __tablename__ = "leads"
    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"), nullable=False)

    address = Column(String, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    zip_code = Column(String, nullable=True)

    owner_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)

    # ✅ NEW: workflow fields
    status = Column(String(32), nullable=False, server_default="new")  # new/contacted/follow_up/dead/etc.
    dnc = Column(Boolean, nullable=False, server_default="0")          # do-not-contact
    notes = Column(Text, nullable=True)
    last_contacted_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    campaign = relationship("Campaign", back_populates="leads")
