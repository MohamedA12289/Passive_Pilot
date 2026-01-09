"""merge heads

Revision ID: e9b4ea997b68
Revises: 0008_buyer_role_and_profile, 0012_add_username_password_hash
Create Date: 2026-01-09 13:40:37.948439

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'e9b4ea997b68'
down_revision: Union[str, None] = ('0008_buyer_role_and_profile', '0012_add_username_password_hash')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    pass

def downgrade() -> None:
    pass
