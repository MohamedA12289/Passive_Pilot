from __future__ import annotations

import hashlib
from datetime import datetime
from typing import Tuple

from sqlalchemy.orm import Session

from app.models.geocode_cache import GeocodeCache


def _normalize_query(q: str) -> str:
    return " ".join(q.strip().split()).lower()


def _stub_geocode(q: str) -> Tuple[float, float]:
    """
    Deterministic offline geocoder.
    Produces stable lat/lon for a query without calling external services.
    Good enough for UI map pinning + dev/test until a real provider is added.
    """
    h = hashlib.sha256(q.encode("utf-8")).hexdigest()
    # Map to US-ish bounds: lat 24..49, lon -125..-66
    lat_seed = int(h[:16], 16)
    lon_seed = int(h[16:32], 16)
    lat = 24.0 + (lat_seed % 2500000) / 2500000 * (49.0 - 24.0)
    lon = -125.0 + (lon_seed % 5900000) / 5900000 * (-66.0 - (-125.0))
    return round(lat, 6), round(lon, 6)


def geocode_query(db: Session, q: str, provider: str = "stub") -> tuple[GeocodeCache, bool]:
    nq = _normalize_query(q)
    existing = db.query(GeocodeCache).filter(GeocodeCache.query == nq).first()
    if existing:
        return existing, True

    if provider != "stub":
        # Placeholder for future providers (Google, Mapbox, Nominatim, etc.)
        # We keep this explicit so nobody thinks a paid API is being called.
        raise ValueError("Unsupported geocode provider. Set GEOCODE_PROVIDER=stub or implement provider client.")

    lat, lon = _stub_geocode(nq)
    row = GeocodeCache(query=nq, provider=provider, lat=lat, lon=lon, created_at=datetime.utcnow())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row, False
