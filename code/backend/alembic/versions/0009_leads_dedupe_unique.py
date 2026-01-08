"""leads dedupe unique index

Revision ID: 0009_leads_dedupe_unique
Revises: 0008_lead_workflow_fields
Create Date: 2026-01-06
"""
from alembic import op

revision = "0009_leads_dedupe_unique"
down_revision = "0008_lead_workflow_fields"
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Basic cleanup to reduce accidental duplicates (safe no-op if already clean)
    op.execute("UPDATE leads SET zip_code = '' WHERE zip_code IS NULL")
    op.execute("UPDATE leads SET address = TRIM(address) WHERE address IS NOT NULL")
    op.execute("UPDATE leads SET zip_code = TRIM(zip_code) WHERE zip_code IS NOT NULL")

    op.create_index(
        "uq_leads_campaign_address_zip",
        "leads",
        ["campaign_id", "address", "zip_code"],
        unique=True,
    )

def downgrade() -> None:
    op.drop_index("uq_leads_campaign_address_zip", table_name="leads")
