from sqlalchemy import Column, Integer, String, DateTime, func, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from app.core.db import Base

class Deal(Base):
    __tablename__ = "deals"
    id = Column(Integer, primary_key=True, index=True)

    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"), nullable=True, index=True)

    # Basic property info
    address = Column(String, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    zip_code = Column(String, nullable=True)

    # Pipeline
    status = Column(String, nullable=False, server_default="lead")  # lead | under_contract | closed | dead

    # Numbers (optional)
    purchase_price = Column(Float, nullable=True)
    arv = Column(Float, nullable=True)
    repair_estimate = Column(Float, nullable=True)

    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    created_by = relationship("User")
    campaign = relationship("Campaign")
    events = relationship("DealEvent", back_populates="deal", cascade="all,delete-orphan")
