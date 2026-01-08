"""Add buyer role and buyer_profiles table

Revision ID: 0008_buyer_role_and_profile
Revises: 0007_deal_scoring_fields
Create Date: 2026-01-08
"""
from alembic import op
import sqlalchemy as sa

revision = "0008_buyer_role_and_profile"
down_revision = "0007_deal_scoring_fields"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Update existing 'client' roles to 'wholesaler'
    op.execute("UPDATE users SET role = 'wholesaler' WHERE role = 'client'")

    # Create buyer_profiles table
    op.create_table(
        "buyer_profiles",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), unique=True, nullable=False, index=True),
        sa.Column("buying_status", sa.String(50), nullable=True),
        sa.Column("price_min", sa.Integer(), nullable=True),
        sa.Column("price_max", sa.Integer(), nullable=True),
        sa.Column("bedrooms_min", sa.Integer(), nullable=True),
        sa.Column("bathrooms_min", sa.Integer(), nullable=True),
        sa.Column("property_types", sa.Text(), nullable=True),
        sa.Column("preferred_locations", sa.Text(), nullable=True),
        sa.Column("investment_strategy", sa.String(100), nullable=True),
        sa.Column("timeline", sa.String(100), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("buyer_profiles")
    op.execute("UPDATE users SET role = 'client' WHERE role = 'wholesaler'")
