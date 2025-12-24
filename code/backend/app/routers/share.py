from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import require_active_subscription
from app.models.analysis import Analysis
from app.models.share_link import ShareLink
from app.models.user import User
from app.schemas.share import ShareLinkCreate, ShareLinkOut

router = APIRouter()


@router.post("/analysis/{analysis_id}", response_model=ShareLinkOut)
def create_share_link(
    analysis_id: int,
    payload: ShareLinkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_active_subscription),
):
    a = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not a or a.created_by_user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Analysis not found")

    link = ShareLink(analysis_id=a.id, expires_at=payload.expires_at)
    db.add(link)
    db.commit()
    db.refresh(link)
    return ShareLinkOut(
        id=link.id,
        analysis_id=link.analysis_id,
        token=link.token,
        created_at=link.created_at,
        expires_at=link.expires_at,
        revoked_at=link.revoked_at,
    )


@router.post("/revoke/{token}")
def revoke_share_link(
    token: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_active_subscription),
):
    link = db.query(ShareLink).filter(ShareLink.token == token).first()
    if not link:
        raise HTTPException(status_code=404, detail="Share link not found")

    a = db.query(Analysis).filter(Analysis.id == link.analysis_id).first()
    if not a or a.created_by_user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Share link not found")

    from datetime import datetime, timezone

    link.revoked_at = datetime.now(timezone.utc)
    db.commit()
    return {"ok": True}


@router.get("/{token}")
def read_shared_analysis(token: str, db: Session = Depends(get_db)):
    """Public endpoint: returns the analysis payload if the token is valid."""
    link = db.query(ShareLink).filter(ShareLink.token == token).first()
    if not link:
        raise HTTPException(status_code=404, detail="Not found")
    if not link.is_active():
        raise HTTPException(status_code=410, detail="Share link expired or revoked")

    a = db.query(Analysis).filter(Analysis.id == link.analysis_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Not found")

    return {
        "analysis_id": a.id,
        "campaign_id": a.campaign_id,
        "title": a.title,
        "kind": a.kind,
        "payload_json": a.payload_json,
        "created_at": a.created_at,
    }
