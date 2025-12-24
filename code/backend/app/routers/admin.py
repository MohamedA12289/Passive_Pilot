from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.deps import require_roles
from app.core.roles import ALL_ROLES, ROLE_ADMIN, ROLE_DEV
from app.models.user import User
from app.schemas.admin import UserOut, SetRoleIn

router = APIRouter()
elevated_guard = require_roles([ROLE_ADMIN, ROLE_DEV])

@router.get("/users", response_model=list[UserOut], dependencies=[Depends(elevated_guard)])
def list_users(db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.id.asc()).all()
    return [UserOut(id=u.id, email=u.email, role=u.role, is_active=u.is_active) for u in users]

@router.post("/users/{user_id}/role", response_model=UserOut, dependencies=[Depends(elevated_guard)])
def set_user_role(user_id: int, payload: SetRoleIn, db: Session = Depends(get_db)):
    role = payload.role.strip().lower()
    if role not in ALL_ROLES:
        raise HTTPException(status_code=400, detail=f"Invalid role. Allowed: {sorted(list(ALL_ROLES))}")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = role
    db.commit(); db.refresh(user)
    return UserOut(id=user.id, email=user.email, role=user.role, is_active=user.is_active)
