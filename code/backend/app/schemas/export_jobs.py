from datetime import datetime
from pydantic import BaseModel


class ExportJobCreateIn(BaseModel):
    campaign_id: int
    job_type: str  # "leads_by_zip" | "summary_pdf" | "leads_pdf"


class ExportJobOut(BaseModel):
    id: int
    campaign_id: int
    requested_by_user_id: int

    job_type: str
    status: str

    progress_current: int
    progress_total: int

    result_filename: str | None = None
    download_url: str | None = None
    error_message: str | None = None

    started_at: datetime | None = None
    finished_at: datetime | None = None
    created_at: datetime
