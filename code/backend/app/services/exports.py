from __future__ import annotations
import csv, re, zipfile
from datetime import datetime, timezone
from pathlib import Path
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.lead import Lead

SAFE_RE = re.compile(r"[^a-zA-Z0-9._-]+")

def _safe_name(s: str) -> str:
    s = (s or "").strip()
    s = SAFE_RE.sub("_", s)[:120]
    return s or "export"

def ensure_export_dir() -> Path:
    p = Path(settings.EXPORT_DIR)
    p.mkdir(parents=True, exist_ok=True)
    return p

LEAD_HEADERS = ["id","campaign_id","address","city","state","zip_code","owner_name","phone","created_at"]

def _lead_row(l: Lead) -> list[str]:
    return [
        str(l.id), str(l.campaign_id),
        l.address or "", l.city or "", l.state or "", l.zip_code or "",
        l.owner_name or "", l.phone or "",
        l.created_at.isoformat() if getattr(l, "created_at", None) else "",
    ]

def _csv_text(rows: list[list[str]]) -> str:
    from io import StringIO
    sio = StringIO()
    writer = csv.writer(sio)
    writer.writerows(rows)
    return sio.getvalue()

def export_leads_by_zip(db: Session, campaign_id: int, campaign_name: str):
    export_dir = ensure_export_dir()
    ts = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    base = _safe_name(f"campaign_{campaign_id}_{campaign_name}_{ts}")
    zip_path = export_dir / f"{base}_leads_by_zip.zip"

    leads: list[Lead] = db.query(Lead).filter(Lead.campaign_id == campaign_id).order_by(Lead.id.asc()).all()

    groups: dict[str, list[Lead]] = {}
    for l in leads:
        z = (l.zip_code or "").strip() or "unknown"
        groups.setdefault(z, []).append(l)

    total = 0
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.writestr(f"{base}_ALL.csv", _csv_text([LEAD_HEADERS] + [_lead_row(l) for l in leads]))
        for zip_code, items in sorted(groups.items(), key=lambda kv: kv[0]):
            zf.writestr(_safe_name(f"{base}_ZIP_{zip_code}.csv"), _csv_text([LEAD_HEADERS] + [_lead_row(l) for l in items]))
            total += len(items)
    return zip_path, total
