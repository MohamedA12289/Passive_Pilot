from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import require_roles
from app.core.roles import ROLE_ADMIN, ROLE_DEV
from app.models.audit_event import AuditEvent
from app.schemas.audit import AuditListOut, StatsOverviewOut, AuditEventOut

router = APIRouter()

# Admin endpoints should be accessible by Admin AND Dev
admin_guard = require_roles([ROLE_ADMIN, ROLE_DEV])


def _safe_count(db: Session, table_name: str) -> int:
    """
    Counts rows from a table name safely.
    Returns 0 if the table doesn't exist yet (keeps dev smooth).

    Note: Uses whitelist to prevent SQL injection
    """
    # Whitelist of allowed table names to prevent SQL injection
    ALLOWED_TABLES = {
        "users", "campaigns", "leads", "deals",
        "export_jobs", "audit_events", "subscriptions",
        "app_control", "deal_events"
    }

    if table_name not in ALLOWED_TABLES:
        raise ValueError(f"Table name '{table_name}' not in allowed list")

    try:
        # Safe to use f-string now since we validated against whitelist
        return int(db.execute(text(f"SELECT COUNT(*) FROM {table_name}")).scalar() or 0)
    except Exception:
        return 0


@router.get("/stats/overview", response_model=StatsOverviewOut, dependencies=[Depends(admin_guard)])
def stats_overview(db: Session = Depends(get_db)):
    return StatsOverviewOut(
        users=_safe_count(db, "users"),
        campaigns=_safe_count(db, "campaigns"),
        leads=_safe_count(db, "leads"),
        deals=_safe_count(db, "deals"),
        exports=_safe_count(db, "export_jobs"),  # if you don't have this table yet, it returns 0
        audit_events=_safe_count(db, "audit_events"),
    )


@router.get("/audit", response_model=AuditListOut, dependencies=[Depends(admin_guard)])
def audit_list(
    db: Session = Depends(get_db),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    action: str | None = None,
    actor_email: str | None = None,
    entity_type: str | None = None,
    entity_id: str | None = None,
):
    q = db.query(AuditEvent)

    if action:
        q = q.filter(AuditEvent.action == action)
    if actor_email:
        q = q.filter(AuditEvent.actor_email == actor_email)
    if entity_type:
        q = q.filter(AuditEvent.entity_type == entity_type)
    if entity_id:
        q = q.filter(AuditEvent.entity_id == entity_id)

    total = q.count()
    rows = (
        q.order_by(AuditEvent.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return AuditListOut(
        items=[AuditEventOut.model_validate(r) for r in rows],
        total=total,
        limit=limit,
        offset=offset,
    )
