"""
Seed a development user with local credentials.

Usage:
    python -m app.scripts.seed_dev_user

Reads from environment variables:
    DEV_SEED_USERNAME - username for the dev user (required)
    DEV_SEED_PASSWORD - password for the dev user (required)
    DEV_SEED_EMAIL - email for the dev user (defaults to dev@passivepilot.local)
"""
import os
import sys

from sqlalchemy.orm import Session

from app.core.db import engine, Base
from app.core.security import get_password_hash
from app.core.roles import ROLE_DEV
from app.models.user import User


def seed_dev_user():
    username = os.environ.get("DEV_SEED_USERNAME")
    password = os.environ.get("DEV_SEED_PASSWORD")
    email = os.environ.get("DEV_SEED_EMAIL", "dev@passivepilot.local")

    if not username or not password:
        print("ERROR: DEV_SEED_USERNAME and DEV_SEED_PASSWORD environment variables are required")
        sys.exit(1)

    if len(username) < 3 or len(username) > 30:
        print("ERROR: Username must be 3-30 characters")
        sys.exit(1)

    if len(password) < 8:
        print("ERROR: Password must be at least 8 characters")
        sys.exit(1)

    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)

    with Session(engine) as db:
        # Check if user exists by username or email
        existing = db.query(User).filter(
            (User.username == username) | (User.email == email)
        ).first()

        password_hash = get_password_hash(password)

        if existing:
            # Update existing user
            existing.username = username
            existing.password_hash = password_hash
            existing.email = email
            existing.role = ROLE_DEV
            existing.is_active = True
            db.commit()
            print(f"Updated dev user: {username} ({email}) with role '{ROLE_DEV}'")
        else:
            # Create new user with placeholder hashed_password for existing field
            user = User(
                email=email,
                hashed_password=get_password_hash("placeholder"),  # Legacy field
                role=ROLE_DEV,
                is_active=True,
                username=username,
                password_hash=password_hash,
            )
            db.add(user)
            db.commit()
            print(f"Created dev user: {username} ({email}) with role '{ROLE_DEV}'")


if __name__ == "__main__":
    seed_dev_user()
