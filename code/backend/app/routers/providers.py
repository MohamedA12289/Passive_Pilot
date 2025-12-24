from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.deps import require_active_subscription
from app.core.db import get_db
from app.models.user import User
from app.providers.dealmachine import DealMachineProvider
from app.providers.attom import AttomProvider
from app.providers.repliers import RepliersProvider
from app.schemas.providers import ProviderStatusOut

router = APIRouter()

@router.get("/status", response_model=list[ProviderStatusOut])
def provider_status(current_user: User = Depends(require_active_subscription), db: Session = Depends(get_db)):
    providers = [DealMachineProvider(), AttomProvider(), RepliersProvider()]
    out: list[ProviderStatusOut] = []
    for p in providers:
        ok, missing = p.configured()
        out.append(ProviderStatusOut(name=p.name, configured=ok, missing=missing))
    return out
