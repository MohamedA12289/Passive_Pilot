"""export jobs

Revision ID: 0010_export_jobs
Revises: 0009_leads_dedupe_unique
Create Date: 2026-01-06
"""
from alembic import op
import sqlalchemy as sa

revision = "0010_export_jobs"
down_revision = "0009_leads_dedupe_unique"
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table(
        "export_jobs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("campaign_id", sa.Integer(), sa.ForeignKey("campaigns.id"), nullable=False),
        sa.Column("requested_by_user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("job_type", sa.String(length=64), nullable=False),
        sa.Column("status", sa.String(length=16), nullable=False, server_default="queued"),
        sa.Column("progress_current", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("progress_total", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("result_filename", sa.String(length=255), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("finished_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_export_jobs_campaign_id", "export_jobs", ["campaign_id"])
    op.create_index("ix_export_jobs_requested_by_user_id", "export_jobs", ["requested_by_user_id"])
    op.create_index("ix_export_jobs_job_type", "export_jobs", ["job_type"])
    op.create_index("ix_export_jobs_status", "export_jobs", ["status"])

def downgrade() -> None:
    op.drop_index("ix_export_jobs_status", table_name="export_jobs")
    op.drop_index("ix_export_jobs_job_type", table_name="export_jobs")
    op.drop_index("ix_export_jobs_requested_by_user_id", table_name="export_jobs")
    op.drop_index("ix_export_jobs_campaign_id", table_name="export_jobs")
    op.drop_table("export_jobs")
