"""initial tables: users, campaigns, leads

Revision ID: 20251217005000
Revises:
Create Date: 2025-12-17T00:50:26.966194Z
"""

from alembic import op
import sqlalchemy as sa


revision = "20251217005000"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=50), nullable=False, server_default="client"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "campaigns",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("owner_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
    )
    op.create_index("ix_campaigns_owner_id", "campaigns", ["owner_id"], unique=False)

    op.create_table(
        "leads",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("campaign_id", sa.Integer(), sa.ForeignKey("campaigns.id"), nullable=False),
        sa.Column("address", sa.String(length=255), nullable=False),
        sa.Column("city", sa.String(length=120), nullable=True),
        sa.Column("state", sa.String(length=50), nullable=True),
        sa.Column("zip_code", sa.String(length=20), nullable=True),
        sa.Column("arv", sa.Float(), nullable=True),
        sa.Column("offer", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
    )
    op.create_index("ix_leads_campaign_id", "leads", ["campaign_id"], unique=False)
    op.create_index("ix_leads_zip_code", "leads", ["zip_code"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_leads_zip_code", table_name="leads")
    op.drop_index("ix_leads_campaign_id", table_name="leads")
    op.drop_table("leads")

    op.drop_index("ix_campaigns_owner_id", table_name="campaigns")
    op.drop_table("campaigns")

    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
