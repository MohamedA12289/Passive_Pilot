"""
Unit tests for ATTOM provider
"""

import pytest
from unittest.mock import AsyncMock, Mock, patch
from app.providers.attom import (
    AttomProvider,
    _attom_params_from_filters,
    _parse_attom_property,
    _safe_int,
    _safe_float,
)
from app.schemas.filters import FilterSpec


def test_safe_int_conversion():
    """Test safe integer conversion"""
    assert _safe_int(42) == 42
    assert _safe_int("42") == 42
    assert _safe_int(42.7) == 42
    assert _safe_int(None) is None
    assert _safe_int("invalid") is None
    assert _safe_int("") is None


def test_safe_float_conversion():
    """Test safe float conversion"""
    assert _safe_float(42.5) == 42.5
    assert _safe_float("42.5") == 42.5
    assert _safe_float(42) == 42.0
    assert _safe_float(None) is None
    assert _safe_float("invalid") is None
    assert _safe_float("") is None


def test_attom_params_basic():
    """Test basic ATTOM params generation"""
    params = _attom_params_from_filters(
        zipcode="78704",
        limit=50,
        filters=None,
    )
    
    assert params["postalcode"] == "78704"
    assert params["pageSize"] == 50
    assert params["page"] == 1


def test_attom_params_with_filters():
    """Test ATTOM params with comprehensive filters"""
    filters = FilterSpec(
        zip_codes=["78704", "78705"],
        city="Austin",
        state="TX",
        min_beds=3,
        max_beds=5,
        min_baths=2.0,
        max_baths=3.0,
        min_sqft=1500,
        max_sqft=2500,
        min_year_built=1980,
        max_year_built=2020,
        min_lot_size=5000,
        max_lot_size=10000,
        absentee_owner=True,
        property_types=["Single Family", "Townhouse"],
    )
    
    params = _attom_params_from_filters(
        zipcode="78704",
        limit=100,
        filters=filters,
    )
    
    # Check zip codes (should merge zipcode arg and filters.zip_codes)
    assert "78704" in params["postalcode"]
    assert "78705" in params["postalcode"]
    
    # Check city/state
    assert params["locality"] == "Austin"
    assert params["address2"] == "TX"
    
    # Check beds/baths
    assert params["minBeds"] == 3
    assert params["maxBeds"] == 5
    assert params["minBathsTotal"] == 2.0
    assert params["maxBathsTotal"] == 3.0
    
    # Check sqft
    assert params["minUniversalSize"] == 1500
    assert params["maxUniversalSize"] == 2500
    
    # Check year built
    assert params["minYearBuilt"] == 1980
    assert params["maxYearBuilt"] == 2020
    
    # Check lot size
    assert params["minLotSize2"] == 5000
    assert params["maxLotSize2"] == 10000
    
    # Check absentee
    assert params["absenteeowner"] == "absentee"
    
    # Check property types (should map to ATTOM codes)
    assert "10" in params["propertyIndicator"]  # Single Family
    assert "12" in params["propertyIndicator"]  # Townhouse


def test_attom_params_limit_capping():
    """Test that limit is capped at maximum"""
    params = _attom_params_from_filters(
        zipcode="78704",
        limit=1000,  # Exceeds max
        filters=None,
    )
    
    assert params["pageSize"] == 500  # Should be capped


def test_parse_attom_property_complete():
    """Test parsing complete ATTOM property response"""
    raw_data = {
        "address": {
            "oneLine": "123 Main St, Austin, TX 78704",
            "locality": "Austin",
            "countrySubd": "TX",
            "postal1": "78704",
        },
        "building": {
            "size": {
                "universalsize": 1800,
            },
            "rooms": {
                "beds": 3,
                "bathstotal": 2.0,
            },
        },
        "lot": {
            "lotsize2": 7500,
            "yearbuilt": 1985,
        },
        "summary": {
            "proptype": "Single Family Residential",
        },
        "assessment": {
            "assessed": {
                "assdttlvalue": 280000,
            },
        },
        "avm": {
            "amount": {
                "value": 350000,
            },
        },
        "sale": {
            "amount": {
                "saleamt": 250000,
            },
            "saleTransDate": "2018-06-15",
        },
        "owner": {
            "owner1": {
                "fullName": "John Doe",
            },
            "owneroccupied": "N",
            "absenteeowner": "Y",
        },
        "mortgage": {
            "amount": 150000,
        },
        "identifier": {
            "attomId": "ATTOM123456",
        },
    }
    
    lead = _parse_attom_property(raw_data)
    
    assert lead is not None
    assert lead.address == "123 Main St, Austin, TX 78704"
    assert lead.city == "Austin"
    assert lead.state == "TX"
    assert lead.zip_code == "78704"
    assert lead.bedrooms == 3
    assert lead.bathrooms == 2.0
    assert lead.sqft == 1800
    assert lead.lot_size == 7500
    assert lead.year_built == 1985
    assert lead.property_type == "Single Family Residential"
    assert lead.assessed_value == 280000
    assert lead.estimated_value == 350000
    assert lead.last_sale_price == 250000
    assert lead.last_sale_date == "2018-06-15"
    assert lead.owner_name == "John Doe"
    assert lead.owner_occupied is False
    assert lead.absentee_owner is True
    assert lead.mortgage_amount == 150000
    assert lead.equity_percent is not None
    assert lead.provider_id == "ATTOM123456"


def test_parse_attom_property_minimal():
    """Test parsing ATTOM property with minimal data"""
    raw_data = {
        "address": {
            "oneLine": "456 Oak Ave",
            "locality": "Dallas",
            "countrySubd": "TX",
            "postal1": "75201",
        },
    }
    
    lead = _parse_attom_property(raw_data)
    
    assert lead is not None
    assert lead.address == "456 Oak Ave"
    assert lead.city == "Dallas"
    assert lead.state == "TX"
    assert lead.zip_code == "75201"
    # Other fields should be None
    assert lead.bedrooms is None
    assert lead.sqft is None


def test_parse_attom_property_fallback_address():
    """Test address fallback when oneLine not available"""
    raw_data = {
        "address": {
            "line1": "789 Elm St",
            "line2": "Apt 5",
            "locality": "Houston",
            "countrySubd": "TX",
            "postal1": "77001",
        },
    }
    
    lead = _parse_attom_property(raw_data)
    
    assert lead is not None
    assert "789 Elm St" in lead.address
    assert "Apt 5" in lead.address


def test_parse_attom_property_equity_calculation():
    """Test equity percentage calculation"""
    raw_data = {
        "address": {
            "oneLine": "123 Test St",
        },
        "avm": {
            "amount": {
                "value": 400000,
            },
        },
        "mortgage": {
            "amount": 200000,
        },
    }
    
    lead = _parse_attom_property(raw_data)
    
    assert lead is not None
    assert lead.estimated_value == 400000
    assert lead.mortgage_amount == 200000
    # Equity = (400000 - 200000) / 400000 = 50%
    assert lead.equity_percent == 50.0


def test_parse_attom_property_avm_fallback():
    """Test AVM fallback to assessed value"""
    raw_data = {
        "address": {
            "oneLine": "123 Test St",
        },
        "assessment": {
            "assessed": {
                "assdttlvalue": 300000,
            },
        },
        # No AVM data
    }
    
    lead = _parse_attom_property(raw_data)
    
    assert lead is not None
    # Should use assessed value * 1.1 as estimate
    assert lead.estimated_value == 300000 * 1.1


def test_attom_provider_configuration():
    """Test ATTOM provider configuration check"""
    with patch("app.providers.attom.settings") as mock_settings:
        mock_settings.ATTOM_API_KEY = "test-key"
        mock_settings.ATTOM_BASE_URL = "https://api.test.com"
        
        provider = AttomProvider()
        configured, missing = provider.configured()
        
        assert configured is True
        assert len(missing) == 0


def test_attom_provider_not_configured():
    """Test ATTOM provider when not configured"""
    with patch("app.providers.attom.settings") as mock_settings:
        mock_settings.ATTOM_API_KEY = None
        mock_settings.ATTOM_BASE_URL = None
        
        provider = AttomProvider()
        configured, missing = provider.configured()
        
        assert configured is False
        assert "ATTOM_API_KEY" in missing
        assert "ATTOM_BASE_URL" in missing


@pytest.mark.asyncio
async def test_attom_provider_fetch_leads_success():
    """Test successful ATTOM API call"""
    with patch("app.providers.attom.settings") as mock_settings:
        mock_settings.ATTOM_API_KEY = "test-key"
        mock_settings.ATTOM_BASE_URL = "https://api.test.com"
        
        provider = AttomProvider()
        
        # Mock the HTTP response
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "property": [
                {
                    "address": {
                        "oneLine": "123 Main St",
                        "locality": "Austin",
                        "countrySubd": "TX",
                        "postal1": "78704",
                    },
                    "building": {
                        "size": {"universalsize": 1800},
                        "rooms": {"beds": 3, "bathstotal": 2.0},
                    },
                    "avm": {
                        "amount": {"value": 350000},
                    },
                }
            ]
        }
        
        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )
            
            leads = await provider.fetch_leads(
                zipcode="78704",
                limit=10,
                filters=None,
            )
            
            assert len(leads) == 1
            assert leads[0].address == "123 Main St"
            assert leads[0].city == "Austin"
            assert leads[0].bedrooms == 3


@pytest.mark.asyncio
async def test_attom_provider_fetch_leads_not_configured():
    """Test fetch_leads when provider not configured"""
    with patch("app.providers.attom.settings") as mock_settings:
        mock_settings.ATTOM_API_KEY = None
        mock_settings.ATTOM_BASE_URL = None
        
        provider = AttomProvider()
        
        leads = await provider.fetch_leads(
            zipcode="78704",
            limit=10,
            filters=None,
        )
        
        assert len(leads) == 0


@pytest.mark.asyncio
async def test_attom_provider_fetch_leads_api_error():
    """Test API error handling"""
    with patch("app.providers.attom.settings") as mock_settings:
        mock_settings.ATTOM_API_KEY = "test-key"
        mock_settings.ATTOM_BASE_URL = "https://api.test.com"
        
        provider = AttomProvider()
        
        # Mock error response
        mock_response = Mock()
        mock_response.status_code = 401
        mock_response.text = "Unauthorized"
        
        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )
            
            leads = await provider.fetch_leads(
                zipcode="78704",
                limit=10,
                filters=None,
            )
            
            assert len(leads) == 0


@pytest.mark.asyncio
async def test_attom_provider_fetch_leads_rate_limit():
    """Test rate limit handling"""
    with patch("app.providers.attom.settings") as mock_settings:
        mock_settings.ATTOM_API_KEY = "test-key"
        mock_settings.ATTOM_BASE_URL = "https://api.test.com"
        
        provider = AttomProvider()
        
        # Mock rate limit response
        mock_response = Mock()
        mock_response.status_code = 429
        mock_response.text = "Rate limit exceeded"
        
        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )
            
            leads = await provider.fetch_leads(
                zipcode="78704",
                limit=10,
                filters=None,
            )
            
            assert len(leads) == 0
