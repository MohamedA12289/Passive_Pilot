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
    
    # Property details
    bedrooms = Column(Integer, nullable=True)
    bathrooms = Column(Float, nullable=True)
    sqft = Column(Integer, nullable=True)
    lot_size = Column(Integer, nullable=True)
    year_built = Column(Integer, nullable=True)
    property_type = Column(String, nullable=True)

    # Pipeline
    status = Column(String, nullable=False, server_default="lead")  # lead | under_contract | closed | dead

    # Financial data
    purchase_price = Column(Float, nullable=True)
    list_price = Column(Float, nullable=True)  # Asking price
    estimated_value = Column(Float, nullable=True)  # From ATTOM AVM
    assessed_value = Column(Float, nullable=True)
    last_sale_price = Column(Float, nullable=True)
    
    # Deal scoring fields
    arv = Column(Float, nullable=True)  # After Repair Value
    repair_estimate = Column(Float, nullable=True)  # Estimated repair costs
    mao = Column(Float, nullable=True)  # Maximum Allowable Offer
    deal_score = Column(Float, nullable=True)  # 0-100 score
    
    # Owner/equity info
    equity_percent = Column(Float, nullable=True)
    mortgage_amount = Column(Float, nullable=True)
    owner_occupied = Column(Boolean, nullable=True)
    absentee_owner = Column(Boolean, nullable=True)

    notes = Column(Text, nullable=True)
    
    # Provider metadata
    provider_name = Column(String, nullable=True)  # attom, dealmachine, etc.
    provider_id = Column(String, nullable=True)  # Unique ID from provider

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    created_by = relationship("User")
    campaign = relationship("Campaign")
    events = relationship("DealEvent", back_populates="deal", cascade="all,delete-orphan")
