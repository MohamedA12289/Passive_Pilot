from __future__ import annotations

from collections import Counter, defaultdict
from dataclasses import dataclass
from typing import Dict, List, Tuple

from sqlalchemy.orm import Session

from app.models.lead import Lead


@dataclass(frozen=True)
class LeadScore:
    lead_id: int
    score: int
    reasons: List[str]
    metadata: Dict[str, str]


def _truthy(s: str | None) -> bool:
    return bool(s and str(s).strip())


def score_lead(lead: Lead) -> LeadScore:
    # Simple heuristic (safe default). We'll refine later as you add more property fields.
    score = 0
    reasons: List[str] = []
    meta: Dict[str, str] = {}

    if _truthy(lead.phone):
        score += 40
        reasons.append("Has phone")
    else:
        reasons.append("Missing phone")

    if _truthy(lead.owner_name):
        score += 20
        reasons.append("Has owner name")
    else:
        reasons.append("Missing owner name")

    if _truthy(lead.address):
        score += 10
        reasons.append("Has address")
    else:
        reasons.append("Missing address")

    if _truthy(lead.zip_code):
        score += 5
        reasons.append("Has ZIP")
        meta["zip"] = str(lead.zip_code).strip()
    else:
        reasons.append("Missing ZIP")

    # clamp 0..100
    score = max(0, min(100, score))
    return LeadScore(lead_id=lead.id, score=score, reasons=reasons, metadata=meta)


def campaign_summary(db: Session, campaign_id: int) -> dict:
    leads = db.query(Lead).filter(Lead.campaign_id == campaign_id).all()
    total = len(leads)
    with_phone = sum(1 for l in leads if _truthy(l.phone))
    with_owner = sum(1 for l in leads if _truthy(l.owner_name))
    zips = {str(l.zip_code).strip() for l in leads if _truthy(l.zip_code)}
    return {
        "campaign_id": campaign_id,
        "total_leads": total,
        "leads_with_phone": with_phone,
        "leads_missing_phone": total - with_phone,
        "leads_with_owner": with_owner,
        "leads_missing_owner": total - with_owner,
        "distinct_zip_codes": len(zips),
    }


def campaign_zip_breakdown(db: Session, campaign_id: int) -> dict:
    leads = db.query(Lead).filter(Lead.campaign_id == campaign_id).all()
    by_zip: Dict[str, List[Lead]] = defaultdict(list)
    for l in leads:
        z = (l.zip_code or "").strip() or "UNKNOWN"
        by_zip[z].append(l)

    rows = []
    for z, zleads in sorted(by_zip.items(), key=lambda kv: (kv[0] == "UNKNOWN", kv[0])):
        total = len(zleads)
        with_phone = sum(1 for l in zleads if _truthy(l.phone))
        with_owner = sum(1 for l in zleads if _truthy(l.owner_name))
        rows.append(
            {
                "zip_code": None if z == "UNKNOWN" else z,
                "total_leads": total,
                "leads_with_phone": with_phone,
                "leads_missing_phone": total - with_phone,
                "leads_with_owner": with_owner,
                "leads_missing_owner": total - with_owner,
            }
        )

    return {"campaign_id": campaign_id, "rows": rows}
