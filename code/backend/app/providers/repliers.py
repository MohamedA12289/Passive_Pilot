from __future__ import annotations

from typing import Any

import httpx

from app.core.config import settings
from app.providers.base import LeadProvider, ProviderLead
from app.schemas.filters import FilterSpec


def _clean(s: str | None) -> str | None:
    s2 = (s or "").strip()
    return s2 if s2 else None


def _as_int(v: Any) -> int | None:
    try:
        if v is None or v == "":
            return None
        return int(float(v))
    except Exception:
        return None


def _as_float(v: Any) -> float | None:
    try:
        if v is None or v == "":
            return None
        return float(v)
    except Exception:
        return None


def _as_bool(v: Any) -> bool | None:
    if v is None:
        return None
    if isinstance(v, bool):
        return v
    if isinstance(v, (int, float)):
        return bool(v)
    s = str(v).strip().lower()
    if s in ("true", "1", "yes", "y"):
        return True
    if s in ("false", "0", "no", "n"):
        return False
    return None


def _pick(d: dict[str, Any], *keys: str) -> Any:
    for k in keys:
        if k in d and d[k] not in (None, ""):
            return d[k]
    return None


def _dig(d: dict[str, Any], path: list[str]) -> Any:
    cur: Any = d
    for p in path:
        if not isinstance(cur, dict):
            return None
        cur = cur.get(p)
    return cur


def _repliers_params_from_filters(zipcode: str | None, limit: int, filters: FilterSpec | None) -> dict[str, Any]:
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
        params["zip"] = ",".join(zips)

    if filters:
        if _clean(filters.city):
            params["city"] = filters.city.strip()
        if _clean(filters.state):
            params["state"] = filters.state.strip()

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


def _normalize_repliers_items(data: Any) -> list[dict[str, Any]]:
    # Accept common API payload shapes:
    if isinstance(data, list):
        return [x for x in data if isinstance(x, dict)]
    if not isinstance(data, dict):
        return []

    for key in ("results", "data", "items", "properties", "listings"):
        v = data.get(key)
        if isinstance(v, list):
            return [x for x in v if isinstance(x, dict)]

    # Sometimes nested: { data: { items: [...] } }
    nested = _dig(data, ["data", "items"])
    if isinstance(nested, list):
        return [x for x in nested if isinstance(x, dict)]

    return []


def _map_item_to_provider_lead(item: dict[str, Any]) -> ProviderLead:
    # Address fields (some APIs split, some are combined)
    street = _pick(item, "address", "streetAddress", "street_address", "street")
    city = _pick(item, "city", "municipality")
    state = _pick(item, "state", "province", "region")
    zip_code = _pick(item, "zip", "zipCode", "zip_code", "postalCode", "postal_code")

    # Owner/contact fields
    owner_name = _pick(item, "ownerName", "owner_name", "owner", "ownerFullName")
    phone = _pick(item, "phone", "phoneNumber", "phone_number", "ownerPhone", "owner_phone")

    # Property details
    bedrooms = _as_int(_pick(item, "bedrooms", "beds", "bed"))
    bathrooms = _as_float(_pick(item, "bathrooms", "baths", "bath"))
    sqft = _as_int(_pick(item, "sqft", "livingArea", "living_area", "buildingSize"))
    lot_size = _as_int(_pick(item, "lotSize", "lot_size", "lotArea", "lot_area"))
    year_built = _as_int(_pick(item, "yearBuilt", "year_built"))
    property_type = _pick(item, "propertyType", "property_type", "type")

    # Financial-ish fields (if present)
    estimated_value = _as_float(_pick(item, "estimatedValue", "estimated_value", "avm", "marketValue"))
    assessed_value = _as_float(_pick(item, "assessedValue", "assessed_value"))
    last_sale_price = _as_float(_pick(item, "lastSalePrice", "last_sale_price", "salePrice"))
    last_sale_date = _pick(item, "lastSaleDate", "last_sale_date", "saleDate")

    # Owner/mortgage
    owner_occupied = _as_bool(_pick(item, "ownerOccupied", "owner_occupied"))
    absentee_owner = _as_bool(_pick(item, "absenteeOwner", "absentee_owner"))
    equity_percent = _as_float(_pick(item, "equityPercent", "equity_percent"))
    mortgage_amount = _as_float(_pick(item, "mortgageAmount", "mortgage_amount"))

    provider_id = _pick(item, "id", "propertyId", "property_id", "listingId", "listing_id")

    return ProviderLead(
        address=_clean(str(street)) if street is not None else None,
        city=_clean(str(city)) if city is not None else None,
        state=_clean(str(state)) if state is not None else None,
        zip_code=_clean(str(zip_code)) if zip_code is not None else None,
        owner_name=_clean(str(owner_name)) if owner_name is not None else None,
        phone=_clean(str(phone)) if phone is not None else None,
        bedrooms=bedrooms,
        bathrooms=bathrooms,
        sqft=sqft,
        lot_size=lot_size,
        year_built=year_built,
        property_type=_clean(str(property_type)) if property_type is not None else None,
        estimated_value=estimated_value,
        assessed_value=assessed_value,
        last_sale_price=last_sale_price,
        last_sale_date=_clean(str(last_sale_date)) if last_sale_date is not None else None,
        owner_occupied=owner_occupied,
        absentee_owner=absentee_owner,
        equity_percent=equity_percent,
        mortgage_amount=mortgage_amount,
        provider_id=_clean(str(provider_id)) if provider_id is not None else None,
        raw_data=item,
    )


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

        # Set real endpoint when you choose which Repliers dataset you're using
        url = f"{self.base_url.rstrip('/')}/PUT_ENDPOINT_PATH_HERE"

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "accept": "application/json",
        }

        try:
            async with httpx.AsyncClient(timeout=30) as client:
                r = await client.get(url, headers=headers, params=params)
                if r.status_code >= 400:
                    return []

                data = r.json()
                items = _normalize_repliers_items(data)
                return [_map_item_to_provider_lead(it) for it in items]

        except Exception:
            return []