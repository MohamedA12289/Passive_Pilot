from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func, Text
from sqlalchemy.orm import relationship

from app.core.db import Base


class ExportJob(Base):
    __tablename__ = "export_jobs"

    id = Column(Integer, primary_key=True, index=True)

    campaign_id = Column(Integer, ForeignKey("campaigns.id"), nullable=False, index=True)
    requested_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    job_type = Column(String(64), nullable=False, index=True)  # leads_by_zip, summary_pdf, leads_pdf
    status = Column(String(16), nullable=False, server_default="queued", index=True)  # queued/running/done/failed

    progress_current = Column(Integer, nullable=False, server_default="0")
    progress_total = Column(Integer, nullable=False, server_default="0")

    result_filename = Column(String(255), nullable=True)  # file name in EXPORT_DIR
    error_message = Column(Text, nullable=True)

    started_at = Column(DateTime(timezone=True), nullable=True)
    finished_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    campaign = relationship("Campaign")
    requested_by = relationship("User")
