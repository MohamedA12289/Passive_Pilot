"""create deals table

Revision ID: 0006a_deals_table
Revises: 0006_audit_events
Create Date: 2025-01-03
"""

from alembic import op
import sqlalchemy as sa

revision = "0006a_deals_table"
down_revision = "0006_audit_events"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "deals",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("created_by_user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("campaign_id", sa.Integer(), sa.ForeignKey("campaigns.id"), nullable=True),
        
        # Basic property info
        sa.Column("address", sa.String(), nullable=True),
        sa.Column("city", sa.String(), nullable=True),
        sa.Column("state", sa.String(), nullable=True),
        sa.Column("zip_code", sa.String(), nullable=True),
        
        # Pipeline
        sa.Column("status", sa.String(), nullable=False, server_default="lead"),
        
        # Financial data
        sa.Column("purchase_price", sa.Float(), nullable=True),
        
        # Owner/equity info
        sa.Column("equity_percent", sa.Float(), nullable=True),
        sa.Column("mortgage_amount", sa.Float(), nullable=True),
        sa.Column("owner_occupied", sa.Boolean(), nullable=True),
        sa.Column("absentee_owner", sa.Boolean(), nullable=True),
        
        sa.Column("notes", sa.Text(), nullable=True),
        
        # Provider metadata
        sa.Column("provider_name", sa.String(), nullable=True),
        sa.Column("provider_id", sa.String(), nullable=True),
        
        # Timestamps
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    
    op.create_index("ix_deals_id", "deals", ["id"], unique=False)
    op.create_index("ix_deals_created_by_user_id", "deals", ["created_by_user_id"], unique=False)
    op.create_index("ix_deals_campaign_id", "deals", ["campaign_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_deals_campaign_id", table_name="deals")
    op.drop_index("ix_deals_created_by_user_id", table_name="deals")
    op.drop_index("ix_deals_id", table_name="deals")
    op.drop_table("deals")
