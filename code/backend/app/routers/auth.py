from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.db import get_db
from app.core.security import create_access_token, get_password_hash, verify_password
from app.core.deps import get_current_user
from app.core.roles import ROLE_CLIENT
from app.crud.users import update_password
from app.models.user import User
from app.schemas.auth import Token, UserCreate, UserMe, ChangePasswordIn

router = APIRouter()


@router.post("/register", response_model=UserMe)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    if not settings.ALLOW_REGISTER:
        raise HTTPException(status_code=403, detail="Registration is disabled")
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        role=ROLE_CLIENT,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserMe(id=user.id, email=user.email, role=user.role)


@router.post("/login", response_model=Token)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Inactive user")

    token = create_access_token(subject=user.email, extra={"role": user.role, "uid": user.id})
    return Token(access_token=token, user_id=user.id, email=user.email, role=user.role)


@router.get("/me", response_model=UserMe)
def me(current_user: User = Depends(get_current_user)):
    return UserMe(id=current_user.id, email=current_user.email, role=current_user.role)


@router.post("/change-password", response_model=UserMe)
def change_password(
    payload: ChangePasswordIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    update_password(db, current_user, payload.new_password)
    return UserMe(id=current_user.id, email=current_user.email, role=current_user.role)
