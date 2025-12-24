from sqlalchemy import Column, Integer, String, DateTime, Text, func

from app.core.db import Base


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(Integer, primary_key=True, index=True)

    # Who did it (nullable for anonymous actions like failed logins)
    actor_user_id = Column(Integer, nullable=True, index=True)
    actor_email = Column(String(255), nullable=True, index=True)
    actor_role = Column(String(50), nullable=True, index=True)

    # What happened
    action = Column(String(100), nullable=False, index=True)  # e.g. "auth.login", "campaign.create"
    method = Column(String(10), nullable=True)
    path = Column(String(255), nullable=True, index=True)

    # Target object (optional)
    entity_type = Column(String(80), nullable=True, index=True)  # e.g. "campaign", "lead"
    entity_id = Column(String(80), nullable=True, index=True)

    # Result
    status_code = Column(Integer, nullable=True, index=True)

    # Extra data (json string for now to keep it simple)
    meta_json = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
