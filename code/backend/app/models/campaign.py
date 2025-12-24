from sqlalchemy import Column, Integer, String, DateTime, func, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.db import Base

class Campaign(Base):
    __tablename__ = "campaigns"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # ✅ Saved campaign-level filters (JSON string)
    filter_spec_json = Column(Text, nullable=True)

    created_by = relationship("User")
    leads = relationship("Lead", back_populates="campaign", cascade="all,delete-orphan")
