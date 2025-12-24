from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from jose import jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
ALGORITHM = "HS256"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plaintext password against a stored bcrypt hash.
    """
    return pwd_context.verify(plain_password or "", hashed_password)


def get_password_hash(password: str) -> str:
    """
    Hash a password using bcrypt.

    bcrypt has an input limit (~72 bytes). We enforce safety by truncating.
    (Schema already enforces max_length=72, this is a last-line-of-defense.)
    """
    password = (password or "")[:72]
    return pwd_context.hash(password)


def create_access_token(
    subject: str,
    expires_minutes: Optional[int] = None,
    extra: dict[str, Any] | None = None,
) -> str:
    """
    Create a JWT access token.
    """
    if expires_minutes is None:
        expires_minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES

    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
    to_encode: dict[str, Any] = {"sub": subject, "exp": expire}

    if extra:
        to_encode.update(extra)

    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
