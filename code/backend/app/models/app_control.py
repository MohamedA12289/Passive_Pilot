from sqlalchemy import Column, Integer, String, DateTime, func

from app.core.db import Base


class AppControl(Base):
    """
    Simple key/value flags stored in DB so they persist across restarts.
    Used for global maintenance mode (kill switch).
    """
    __tablename__ = "app_control"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(64), unique=True, nullable=False, index=True)
    value = Column(String(512), nullable=False, default="")

    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
