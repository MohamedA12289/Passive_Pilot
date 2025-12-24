from __future__ import annotations

from datetime import datetime, timezone
from typing import Iterable

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.db import get_db
from app.core.roles import ROLE_ADMIN, ROLE_DEV, ROLE_CLIENT
from app.models.user import User
from app.models.subscription import Subscription

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
ALGORITHM = "HS256"

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        subject: str | None = payload.get("sub")
        if subject is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.email == subject).first()
    if not user:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Inactive user")
    return user

def require_roles(allowed_roles: Iterable[str]):
    allowed_set = set(allowed_roles)
    def _role_guard(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_set:
            raise HTTPException(status_code=403, detail="Not enough permissions")
        return current_user
    return _role_guard

def require_active_subscription(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> User:
    if current_user.role in (ROLE_ADMIN, ROLE_DEV):
        return current_user
    if current_user.role != ROLE_CLIENT:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    sub = db.query(Subscription).filter(Subscription.user_id == current_user.id).first()
    if not sub or sub.status not in ("active", "trialing"):
        raise HTTPException(status_code=402, detail="Subscription required")

    if sub.current_period_end and sub.current_period_end.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=402, detail="Subscription expired")
    return current_user
