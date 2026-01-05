"""campaign filters

Revision ID: 00XX_campaign_filters
Revises: PUT_YOUR_LATEST_REVISION_HERE
Create Date: 2025-12-22
"""

from alembic import op
import sqlalchemy as sa

revision = "00XX_campaign_filters"
down_revision = "PUT_YOUR_LATEST_REVISION_HERE"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("campaigns", sa.Column("filter_spec_json", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("campaigns", "filter_spec_json")
