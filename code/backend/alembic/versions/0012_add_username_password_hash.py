"""Add username and password_hash to users

Revision ID: 0012
Revises: 0011_campaign_filters
Create Date: 2026-01-09
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0012_add_username_password_hash"
down_revision = "0011_campaign_filters"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("username", sa.String(30), nullable=True))
    op.add_column("users", sa.Column("password_hash", sa.String(), nullable=True))
    op.create_index(op.f("ix_users_username"), "users", ["username"], unique=True)


def downgrade() -> None:
    op.drop_index(op.f("ix_users_username"), table_name="users")
    op.drop_column("users", "password_hash")
    op.drop_column("users", "username")
