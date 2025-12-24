from pydantic import BaseModel


class AuditEventOut(BaseModel):
    id: int

    actor_user_id: int | None = None
    actor_email: str | None = None
    actor_role: str | None = None

    action: str
    method: str | None = None
    path: str | None = None

    entity_type: str | None = None
    entity_id: str | None = None

    status_code: int | None = None
    meta_json: str | None = None

    created_at: str

    class Config:
        from_attributes = True


class AuditListOut(BaseModel):
    items: list[AuditEventOut]
    total: int
    limit: int
    offset: int


class StatsOverviewOut(BaseModel):
    users: int
    campaigns: int
    leads: int
    deals: int
    exports: int
    audit_events: int
