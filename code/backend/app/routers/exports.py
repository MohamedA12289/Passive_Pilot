from __future__ import annotations

from datetime import datetime, timezone
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import require_active_subscription
from app.models.campaign import Campaign
from app.models.user import User
from app.models.export_job import ExportJob

from app.schemas.exports import ExportMetaOut
from app.schemas.export_jobs import ExportJobCreateIn, ExportJobOut

from app.services.audit import write_audit_event
from app.services.exports import export_leads_by_zip, ensure_export_dir
from app.services.pdf_reports import (
    build_campaign_summary_pdf,
    build_campaign_leads_pdf,
)

from app.services.export_jobs import (
    create_export_job,
    run_export_job,
    ALLOWED_JOB_TYPES,
)

router = APIRouter()


def _job_to_out(j: ExportJob) -> ExportJobOut:
    download_url = f"/exports/{j.result_filename}" if j.result_filename else None
    return ExportJobOut(
        id=j.id,
        campaign_id=j.campaign_id,
        requested_by_user_id=j.requested_by_user_id,
        job_type=j.job_type,
        status=j.status,
        progress_current=j.progress_current or 0,
        progress_total=j.progress_total or 0,
        result_filename=j.result_filename,
        download_url=download_url,
        error_message=j.error_message,
        started_at=j.started_at,
        finished_at=j.finished_at,
        created_at=j.created_at,
    )


@router.get("/", response_model=list[ExportMetaOut])
def list_exports(current_user: User = Depends(require_active_subscription)):
    """List exports generated (directory scan)."""
    export_dir = ensure_export_dir()
    items: list[ExportMetaOut] = []
    for p in sorted(export_dir.glob("*"), key=lambda x: x.stat().st_mtime, reverse=True):
        if not p.is_file():
            continue
        stat = p.stat()
        items.append(
            ExportMetaOut(
                filename=p.name,
                size_bytes=stat.st_size,
                created_at=datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc),
                download_url=f"/exports/{p.name}",
            )
        )
    return items


@router.get("/{filename}")
def download_export(filename: str, request: Request, current_user: User = Depends(require_active_subscription), db: Session = Depends(get_db)):
    p = ensure_export_dir() / filename
    if not p.exists() or not p.is_file():
        raise HTTPException(status_code=404, detail="Export not found")

    # audit download
    write_audit_event(
        db,
        action="export.download",
        status_code=200,
        method=request.method,
        path=request.url.path,
        actor_user_id=getattr(current_user, "id", None),
        actor_email=getattr(current_user, "email", None),
        actor_role=getattr(current_user, "role", None),
        entity_type="export",
        entity_id=filename,
        meta={"filename": filename},
    )
    db.commit()

    media_type = "application/octet-stream"
    if p.suffix.lower() == ".zip":
        media_type = "application/zip"
    elif p.suffix.lower() == ".csv":
        media_type = "text/csv"
    elif p.suffix.lower() == ".pdf":
        media_type = "application/pdf"

    return FileResponse(path=str(p), media_type=media_type, filename=p.name)


# -----------------------------
# ✅ JOB SYSTEM ENDPOINTS
# -----------------------------

@router.post("/jobs", response_model=ExportJobOut)
def create_job(
    payload: ExportJobCreateIn,
    background: BackgroundTasks,
    request: Request,
    current_user: User = Depends(require_active_subscription),
    db: Session = Depends(get_db),
):
    job_type = (payload.job_type or "").strip()
    if job_type not in ALLOWED_JOB_TYPES:
        raise HTTPException(status_code=400, detail="Invalid job_type")

    c = (
        db.query(Campaign)
        .filter(Campaign.id == payload.campaign_id, Campaign.created_by_user_id == current_user.id)
        .first()
    )
    if not c:
        raise HTTPException(status_code=404, detail="Campaign not found")

    job = create_export_job(db=db, campaign_id=c.id, user_id=current_user.id, job_type=job_type)

    # audit create
    write_audit_event(
        db,
        action="export.job.create",
        status_code=200,
        method=request.method,
        path=request.url.path,
        actor_user_id=getattr(current_user, "id", None),
        actor_email=getattr(current_user, "email", None),
        actor_role=getattr(current_user, "role", None),
        entity_type="export_job",
        entity_id=str(job.id),
        meta={"job_type": job_type, "campaign_id": c.id},
    )
    db.commit()

    background.add_task(run_export_job, job.id)
    return _job_to_out(job)


@router.get("/jobs/{job_id}", response_model=ExportJobOut)
def get_job(
    job_id: int,
    current_user: User = Depends(require_active_subscription),
    db: Session = Depends(get_db),
):
    job = (
        db.query(ExportJob)
        .filter(ExportJob.id == job_id, ExportJob.requested_by_user_id == current_user.id)
        .first()
    )
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return _job_to_out(job)


@router.get("/jobs", response_model=list[ExportJobOut])
def list_jobs(
    campaign_id: int | None = None,
    current_user: User = Depends(require_active_subscription),
    db: Session = Depends(get_db),
):
    q = db.query(ExportJob).filter(ExportJob.requested_by_user_id == current_user.id)
    if campaign_id is not None:
        q = q.filter(ExportJob.campaign_id == campaign_id)
    jobs = q.order_by(ExportJob.id.desc()).limit(200).all()
    return [_job_to_out(j) for j in jobs]


# -----------------------------
# ✅ OLD SYNC ENDPOINTS (kept)
# -----------------------------

@router.post("/campaigns/{campaign_id}/leads-by-zip")
def export_campaign_leads_by_zip(
    campaign_id: int,
    request: Request,
    current_user: User = Depends(require_active_subscription),
    db: Session = Depends(get_db),
):
    c = (
        db.query(Campaign)
        .filter(Campaign.id == campaign_id, Campaign.created_by_user_id == current_user.id)
        .first()
    )
    if not c:
        raise HTTPException(status_code=404, detail="Campaign not found")

    zip_path, total = export_leads_by_zip(db=db, campaign_id=c.id, campaign_name=c.name)

    write_audit_event(
        db,
        action="export.sync.leads_by_zip",
        status_code=200,
        method=request.method,
        path=request.url.path,
        actor_user_id=getattr(current_user, "id", None),
        actor_email=getattr(current_user, "email", None),
        actor_role=getattr(current_user, "role", None),
        entity_type="campaign",
        entity_id=str(c.id),
        meta={"filename": zip_path.name, "total_leads": total},
    )
    db.commit()

    return {"ok": True, "total_leads": total, "filename": zip_path.name, "download_url": f"/exports/{zip_path.name}"}


@router.post("/campaigns/{campaign_id}/summary-pdf")
def export_campaign_summary_pdf(
    campaign_id: int,
    request: Request,
    current_user: User = Depends(require_active_subscription),
    db: Session = Depends(get_db),
):
    c = (
        db.query(Campaign)
        .filter(Campaign.id == campaign_id, Campaign.created_by_user_id == current_user.id)
        .first()
    )
    if not c:
        raise HTTPException(status_code=404, detail="Campaign not found")

    pdf_path = build_campaign_summary_pdf(db=db, campaign=c)

    write_audit_event(
        db,
        action="export.sync.summary_pdf",
        status_code=200,
        method=request.method,
        path=request.url.path,
        actor_user_id=getattr(current_user, "id", None),
        actor_email=getattr(current_user, "email", None),
        actor_role=getattr(current_user, "role", None),
        entity_type="campaign",
        entity_id=str(c.id),
        meta={"filename": pdf_path.name},
    )
    db.commit()

    return {"ok": True, "filename": pdf_path.name, "download_url": f"/exports/{pdf_path.name}"}


@router.post("/campaigns/{campaign_id}/leads-pdf")
def export_campaign_leads_pdf(
    campaign_id: int,
    request: Request,
    current_user: User = Depends(require_active_subscription),
    db: Session = Depends(get_db),
):
    c = (
        db.query(Campaign)
        .filter(Campaign.id == campaign_id, Campaign.created_by_user_id == current_user.id)
        .first()
    )
    if not c:
        raise HTTPException(status_code=404, detail="Campaign not found")

    pdf_path = build_campaign_leads_pdf(db=db, campaign=c)

    write_audit_event(
        db,
        action="export.sync.leads_pdf",
        status_code=200,
        method=request.method,
        path=request.url.path,
        actor_user_id=getattr(current_user, "id", None),
        actor_email=getattr(current_user, "email", None),
        actor_role=getattr(current_user, "role", None),
        entity_type="campaign",
        entity_id=str(c.id),
        meta={"filename": pdf_path.name},
    )
    db.commit()

    return {"ok": True, "filename": pdf_path.name, "download_url": f"/exports/{pdf_path.name}"}
