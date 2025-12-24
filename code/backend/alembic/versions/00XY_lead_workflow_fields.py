"""lead workflow fields

Revision ID: 00XY_lead_workflow_fields
Revises: PUT_YOUR_LATEST_REVISION_HERE
Create Date: 2025-12-22
"""

from alembic import op
import sqlalchemy as sa

revision = "00XY_lead_workflow_fields"
down_revision = "PUT_YOUR_LATEST_REVISION_HERE"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("leads", sa.Column("status", sa.String(length=32), nullable=False, server_default="new"))
    op.add_column("leads", sa.Column("dnc", sa.Boolean(), nullable=False, server_default=sa.text("0")))
    op.add_column("leads", sa.Column("notes", sa.Text(), nullable=True))
    op.add_column("leads", sa.Column("last_contacted_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("leads", "last_contacted_at")
    op.drop_column("leads", "notes")
    op.drop_column("leads", "dnc")
    op.drop_column("leads", "status")
