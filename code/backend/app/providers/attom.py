from __future__ import annotations

import logging
from typing import Any

import httpx

from app.core.config import settings
from app.providers.base import LeadProvider, ProviderLead
from app.schemas.filters import FilterSpec

logger = logging.getLogger(__name__)


def _clean(s: str | None) -> str | None:
    """Clean and normalize string values"""
    s2 = (s or "").strip()
    return s2 if s2 else None


def _safe_int(val: Any) -> int | None:
    """Safely convert to int"""
    try:
        return int(val) if val is not None else None
    except (ValueError, TypeError):
        return None


def _safe_float(val: Any) -> float | None:
    """Safely convert to float"""
    try:
        return float(val) if val is not None else None
    except (ValueError, TypeError):
        return None


def _attom_params_from_filters(zipcode: str | None, limit: int, filters: FilterSpec | None) -> dict[str, Any]:
    """
    Translate our unified FilterSpec into ATTOM query params.
    ATTOM Property API Search documentation:
    https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/snapshot
    """
    params: dict[str, Any] = {}

    # Zip handling - ATTOM uses 'postalcode' parameter
    zips: list[str] = []
    if zipcode:
        zips.append(zipcode.strip())
    if filters and filters.zip_codes:
        for z in filters.zip_codes:
            z = (z or "").strip()
            if z and z not in zips:
                zips.append(z)

    if zips:
        # ATTOM accepts comma-separated zip codes
        params["postalcode"] = ",".join(zips)

    # City/state
    if filters:
        if _clean(filters.city):
            params["locality"] = filters.city.strip()
        if _clean(filters.state):
            params["address2"] = filters.state.strip()

    # Property characteristics
    if filters and filters.min_beds is not None:
        params["minBeds"] = int(filters.min_beds)
    if filters and filters.max_beds is not None:
        params["maxBeds"] = int(filters.max_beds)
    if filters and filters.min_baths is not None:
        params["minBathsTotal"] = float(filters.min_baths)
    if filters and filters.max_baths is not None:
        params["maxBathsTotal"] = float(filters.max_baths)

    # Square footage
    if filters and filters.min_sqft is not None:
        params["minUniversalSize"] = int(filters.min_sqft)
    if filters and filters.max_sqft is not None:
        params["maxUniversalSize"] = int(filters.max_sqft)

    # Year built
    if filters and filters.min_year_built is not None:
        params["minYearBuilt"] = int(filters.min_year_built)
    if filters and filters.max_year_built is not None:
        params["maxYearBuilt"] = int(filters.max_year_built)

    # Lot size (in sqft)
    if filters and filters.min_lot_size is not None:
        params["minLotSize2"] = int(filters.min_lot_size)
    if filters and filters.max_lot_size is not None:
        params["maxLotSize2"] = int(filters.max_lot_size)

    # Owner occupancy - ATTOM supports absenteeowner filter
    if filters and filters.absentee_owner is True:
        params["absenteeowner"] = "absentee"
    elif filters and filters.absentee_owner is False:
        params["absenteeowner"] = "occupied"

    # Property types
    if filters and filters.property_types:
        # ATTOM uses propertyIndicator codes - map common types
        type_codes = []
        for ptype in filters.property_types:
            ptype_lower = (ptype or "").lower()
            if "single" in ptype_lower or "sfr" in ptype_lower:
                type_codes.append("10")  # Single Family Residential
            elif "condo" in ptype_lower:
                type_codes.append("11")  # Condominium
            elif "townhouse" in ptype_lower or "town" in ptype_lower:
                type_codes.append("12")  # Townhouse
            elif "multi" in ptype_lower or "2-4" in ptype_lower:
                type_codes.append("13")  # Multi-family (2-4 units)
        if type_codes:
            params["propertyIndicator"] = ",".join(type_codes)

    # Pagination
    params["pageSize"] = max(1, min(int(limit), 500))
    params["page"] = 1

    return params


def _parse_attom_property(prop_data: dict[str, Any]) -> ProviderLead | None:
    """
    Parse ATTOM property response into ProviderLead.
    ATTOM response structure varies by endpoint, but typically includes:
    - address: street address components
    - lot: lot size, year built
    - building: bedrooms, bathrooms, sqft
    - assessment: assessed value
    - avm: automated valuation model (estimated value)
    - owner: owner information
    - sale: last sale information
    """
    try:
        # Extract address
        address_data = prop_data.get("address", {})
        full_address = address_data.get("oneLine", "")
        if not full_address:
            # Build from components
            line1 = address_data.get("line1", "")
            line2 = address_data.get("line2", "")
            full_address = f"{line1} {line2}".strip()
        
        city = address_data.get("locality", "")
        state = address_data.get("countrySubd", "")
        zip_code = address_data.get("postal1", "")

        # Extract property details
        building_data = prop_data.get("building", {}) or {}
        size_data = building_data.get("size", {}) or {}
        rooms_data = building_data.get("rooms", {}) or {}
        
        bedrooms = _safe_int(rooms_data.get("beds"))
        bathrooms = _safe_float(rooms_data.get("bathstotal"))
        sqft = _safe_int(size_data.get("universalsize"))
        
        # Lot information
        lot_data = prop_data.get("lot", {}) or {}
        lot_size = _safe_int(lot_data.get("lotsize2"))  # sqft
        year_built = _safe_int(lot_data.get("yearbuilt"))
        
        # Property type
        summary_data = prop_data.get("summary", {}) or {}
        property_type = summary_data.get("proptype", "")
        
        # Financial data - Assessment
        assessment_data = prop_data.get("assessment", {}) or {}
        assessed_value = _safe_float(assessment_data.get("assessed", {}).get("assdttlvalue"))
        
        # AVM (Automated Valuation Model) - estimated market value
        avm_data = prop_data.get("avm", {}) or {}
        estimated_value = _safe_float(avm_data.get("amount", {}).get("value"))
        
        # If no AVM, use assessed value as estimate
        if not estimated_value and assessed_value:
            estimated_value = assessed_value * 1.1  # Rough market estimate
        
        # Sale information
        sale_data = prop_data.get("sale", {}) or {}
        last_sale_amount = sale_data.get("amount", {}) or {}
        last_sale_price = _safe_float(last_sale_amount.get("saleamt"))
        last_sale_date = sale_data.get("saleTransDate", "")
        
        # Owner information
        owner_data = prop_data.get("owner", {}) or {}
        owner_name = owner_data.get("owner1", {}).get("fullName", "")
        owner_occupied = owner_data.get("owneroccupied") == "Y"
        absentee_owner = owner_data.get("absenteeowner") == "Y"
        
        # Mortgage/equity calculation
        mortgage_data = prop_data.get("mortgage", {}) or {}
        mortgage_amount = _safe_float(mortgage_data.get("amount"))
        
        equity_percent = None
        if estimated_value and mortgage_amount:
            equity = estimated_value - mortgage_amount
            equity_percent = (equity / estimated_value) * 100 if estimated_value > 0 else 0
        
        # Provider ID
        identifier = prop_data.get("identifier", {}) or {}
        provider_id = identifier.get("Id") or identifier.get("attomId") or ""
        
        return ProviderLead(
            address=full_address or None,
            city=city or None,
            state=state or None,
            zip_code=zip_code or None,
            owner_name=owner_name or None,
            bedrooms=bedrooms,
            bathrooms=bathrooms,
            sqft=sqft,
            lot_size=lot_size,
            year_built=year_built,
            property_type=property_type or None,
            estimated_value=estimated_value,
            assessed_value=assessed_value,
            last_sale_price=last_sale_price,
            last_sale_date=last_sale_date or None,
            owner_occupied=owner_occupied if owner_occupied is not None else None,
            absentee_owner=absentee_owner if absentee_owner is not None else None,
            equity_percent=equity_percent,
            mortgage_amount=mortgage_amount,
            provider_id=provider_id or None,
            raw_data=prop_data,  # Store raw for debugging
        )
    except Exception as e:
        logger.error(f"Error parsing ATTOM property: {e}")
        return None


class AttomProvider(LeadProvider):
    """
    ATTOM Data Property API Provider
    Documentation: https://api.gateway.attomdata.com/propertyapi/v1.0.0/
    """
    name = "attom"

    def __init__(self):
        self.api_key = settings.ATTOM_API_KEY
        self.base_url = settings.ATTOM_BASE_URL

    def configured(self) -> tuple[bool, list[str]]:
        """Check if ATTOM provider is properly configured"""
        missing: list[str] = []
        if not self.api_key:
            missing.append("ATTOM_API_KEY")
        if not self.base_url:
            missing.append("ATTOM_BASE_URL")
        return (len(missing) == 0, missing)

    async def fetch_leads(
        self,
        zipcode: str | None,
        limit: int,
        filters: FilterSpec | None = None,
    ) -> list[ProviderLead]:
        """
        Fetch property leads from ATTOM API based on search criteria.
        Uses the property/snapshot endpoint for basic property search.
        """
        ok, missing = self.configured()
        if not ok:
            logger.warning(f"ATTOM provider not configured. Missing: {missing}")
            return []

        # Build query parameters
        params = _attom_params_from_filters(zipcode=zipcode, limit=limit, filters=filters)

        # Use property/snapshot endpoint for basic property search
        # Alternative endpoints: property/detail (more detailed), property/basicprofile
        url = f"{self.base_url.rstrip('/')}/property/snapshot"

        headers = {
            "apikey": self.api_key or "",
            "accept": "application/json",
        }

        try:
            logger.info(f"Fetching ATTOM properties with params: {params}")
            
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.get(url, headers=headers, params=params)
                
                if response.status_code == 401:
                    logger.error("ATTOM API authentication failed - check API key")
                    return []
                elif response.status_code == 429:
                    logger.error("ATTOM API rate limit exceeded")
                    return []
                elif response.status_code >= 400:
                    logger.error(f"ATTOM API error: {response.status_code} - {response.text}")
                    return []

                data = response.json()
                
                # ATTOM typically returns results in a 'property' array
                properties = data.get("property", [])
                if not properties:
                    logger.info("No properties returned from ATTOM")
                    return []
                
                # Parse each property into ProviderLead
                leads: list[ProviderLead] = []
                for prop in properties:
                    lead = _parse_attom_property(prop)
                    if lead:
                        leads.append(lead)
                
                logger.info(f"Successfully parsed {len(leads)} properties from ATTOM")
                return leads

        except httpx.TimeoutException:
            logger.error("ATTOM API request timed out")
            return []
        except Exception as e:
            logger.error(f"Error fetching ATTOM leads: {e}")
            return []
