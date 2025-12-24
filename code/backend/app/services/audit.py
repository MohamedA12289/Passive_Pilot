import json
from typing import Any

from sqlalchemy.orm import Session

from app.models.audit_event import AuditEvent


def write_audit_event(
    db: Session,
    *,
    action: str,
    status_code: int | None = None,
    method: str | None = None,
    path: str | None = None,
    actor_user_id: int | None = None,
    actor_email: str | None = None,
    actor_role: str | None = None,
    entity_type: str | None = None,
    entity_id: str | None = None,
    meta: dict[str, Any] | None = None,
) -> None:
    """
    Best-effort audit logging.
    - NEVER commit here
    - NEVER rollback here (audit must not undo real work)
    """
    try:
        evt = AuditEvent(
            action=action,
            status_code=status_code,
            method=method,
            path=path,
            actor_user_id=actor_user_id,
            actor_email=actor_email,
            actor_role=actor_role,
            entity_type=entity_type,
            entity_id=entity_id,
            meta_json=json.dumps(meta) if meta else None,
        )
        db.add(evt)
        db.flush()
    except Exception:
        # swallow any audit errors
        return
