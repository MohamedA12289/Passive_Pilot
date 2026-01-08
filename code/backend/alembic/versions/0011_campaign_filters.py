"""campaign filters

Revision ID: 0011_campaign_filters
Revises: 0010_export_jobs
Create Date: 2026-01-06
"""
from alembic import op
import sqlalchemy as sa

revision = "0011_campaign_filters"
down_revision = "0010_export_jobs"
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column("campaigns", sa.Column("filter_spec_json", sa.Text(), nullable=True))

def downgrade() -> None:
    op.drop_column("campaigns", "filter_spec_json")
