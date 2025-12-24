from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import require_roles
from app.core.roles import ROLE_DEV
from app.models.app_control import AppControl
from app.schemas.dev_tools import AppStatusOut, MaintenanceIn

router = APIRouter()

dev_guard = require_roles([ROLE_DEV])

MAINT_KEY = "maintenance_mode"
MAINT_MSG_KEY = "maintenance_message"


def _get_value(db: Session, key: str) -> str | None:
    row = db.query(AppControl).filter(AppControl.key == key).first()
    return row.value if row else None


def _set_value(db: Session, key: str, value: str) -> None:
    row = db.query(AppControl).filter(AppControl.key == key).first()
    if row:
        row.value = value
    else:
        db.add(AppControl(key=key, value=value))
    db.commit()


@router.get("/app/status", response_model=AppStatusOut, dependencies=[Depends(dev_guard)])
def app_status(db: Session = Depends(get_db)):
    mode = (_get_value(db, MAINT_KEY) or "0").strip()
    msg = (_get_value(db, MAINT_MSG_KEY) or "").strip() or None
    return AppStatusOut(maintenance_mode=(mode == "1"), message=msg)


@router.post("/app/kill", response_model=AppStatusOut, dependencies=[Depends(dev_guard)])
def kill_app(payload: MaintenanceIn, db: Session = Depends(get_db)):
    _set_value(db, MAINT_KEY, "1")
    _set_value(db, MAINT_MSG_KEY, (payload.message or "System temporarily unavailable.").strip())
    msg = (_get_value(db, MAINT_MSG_KEY) or "").strip() or None
    return AppStatusOut(maintenance_mode=True, message=msg)


@router.post("/app/run", response_model=AppStatusOut, dependencies=[Depends(dev_guard)])
def run_app(db: Session = Depends(get_db)):
    _set_value(db, MAINT_KEY, "0")
    _set_value(db, MAINT_MSG_KEY, "")
    return AppStatusOut(maintenance_mode=False, message=None)
