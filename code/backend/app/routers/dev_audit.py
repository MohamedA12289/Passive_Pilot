from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import require_roles
from app.core.roles import ROLE_DEV
from app.models.audit_event import AuditEvent
from app.schemas.audit import AuditEventOut

router = APIRouter()

dev_guard = require_roles([ROLE_DEV])


@router.get("/audit/recent", response_model=list[AuditEventOut], dependencies=[Depends(dev_guard)])
def dev_recent_audit(
    db: Session = Depends(get_db),
    limit: int = Query(50, ge=1, le=300),
):
    rows = db.query(AuditEvent).order_by(AuditEvent.id.desc()).limit(limit).all()
    return [AuditEventOut.model_validate(r) for r in rows]
