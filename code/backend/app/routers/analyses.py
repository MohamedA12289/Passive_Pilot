from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import get_current_user, require_active_subscription
from app.models.analysis import Analysis
from app.models.user import User
from app.schemas.analyses import AnalysisCreate, AnalysisOut

router = APIRouter()


@router.get("/", response_model=list[AnalysisOut])
def list_analyses(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_active_subscription),
):
    items = (
        db.query(Analysis)
        .filter(Analysis.created_by_user_id == current_user.id)
        .order_by(Analysis.created_at.desc())
        .all()
    )
    return [
        AnalysisOut(
            id=a.id,
            created_by_user_id=a.created_by_user_id,
            campaign_id=a.campaign_id,
            title=a.title,
            kind=a.kind,
            payload_json=a.payload_json,
            created_at=a.created_at,
        )
        for a in items
    ]


@router.post("/", response_model=AnalysisOut)
def create_analysis(
    payload: AnalysisCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_active_subscription),
):
    a = Analysis(
        created_by_user_id=current_user.id,
        campaign_id=payload.campaign_id,
        title=payload.title,
        kind=payload.kind,
        payload_json=payload.payload_json,
    )
    db.add(a)
    db.commit()
    db.refresh(a)
    return AnalysisOut(
        id=a.id,
        created_by_user_id=a.created_by_user_id,
        campaign_id=a.campaign_id,
        title=a.title,
        kind=a.kind,
        payload_json=a.payload_json,
        created_at=a.created_at,
    )


@router.get("/{analysis_id}", response_model=AnalysisOut)
def get_analysis(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_active_subscription),
):
    a = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not a or a.created_by_user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return AnalysisOut(
        id=a.id,
        created_by_user_id=a.created_by_user_id,
        campaign_id=a.campaign_id,
        title=a.title,
        kind=a.kind,
        payload_json=a.payload_json,
        created_at=a.created_at,
    )


@router.delete("/{analysis_id}")
def delete_analysis(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_active_subscription),
):
    a = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not a or a.created_by_user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Analysis not found")
    db.delete(a)
    db.commit()
    return {"ok": True}
