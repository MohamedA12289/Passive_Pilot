from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    # Import models so SQLAlchemy registers them
    from app.models import user, campaign, lead, subscription, deal, deal_event  # noqa: F401
    from app.models import audit_event  # noqa: F401
    from app.models import app_control  # noqa: F401

    # Use Alembic for migrations in production. create_all() is a fallback for dev/test.
    # Ignore "already exists" errors when Alembic has already created the schema.
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        # If Alembic migrations have already run, tables/indexes may already exist
        if "already exists" in str(e).lower():
            pass  # Expected when using Alembic migrations
        else:
            raise
