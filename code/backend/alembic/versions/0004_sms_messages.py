"""sms messages log
Revision ID: 0004_sms_messages
Revises: 0003_subscriptions
Create Date: 2025-12-16
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0004_sms_messages"
down_revision: Union[str, None] = "0003_subscriptions"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.create_table(
        "sms_messages",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("campaign_id", sa.Integer(), sa.ForeignKey("campaigns.id"), nullable=True),
        sa.Column("lead_id", sa.Integer(), sa.ForeignKey("leads.id"), nullable=True),
        sa.Column("to_number", sa.String(), nullable=False),
        sa.Column("from_number", sa.String(), nullable=True),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("provider", sa.String(), nullable=False, server_default="stub"),
        sa.Column("status", sa.String(), nullable=False, server_default="queued"),
        sa.Column("provider_message_id", sa.String(), nullable=True),
        sa.Column("error", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_sms_messages_id", "sms_messages", ["id"], unique=False)

def downgrade() -> None:
    op.drop_index("ix_sms_messages_id", table_name="sms_messages")
    op.drop_table("sms_messages")
