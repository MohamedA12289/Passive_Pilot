import secrets
from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, func, ForeignKey
from sqlalchemy.orm import relationship

from app.core.db import Base


def generate_share_token() -> str:
    # URL-safe token
    return secrets.token_urlsafe(24)


class ShareLink(Base):
    __tablename__ = "share_links"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id"), nullable=False, index=True)
    token = Column(String, unique=True, index=True, nullable=False, default=generate_share_token)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    revoked_at = Column(DateTime(timezone=True), nullable=True)

    analysis = relationship("Analysis", back_populates="share_links")

    def is_active(self) -> bool:
        if self.revoked_at is not None:
            return False
        if self.expires_at is None:
            return True
        try:
            return self.expires_at > datetime.utcnow()
        except Exception:
            return True
