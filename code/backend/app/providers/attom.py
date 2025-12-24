from __future__ import annotations

from typing import Any

import httpx

from app.core.config import settings
from app.providers.base import LeadProvider, ProviderLead
from app.schemas.filters import FilterSpec


def _clean(s: str | None) -> str | None:
    s2 = (s or "").strip()
    return s2 if s2 else None


def _attom_params_from_filters(zipcode: str | None, limit: int, filters: FilterSpec | None) -> dict[str, Any]:
    """
    Translate our unified FilterSpec into ATTOM query params.
    NOTE: ATTOM param names/endpoints vary by product. This is a *translation layer*,
    so when you confirm the exact ATTOM endpoint you’re using, you only change this file.
    """
    params: dict[str, Any] = {}

    # Zip handling:
    # - request zipcode OR filters.zip_codes OR both
    zips: list[str] = []
    if zipcode:
        zips.append(zipcode.strip())
    if filters and filters.zip_codes:
        for z in filters.zip_codes:
            z = (z or "").strip()
            if z and z not in zips:
                zips.append(z)

    # Put zip(s) into params (placeholder name; adjust once endpoint confirmed)
    if zips:
        # Some APIs accept comma-separated lists
        params["zip"] = ",".join(zips)

    # City/state (optional)
    if filters:
        if _clean(filters.city):
            params["city"] = filters.city.strip()
        if _clean(filters.state):
            params["state"] = filters.state.strip()

    # Property type etc. (future-proof)
    if filters and filters.property_types:
        params["propertyType"] = ",".join([p.strip() for p in filters.property_types if (p or "").strip()])

    # Beds/baths (future-proof)
    if filters and filters.min_beds is not None:
        params["minBeds"] = int(filters.min_beds)
    if filters and filters.min_baths is not None:
        params["minBaths"] = float(filters.min_baths)

    # Equity/absentee are provider-dependent (placeholder keys)
    if filters and filters.min_equity_percent is not None:
        params["minEquityPercent"] = int(filters.min_equity_percent)
    if filters and filters.absentee_owner is True:
        params["absenteeOwner"] = "true"

    # Limit (cap server-side too)
    params["limit"] = max(1, min(int(limit), 500))

    return params


class AttomProvider(LeadProvider):
    name = "attom"

    def __init__(self):
        self.api_key = settings.ATTOM_API_KEY
        self.base_url = settings.ATTOM_BASE_URL or "PUT_URL_HERE"

    def configured(self) -> tuple[bool, list[str]]:
        missing: list[str] = []
        if not self.api_key or self.api_key == "PUT_API_HERE":
            missing.append("ATTOM_API_KEY")
        if self.base_url in (None, "", "PUT_URL_HERE"):
            missing.append("ATTOM_BASE_URL")
        return (len(missing) == 0, missing)

    async def fetch_leads(
        self,
        zipcode: str | None,
        limit: int,
        filters: FilterSpec | None = None,
    ) -> list[ProviderLead]:
        ok, _missing = self.configured()
        if not ok:
            return []

        # ✅ Translate filters -> params
        params = _attom_params_from_filters(zipcode=zipcode, limit=limit, filters=filters)

        # ✅ YOU MUST SET the real endpoint path when you decide which ATTOM product endpoint you're using
        # Example placeholder:
        url = f"{self.base_url.rstrip('/')}/PUT_ENDPOINT_PATH_HERE"

        headers = {
            # ATTOM header format depends on product; placeholder:
            "apikey": self.api_key or "",
            "accept": "application/json",
        }

        try:
            async with httpx.AsyncClient(timeout=30) as client:
                r = await client.get(url, headers=headers, params=params)
                if r.status_code >= 400:
                    return []

                data = r.json()

                # ✅ TODO: Map real ATTOM response -> ProviderLead list.
                # For now: return empty list until endpoint/shape is finalized.
                # When you paste an ATTOM sample JSON, I'll wire the mapping 1:1.
                _ = data
                return []

        except Exception:
            return []
