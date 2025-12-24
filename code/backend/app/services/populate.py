from __future__ import annotations

from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.lead import Lead
from app.providers.registry import get_provider
from app.schemas.filters import FilterSpec


def _norm(s: str | None) -> str:
    return (s or "").strip()


def _norm_zip(z: str | None) -> str:
    # IMPORTANT: return "" not None so DB UNIQUE works reliably on SQLite
    return (z or "").strip()


async def populate_campaign_from_provider(
    db: Session,
    campaign_id: int,
    provider_name: str,
    zipcode: str | None,
    limit: int,
    filters: FilterSpec | None = None,
) -> int:
    """
    Pull leads from a provider and store them in our DB.
    `filters` is our unified filter language (frontend-friendly).
    Provider integrations can optionally use it.

    For now:
    - Providers are stubbed, but this wiring is correct.
    - We also add basic de-dupe so imports don't create duplicates.
    - DB UNIQUE index is the final enforcement (handles races).
    """
    provider = get_provider(provider_name)

    # Some providers may accept filters; some may not. We try both safely.
    try:
        leads = await provider.fetch_leads(zipcode=zipcode, limit=limit, filters=filters)
    except TypeError:
        leads = await provider.fetch_leads(zipcode=zipcode, limit=limit)

    created = 0

    for pl in leads:
        address = _norm(getattr(pl, "address", None))
        zip_code = _norm_zip(getattr(pl, "zip_code", None))

        # Skip empty address (junk)
        if not address:
            continue

        # Basic de-dupe: same campaign + same address + same zip
        # (DB UNIQUE index is still required for race conditions)
        exists = (
            db.query(Lead)
            .filter(
                and_(
                    Lead.campaign_id == campaign_id,
                    Lead.address == address,
                    Lead.zip_code == zip_code,
                )
            )
            .first()
        )
        if exists:
            continue

        db.add(
            Lead(
                campaign_id=campaign_id,
                address=address,
                city=_norm(getattr(pl, "city", None)) or None,
                state=_norm(getattr(pl, "state", None)) or None,
                zip_code=zip_code,  # ✅ store "" not None
                owner_name=_norm(getattr(pl, "owner_name", None)) or None,
                phone=_norm(getattr(pl, "phone", None)) or None,
            )
        )
        created += 1

    if created:
        try:
            db.commit()
        except Exception:
            # If a race condition hits the DB UNIQUE index, rollback safely
            db.rollback()

    return created
