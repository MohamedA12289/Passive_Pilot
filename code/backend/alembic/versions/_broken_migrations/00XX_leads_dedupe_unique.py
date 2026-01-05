"""leads dedupe unique index

Revision ID: 00XX_leads_dedupe_unique
Revises: PUT_YOUR_LATEST_REVISION_HERE
Create Date: 2025-12-22
"""

from alembic import op
import sqlalchemy as sa

revision = "00XX_leads_dedupe_unique"
down_revision = "PUT_YOUR_LATEST_REVISION_HERE"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Ensure zip_code is not NULL for reliable uniqueness in SQLite
    # (SQLite UNIQUE allows multiple NULLs)
    op.execute("UPDATE leads SET zip_code = '' WHERE zip_code IS NULL")
    op.execute("UPDATE leads SET address = TRIM(address) WHERE address IS NOT NULL")
    op.execute("UPDATE leads SET zip_code = TRIM(zip_code) WHERE zip_code IS NOT NULL")

    # Create a unique index to block duplicates:
    # campaign + address + zip
    op.create_index(
        "uq_leads_campaign_address_zip",
        "leads",
        ["campaign_id", "address", "zip_code"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index("uq_leads_campaign_address_zip", table_name="leads")
