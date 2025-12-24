"""app_control killswitch

Revision ID: 0005_app_control_killswitch
Revises: 0004_sms_messages
Create Date: 2025-12-22
"""

from alembic import op
import sqlalchemy as sa

revision = "0005_app_control_killswitch"
down_revision = "0004_sms_messages"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "app_control",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("key", sa.String(length=64), nullable=False),
        sa.Column("value", sa.String(length=512), nullable=False, server_default=""),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_app_control_key", "app_control", ["key"], unique=True)

    # Default: app is RUNNING
    op.execute("INSERT INTO app_control (key, value) VALUES ('maintenance_mode', '0')")
    op.execute("INSERT INTO app_control (key, value) VALUES ('maintenance_message', '')")


def downgrade() -> None:
    op.drop_index("ix_app_control_key", table_name="app_control")
    op.drop_table("app_control")
