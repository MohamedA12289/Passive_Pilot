"""roles + admin guard (conditional)
Revision ID: 0002_roles_admin_guard
Revises: 0001_init
Create Date: 2025-12-16
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

revision: str = "0002_roles_admin_guard"
down_revision: Union[str, None] = "0001_init"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    bind = op.get_bind()
    insp = inspect(bind)
    cols = {c["name"] for c in insp.get_columns("users")}
    if "role" not in cols:
        with op.batch_alter_table("users") as batch:
            batch.add_column(sa.Column("role", sa.String(), nullable=False, server_default="client"))
    idx = {i["name"] for i in insp.get_indexes("users")}
    if "ix_users_email" not in idx:
        op.create_index("ix_users_email", "users", ["email"], unique=True)

def downgrade() -> None:
    bind = op.get_bind()
    insp = inspect(bind)
    cols = {c["name"] for c in insp.get_columns("users")}
    if "role" in cols:
        with op.batch_alter_table("users") as batch:
            batch.drop_column("role")
