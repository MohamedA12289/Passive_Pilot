from __future__ import annotations

from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.core.db import SessionLocal
from app.models.export_job import ExportJob
from app.models.campaign import Campaign
from app.models.user import User
from app.services.audit import write_audit_event
from app.services.exports import export_leads_by_zip
from app.services.pdf_reports import build_campaign_summary_pdf, build_campaign_leads_pdf


JOB_LEADS_BY_ZIP = "leads_by_zip"
JOB_SUMMARY_PDF = "summary_pdf"
JOB_LEADS_PDF = "leads_pdf"

ALLOWED_JOB_TYPES = {JOB_LEADS_BY_ZIP, JOB_SUMMARY_PDF, JOB_LEADS_PDF}


def _actor_info(db: Session, user_id: int):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        return user_id, None, None
    return u.id, getattr(u, "email", None), getattr(u, "role", None)


def create_export_job(db: Session, campaign_id: int, user_id: int, job_type: str) -> ExportJob:
    if job_type not in ALLOWED_JOB_TYPES:
        raise ValueError("Invalid job_type")

    job = ExportJob(
        campaign_id=campaign_id,
        requested_by_user_id=user_id,
        job_type=job_type,
        status="queued",
        progress_current=0,
        progress_total=0,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


def run_export_job(job_id: int) -> None:
    """
    Runs in a background task. Uses its own DB session.
    """
    db = SessionLocal()
    try:
        job = db.query(ExportJob).filter(ExportJob.id == job_id).first()
        if not job:
            return

        actor_user_id, actor_email, actor_role = _actor_info(db, job.requested_by_user_id)

        # mark running
        job.status = "running"
        job.started_at = datetime.now(timezone.utc)
        job.error_message = None

        write_audit_event(
            db,
            action="export.job.start",
            status_code=200,
            actor_user_id=actor_user_id,
            actor_email=actor_email,
            actor_role=actor_role,
            entity_type="export_job",
            entity_id=str(job.id),
            meta={"job_type": job.job_type, "campaign_id": job.campaign_id},
        )

        db.commit()

        # load campaign
        campaign = db.query(Campaign).filter(Campaign.id == job.campaign_id).first()
        if not campaign:
            job.status = "failed"
            job.finished_at = datetime.now(timezone.utc)
            job.error_message = "Campaign not found"

            write_audit_event(
                db,
                action="export.job.failed",
                status_code=500,
                actor_user_id=actor_user_id,
                actor_email=actor_email,
                actor_role=actor_role,
                entity_type="export_job",
                entity_id=str(job.id),
                meta={"reason": "campaign_not_found", "campaign_id": job.campaign_id, "job_type": job.job_type},
            )

            db.commit()
            return

        # run
        if job.job_type == JOB_LEADS_BY_ZIP:
            job.progress_total = 1
            db.commit()

            zip_path, total = export_leads_by_zip(db=db, campaign_id=campaign.id, campaign_name=campaign.name)

            job.progress_current = 1
            job.result_filename = zip_path.name
            job.status = "done"
            job.finished_at = datetime.now(timezone.utc)

            write_audit_event(
                db,
                action="export.job.done",
                status_code=200,
                actor_user_id=actor_user_id,
                actor_email=actor_email,
                actor_role=actor_role,
                entity_type="export_job",
                entity_id=str(job.id),
                meta={"job_type": job.job_type, "filename": zip_path.name, "total_leads": total, "campaign_id": campaign.id},
            )

            db.commit()
            return

        if job.job_type == JOB_SUMMARY_PDF:
            job.progress_total = 1
            db.commit()

            pdf_path = build_campaign_summary_pdf(db=db, campaign=campaign)

            job.progress_current = 1
            job.result_filename = pdf_path.name
            job.status = "done"
            job.finished_at = datetime.now(timezone.utc)

            write_audit_event(
                db,
                action="export.job.done",
                status_code=200,
                actor_user_id=actor_user_id,
                actor_email=actor_email,
                actor_role=actor_role,
                entity_type="export_job",
                entity_id=str(job.id),
                meta={"job_type": job.job_type, "filename": pdf_path.name, "campaign_id": campaign.id},
            )

            db.commit()
            return

        if job.job_type == JOB_LEADS_PDF:
            job.progress_total = 1
            db.commit()

            pdf_path = build_campaign_leads_pdf(db=db, campaign=campaign)

            job.progress_current = 1
            job.result_filename = pdf_path.name
            job.status = "done"
            job.finished_at = datetime.now(timezone.utc)

            write_audit_event(
                db,
                action="export.job.done",
                status_code=200,
                actor_user_id=actor_user_id,
                actor_email=actor_email,
                actor_role=actor_role,
                entity_type="export_job",
                entity_id=str(job.id),
                meta={"job_type": job.job_type, "filename": pdf_path.name, "campaign_id": campaign.id},
            )

            db.commit()
            return

        # should never hit
        job.status = "failed"
        job.finished_at = datetime.now(timezone.utc)
        job.error_message = "Unknown job_type"

        write_audit_event(
            db,
            action="export.job.failed",
            status_code=500,
            actor_user_id=actor_user_id,
            actor_email=actor_email,
            actor_role=actor_role,
            entity_type="export_job",
            entity_id=str(job.id),
            meta={"reason": "unknown_job_type", "job_type": job.job_type, "campaign_id": job.campaign_id},
        )

        db.commit()

    except Exception as e:
        try:
            job = db.query(ExportJob).filter(ExportJob.id == job_id).first()
            if job:
                actor_user_id, actor_email, actor_role = _actor_info(db, job.requested_by_user_id)

                job.status = "failed"
                job.finished_at = datetime.now(timezone.utc)
                job.error_message = str(e)

                write_audit_event(
                    db,
                    action="export.job.failed",
                    status_code=500,
                    actor_user_id=actor_user_id,
                    actor_email=actor_email,
                    actor_role=actor_role,
                    entity_type="export_job",
                    entity_id=str(job.id),
                    meta={"reason": "exception", "error": str(e), "job_type": job.job_type, "campaign_id": job.campaign_id},
                )

                db.commit()
        except Exception:
            pass
    finally:
        db.close()
