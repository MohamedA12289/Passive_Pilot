"""subscriptions
Revision ID: 0003_subscriptions
Revises: 0002_roles_admin_guard
Create Date: 2025-12-16
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0003_subscriptions"
down_revision: Union[str, None] = "0002_roles_admin_guard"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.create_table(
        "subscriptions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False, unique=True),
        sa.Column("status", sa.String(), nullable=False, server_default="inactive"),
        sa.Column("stripe_customer_id", sa.String(), nullable=True),
        sa.Column("stripe_subscription_id", sa.String(), nullable=True),
        sa.Column("current_period_end", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_subscriptions_id", "subscriptions", ["id"], unique=False)

def downgrade() -> None:
    op.drop_index("ix_subscriptions_id", table_name="subscriptions")
    op.drop_table("subscriptions")
