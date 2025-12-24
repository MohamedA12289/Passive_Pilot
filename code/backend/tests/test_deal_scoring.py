"""
Unit tests for deal scoring service
"""

import pytest
from app.services.deal_scoring import (
    calculate_repair_estimate,
    calculate_arv,
    calculate_mao,
    calculate_deal_score,
    analyze_deal,
    PropertyCondition,
    DealAnalysis,
)
from app.providers.base import ProviderLead


def test_calculate_repair_estimate_with_sqft():
    """Test repair estimate calculation with property sqft"""
    lead = ProviderLead(
        address="123 Test St",
        sqft=2000,
        year_built=1990,
    )
    
    repair_cost, condition = calculate_repair_estimate(lead)
    
    assert repair_cost > 0
    assert condition in [
        PropertyCondition.EXCELLENT,
        PropertyCondition.GOOD,
        PropertyCondition.AVERAGE,
        PropertyCondition.FAIR,
        PropertyCondition.POOR,
    ]
    # With year 1990, should be average or fair
    assert repair_cost == 2000 * 25.0 or repair_cost == 2000 * 40.0


def test_calculate_repair_estimate_without_sqft():
    """Test repair estimate defaults when no sqft available"""
    lead = ProviderLead(
        address="123 Test St",
    )
    
    repair_cost, condition = calculate_repair_estimate(lead)
    
    # Should return default minimum
    assert repair_cost == 15000.0
    assert condition == "unknown"


def test_calculate_repair_estimate_with_condition_override():
    """Test repair estimate with condition override"""
    lead = ProviderLead(
        address="123 Test St",
        sqft=1500,
        year_built=2010,
    )
    
    repair_cost, condition = calculate_repair_estimate(lead, condition=PropertyCondition.POOR)
    
    assert condition == PropertyCondition.POOR
    assert repair_cost == 1500 * 60.0  # Poor condition multiplier


def test_calculate_arv_from_estimated_value():
    """Test ARV calculation using estimated value (AVM)"""
    lead = ProviderLead(
        address="123 Test St",
        estimated_value=350000.0,
    )
    
    arv, method = calculate_arv(lead)
    
    assert arv == 350000.0
    assert method == "avm"


def test_calculate_arv_from_assessed_value():
    """Test ARV calculation using assessed value"""
    lead = ProviderLead(
        address="123 Test St",
        assessed_value=300000.0,
    )
    
    arv, method = calculate_arv(lead)
    
    assert arv == 300000.0 * 1.15  # 15% above assessed
    assert method == "assessed_value"


def test_calculate_arv_from_last_sale():
    """Test ARV calculation using last sale price"""
    lead = ProviderLead(
        address="123 Test St",
        last_sale_price=250000.0,
    )
    
    arv, method = calculate_arv(lead)
    
    # Should apply appreciation (3% annually for 5 years default)
    assert arv > 250000.0
    assert method == "last_sale"


def test_calculate_arv_insufficient_data():
    """Test ARV calculation fails gracefully with no data"""
    lead = ProviderLead(
        address="123 Test St",
    )
    
    arv, method = calculate_arv(lead)
    
    assert arv == 0.0
    assert method == "insufficient_data"


def test_calculate_mao():
    """Test Maximum Allowable Offer calculation"""
    arv = 400000.0
    repair_estimate = 50000.0
    
    mao = calculate_mao(arv, repair_estimate)
    
    # MAO = ARV * 0.70 - repair - assignment - closing
    # = 400000 * 0.70 - 50000 - 5000 - 3000
    # = 280000 - 58000 = 222000
    expected = (400000 * 0.70) - 50000 - 5000 - 3000
    assert mao == expected


def test_calculate_mao_never_negative():
    """Test MAO is never negative"""
    arv = 100000.0
    repair_estimate = 200000.0  # Repairs exceed value
    
    mao = calculate_mao(arv, repair_estimate)
    
    assert mao == 0.0  # Should be capped at 0


def test_calculate_deal_score_good_spread():
    """Test deal score with good spread"""
    lead = ProviderLead(
        address="123 Test St",
        sqft=2000,
        estimated_value=350000.0,
    )
    
    arv = 350000.0
    mao = 220000.0
    repair_estimate = 50000.0
    asking_price = 200000.0  # Good spread
    
    score, breakdown, notes = calculate_deal_score(
        lead, arv, mao, repair_estimate, asking_price
    )
    
    assert score > 0
    assert score <= 100
    assert "spread" in breakdown
    assert "arv" in breakdown
    assert "equity" in breakdown
    assert len(notes) > 0


def test_calculate_deal_score_negative_spread():
    """Test deal score with negative spread (overpriced)"""
    lead = ProviderLead(
        address="123 Test St",
        sqft=2000,
        estimated_value=350000.0,
    )
    
    arv = 350000.0
    mao = 200000.0
    repair_estimate = 50000.0
    asking_price = 250000.0  # Asking price exceeds MAO
    
    score, breakdown, notes = calculate_deal_score(
        lead, arv, mao, repair_estimate, asking_price
    )
    
    # Score should be low due to negative spread
    assert score < 60
    assert breakdown["spread"] == 0.0


def test_calculate_deal_score_with_equity():
    """Test deal score includes equity bonus"""
    lead = ProviderLead(
        address="123 Test St",
        sqft=2000,
        estimated_value=350000.0,
        equity_percent=60.0,  # High equity
    )
    
    arv = 350000.0
    mao = 220000.0
    repair_estimate = 50000.0
    asking_price = 200000.0
    
    score, breakdown, notes = calculate_deal_score(
        lead, arv, mao, repair_estimate, asking_price
    )
    
    # Should have high equity score
    assert breakdown["equity"] == 100.0
    assert any("equity" in note.lower() for note in notes)


def test_analyze_deal_complete():
    """Test complete deal analysis"""
    lead = ProviderLead(
        address="123 Main St",
        city="Austin",
        state="TX",
        zip_code="78704",
        sqft=1800,
        bedrooms=3,
        bathrooms=2.0,
        year_built=1985,
        estimated_value=380000.0,
        equity_percent=45.0,
        absentee_owner=True,
    )
    
    asking_price = 270000.0
    
    analysis = analyze_deal(lead, asking_price=asking_price)
    
    assert isinstance(analysis, DealAnalysis)
    assert analysis.arv > 0
    assert analysis.repair_estimate > 0
    assert analysis.mao > 0
    assert 0 <= analysis.deal_score <= 100
    assert analysis.spread == analysis.mao - asking_price
    assert len(analysis.notes) > 0
    assert analysis.recommendation in [
        "Strong Deal",
        "Good Deal",
        "Fair Deal",
        "Marginal Deal",
        "Poor Deal",
    ]


def test_analyze_deal_insufficient_data():
    """Test deal analysis fails with insufficient data"""
    lead = ProviderLead(
        address="123 Test St",
        # No value data
    )
    
    with pytest.raises(ValueError):
        analyze_deal(lead, asking_price=200000.0)


def test_analyze_deal_excellent_condition():
    """Test deal analysis with excellent condition override"""
    lead = ProviderLead(
        address="123 Main St",
        sqft=2000,
        estimated_value=400000.0,
    )
    
    analysis = analyze_deal(
        lead,
        asking_price=250000.0,
        condition_override=PropertyCondition.EXCELLENT,
    )
    
    # Excellent condition should have minimal or zero repair costs
    assert analysis.repair_estimate <= 5000.0


def test_analyze_deal_poor_condition():
    """Test deal analysis with poor condition override"""
    lead = ProviderLead(
        address="123 Main St",
        sqft=2000,
        estimated_value=400000.0,
    )
    
    analysis = analyze_deal(
        lead,
        asking_price=250000.0,
        condition_override=PropertyCondition.POOR,
    )
    
    # Poor condition should have high repair costs
    assert analysis.repair_estimate >= 60000.0  # 2000 sqft * $60/sqft
