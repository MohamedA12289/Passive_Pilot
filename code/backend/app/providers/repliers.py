from __future__ import annotations

from typing import Any

import httpx

from app.core.config import settings
from app.providers.base import LeadProvider, ProviderLead
from app.schemas.filters import FilterSpec


def _clean(s: str | None) -> str | None:
    s2 = (s or "").strip()
    return s2 if s2 else None


def _repliers_params_from_filters(zipcode: str | None, limit: int, filters: FilterSpec | None) -> dict[str, Any]:
    """
    Translate our FilterSpec into Repliers params.
    Repliers API param names depend on endpoint (listings/properties/etc).
    Keep translation here so frontend never changes when provider changes.
    """
    params: dict[str, Any] = {}

    zips: list[str] = []
    if zipcode:
        zips.append(zipcode.strip())
    if filters and filters.zip_codes:
        for z in filters.zip_codes:
            z = (z or "").strip()
            if z and z not in zips:
                zips.append(z)

    if zips:
        # placeholder key; adjust after you confirm endpoint
        params["zip"] = ",".join(zips)

    if filters:
        if _clean(filters.city):
            params["city"] = filters.city.strip()
        if _clean(filters.state):
            params["state"] = filters.state.strip()

    # Optional / future proof:
    if filters and filters.property_types:
        params["propertyType"] = ",".join([p.strip() for p in filters.property_types if (p or "").strip()])
    if filters and filters.min_beds is not None:
        params["minBeds"] = int(filters.min_beds)
    if filters and filters.min_baths is not None:
        params["minBaths"] = float(filters.min_baths)

    if filters and filters.absentee_owner is True:
        params["absenteeOwner"] = "true"
    if filters and filters.min_equity_percent is not None:
        params["minEquityPercent"] = int(filters.min_equity_percent)

    params["limit"] = max(1, min(int(limit), 500))
    return params


class RepliersProvider(LeadProvider):
    name = "repliers"

    def __init__(self):
        self.api_key = settings.REPLIERS_API_KEY
        self.base_url = settings.REPLIERS_BASE_URL or "PUT_URL_HERE"

    def configured(self) -> tuple[bool, list[str]]:
        missing: list[str] = []
        if not self.api_key or self.api_key == "PUT_API_HERE":
            missing.append("REPLIERS_API_KEY")
        if self.base_url in (None, "", "PUT_URL_HERE"):
            missing.append("REPLIERS_BASE_URL")
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

        params = _repliers_params_from_filters(zipcode=zipcode, limit=limit, filters=filters)

        # ✅ Set real endpoint when you choose which Repliers dataset you're using
        url = f"{self.base_url.rstrip('/')}/PUT_ENDPOINT_PATH_HERE"

        headers = {
            # Depending on Repliers auth style:
            # could be "Authorization: Bearer <key>" or "REPLIERS-API-KEY"
            "Authorization": f"Bearer {self.api_key}",
            "accept": "application/json",
        }

        try:
            async with httpx.AsyncClient(timeout=30) as client:
                r = await client.get(url, headers=headers, params=params)
                if r.status_code >= 400:
                    return []

                data = r.json()

                # ✅ TODO: Map real response -> ProviderLead list.
                _ = data
                return []

        except Exception:
            return []
