from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, func, ARRAY
from sqlalchemy.orm import relationship
from app.core.db import Base


class BuyerProfile(Base):
    __tablename__ = "buyer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    buying_status = Column(String(50), nullable=True)  # cash, financing, either
    price_min = Column(Integer, nullable=True)
    price_max = Column(Integer, nullable=True)
    bedrooms_min = Column(Integer, nullable=True)
    bathrooms_min = Column(Integer, nullable=True)
    property_types = Column(Text, nullable=True)  # JSON array as text
    preferred_locations = Column(Text, nullable=True)
    investment_strategy = Column(String(100), nullable=True)
    timeline = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
