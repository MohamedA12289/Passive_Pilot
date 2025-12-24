from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

# Import models so Alembic can discover them
from app.models.user import User  # noqa: E402,F401
from app.models.campaign import Campaign  # noqa: E402,F401
from app.models.lead import Lead  # noqa: E402,F401
