from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable

from sqlalchemy.orm import Session

from app.models.campaign import Campaign
from app.models.lead import Lead
from app.services.exports import ensure_export_dir, _safe_name

# PDF generation (pure-python)
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas


@dataclass
class _Row:
    address: str
    city: str
    state: str
    zip_code: str
    owner_name: str
    phone: str


def _now_tag() -> str:
    return datetime.now(tz=timezone.utc).strftime("%Y%m%d_%H%M%S")


def _campaign_leads(db: Session, campaign_id: int) -> list[Lead]:
    return (
        db.query(Lead)
        .filter(Lead.campaign_id == campaign_id)
        .order_by(Lead.id.asc())
        .all()
    )


def build_campaign_summary_pdf(db: Session, campaign: Campaign) -> Path:
    export_dir = ensure_export_dir()
    base = _safe_name(f"campaign_{campaign.id}_{campaign.name}")
    pdf_path = export_dir / f"{base}_SUMMARY_{_now_tag()}.pdf"

    leads = _campaign_leads(db, campaign.id)
    total = len(leads)
    by_zip: dict[str, int] = {}
    for l in leads:
        z = (l.zip_code or "").strip() or "unknown"
        by_zip[z] = by_zip.get(z, 0) + 1

    c = canvas.Canvas(str(pdf_path), pagesize=letter)
    w, h = letter

    # Header
    c.setFont("Helvetica-Bold", 16)
    c.drawString(72, h - 72, "Passive Pilot — Campaign Summary")

    c.setFont("Helvetica", 11)
    y = h - 96
    c.drawString(72, y, f"Campaign: {campaign.name} (ID: {campaign.id})"); y -= 16
    c.drawString(72, y, f"Created: {getattr(campaign, 'created_at', None) or ''}"); y -= 16
    c.drawString(72, y, f"Total leads: {total}"); y -= 24

    c.setFont("Helvetica-Bold", 12)
    c.drawString(72, y, "Leads by ZIP:"); y -= 16
    c.setFont("Helvetica", 11)
    for zip_code, count in sorted(by_zip.items(), key=lambda kv: kv[0]):
        c.drawString(90, y, f"{zip_code}: {count}")
        y -= 14
        if y < 72:
            c.showPage()
            y = h - 72
            c.setFont("Helvetica", 11)

    c.showPage()
    c.save()
    return pdf_path


def build_campaign_leads_pdf(db: Session, campaign: Campaign) -> Path:
    export_dir = ensure_export_dir()
    base = _safe_name(f"campaign_{campaign.id}_{campaign.name}")
    pdf_path = export_dir / f"{base}_LEADS_{_now_tag()}.pdf"

    leads = _campaign_leads(db, campaign.id)

    c = canvas.Canvas(str(pdf_path), pagesize=letter)
    w, h = letter

    def header(page_title: str):
        c.setFont("Helvetica-Bold", 14)
        c.drawString(72, h - 72, page_title)
        c.setFont("Helvetica", 10)
        c.drawString(72, h - 90, f"Campaign: {campaign.name} (ID: {campaign.id})")
        c.drawString(72, h - 104, f"Generated: {datetime.now(tz=timezone.utc).isoformat()}")
        c.line(72, h - 112, w - 72, h - 112)

    header("Passive Pilot — Campaign Leads")

    # Table columns
    cols = [
        (72, "Address", 220),
        (292, "City", 90),
        (382, "ST", 30),
        (412, "ZIP", 50),
        (462, "Owner", 120),
        (582, "Phone", 110),
    ]

    y = h - 132
    c.setFont("Helvetica-Bold", 9)
    for x, name, _w in cols:
        c.drawString(x, y, name)
    y -= 10
    c.line(72, y, w - 72, y)
    y -= 12

    c.setFont("Helvetica", 9)
    for l in leads:
        row = _Row(
            address=(l.address or ""),
            city=(l.city or ""),
            state=(l.state or ""),
            zip_code=(l.zip_code or ""),
            owner_name=(l.owner_name or ""),
            phone=(l.phone or ""),
        )

        values = [row.address, row.city, row.state, row.zip_code, row.owner_name, row.phone]
        # draw with crude truncation
        for (x, _name, width), val in zip(cols, values):
            s = str(val)
            max_chars = max(5, int(width / 5))  # rough
            if len(s) > max_chars:
                s = s[: max_chars - 1] + "…"
            c.drawString(x, y, s)

        y -= 12
        if y < 72:
            c.showPage()
            header("Passive Pilot — Campaign Leads (cont.)")
            y = h - 132
            c.setFont("Helvetica-Bold", 9)
            for x, name, _w in cols:
                c.drawString(x, y, name)
            y -= 10
            c.line(72, y, w - 72, y)
            y -= 12
            c.setFont("Helvetica", 9)

    c.showPage()
    c.save()
    return pdf_path
