"""
Deal Scoring Engine for PassivePilot v3

This module implements the deal analysis and scoring logic for real estate wholesaling.
It calculates ARV, repair estimates, MAO, and overall deal scores based on property data.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Optional

from app.core.settings import get_settings

settings = get_settings()
from app.providers.base import ProviderLead

logger = logging.getLogger(__name__)


@dataclass
class DealAnalysis:
    """
    Results of deal scoring analysis
    """
    # Core metrics
    arv: float  # After Repair Value
    repair_estimate: float  # Estimated repair costs
    mao: float  # Maximum Allowable Offer
    deal_score: float  # 0-100 score
    
    # Supporting data
    estimated_value: float  # Current estimated value
    spread: float  # Difference between MAO and asking price
    spread_percent: float  # Spread as percentage of ARV
    
    # Explanation/reasoning
    score_breakdown: dict[str, float]  # Component scores
    recommendation: str  # "Strong", "Good", "Fair", "Poor"
    notes: list[str]  # Explanation of score factors


class PropertyCondition:
    """Property condition classifications for repair estimates"""
    EXCELLENT = "excellent"  # Move-in ready, no repairs
    GOOD = "good"  # Minor cosmetic updates
    AVERAGE = "average"  # Moderate repairs needed
    FAIR = "fair"  # Significant repairs needed
    POOR = "poor"  # Major renovation required


def estimate_property_condition(lead: ProviderLead) -> str:
    """
    Estimate property condition based on available data.
    
    This is a simple heuristic. In production, you might use:
    - Property photos analysis
    - Age of property
    - Last sale date vs current value
    - Neighborhood trends
    """
    # Default to average condition if no data
    if not lead.year_built and not lead.last_sale_price:
        return PropertyCondition.AVERAGE
    
    # Age-based heuristic
    current_year = 2024
    age = current_year - lead.year_built if lead.year_built else 50
    
    if age < 10:
        return PropertyCondition.GOOD
    elif age < 30:
        return PropertyCondition.AVERAGE
    elif age < 50:
        return PropertyCondition.FAIR
    else:
        return PropertyCondition.POOR


def calculate_repair_estimate(
    lead: ProviderLead,
    condition: Optional[str] = None,
) -> tuple[float, str]:
    """
    Calculate estimated repair costs based on property characteristics.
    
    Formula: repair_cost = sqft * cost_per_sqft_by_condition
    
    Args:
        lead: Property lead data
        condition: Override condition (if known)
    
    Returns:
        (repair_estimate, condition_used)
    """
    if not lead.sqft or lead.sqft <= 0:
        # No sqft data - use a default minimum
        logger.warning(f"No sqft data for {lead.address}, using default estimate")
        return 15000.0, "unknown"
    
    # Determine condition
    if condition is None:
        condition = estimate_property_condition(lead)
    
    # Get cost per sqft based on condition
    cost_per_sqft_map = {
        PropertyCondition.EXCELLENT: settings.REPAIR_COST_PER_SQFT_EXCELLENT,
        PropertyCondition.GOOD: settings.REPAIR_COST_PER_SQFT_GOOD,
        PropertyCondition.AVERAGE: settings.REPAIR_COST_PER_SQFT_AVERAGE,
        PropertyCondition.FAIR: settings.REPAIR_COST_PER_SQFT_FAIR,
        PropertyCondition.POOR: settings.REPAIR_COST_PER_SQFT_POOR,
    }
    
    cost_per_sqft = cost_per_sqft_map.get(
        condition,
        settings.REPAIR_COST_DEFAULT_MULTIPLIER
    )
    
    repair_estimate = lead.sqft * cost_per_sqft
    
    # Add minimum floor (always some holding/transaction costs)
    repair_estimate = max(repair_estimate, 5000.0)
    
    logger.info(
        f"Repair estimate for {lead.address}: ${repair_estimate:,.0f} "
        f"({lead.sqft} sqft × ${cost_per_sqft}/sqft, condition: {condition})"
    )
    
    return repair_estimate, condition


def calculate_arv(lead: ProviderLead) -> tuple[float, str]:
    """
    Calculate After Repair Value (ARV).
    
    Priority order:
    1. Use ATTOM estimated value (AVM) if available
    2. Use comparable sales data (if available in future)
    3. Use assessed value with market multiplier
    4. Use last sale price with appreciation
    
    Args:
        lead: Property lead data
    
    Returns:
        (arv, method_used)
    """
    # Method 1: Use estimated value from provider (AVM)
    if lead.estimated_value and lead.estimated_value > 0:
        logger.info(f"ARV from estimated value: ${lead.estimated_value:,.0f}")
        return lead.estimated_value, "avm"
    
    # Method 2: Use assessed value with multiplier
    # (Assessed values are typically 80-90% of market value)
    if lead.assessed_value and lead.assessed_value > 0:
        arv = lead.assessed_value * 1.15  # 15% above assessed
        logger.info(f"ARV from assessed value: ${arv:,.0f} (assessed: ${lead.assessed_value:,.0f})")
        return arv, "assessed_value"
    
    # Method 3: Use last sale price with appreciation (rough estimate)
    if lead.last_sale_price and lead.last_sale_price > 0:
        # Assume 3% annual appreciation
        # This is very rough - in production, use actual market data
        years_since_sale = 5  # Default assumption
        appreciation = 1.03 ** years_since_sale
        arv = lead.last_sale_price * appreciation
        logger.info(f"ARV from last sale: ${arv:,.0f} (last sale: ${lead.last_sale_price:,.0f})")
        return arv, "last_sale"
    
    # No data available - cannot calculate
    logger.warning(f"Cannot calculate ARV for {lead.address} - insufficient data")
    return 0.0, "insufficient_data"


def calculate_mao(
    arv: float,
    repair_estimate: float,
    assignment_fee: Optional[float] = None,
    closing_costs: Optional[float] = None,
) -> float:
    """
    Calculate Maximum Allowable Offer (MAO).
    
    Formula: MAO = (ARV × multiplier) - repair_cost - assignment_fee - closing_costs
    
    The multiplier is typically 0.70 (70% rule) but can be adjusted based on market.
    
    Args:
        arv: After Repair Value
        repair_estimate: Estimated repair costs
        assignment_fee: Wholesaling assignment fee (default from settings)
        closing_costs: Closing cost buffer (default from settings)
    
    Returns:
        Maximum Allowable Offer
    """
    if assignment_fee is None:
        assignment_fee = settings.DEFAULT_ASSIGNMENT_FEE
    
    if closing_costs is None:
        closing_costs = settings.DEFAULT_CLOSING_COST_BUFFER
    
    # Calculate MAO using the configured multiplier
    mao = (arv * settings.MAO_MULTIPLIER) - repair_estimate - assignment_fee - closing_costs
    
    # MAO should never be negative
    mao = max(mao, 0.0)
    
    logger.info(
        f"MAO calculation: "
        f"(${arv:,.0f} × {settings.MAO_MULTIPLIER}) - ${repair_estimate:,.0f} - "
        f"${assignment_fee:,.0f} - ${closing_costs:,.0f} = ${mao:,.0f}"
    )
    
    return mao


def calculate_deal_score(
    lead: ProviderLead,
    arv: float,
    mao: float,
    repair_estimate: float,
    asking_price: Optional[float] = None,
) -> tuple[float, dict[str, float], list[str]]:
    """
    Calculate overall deal score (0-100) based on multiple factors.
    
    Scoring components:
    1. Spread score: How much room between MAO and asking price (50%)
    2. ARV score: ARV relative to neighborhood (30%)
    3. Equity score: Existing equity position (20%)
    
    Args:
        lead: Property lead data
        arv: Calculated After Repair Value
        mao: Calculated Maximum Allowable Offer
        repair_estimate: Estimated repair costs
        asking_price: Current asking/list price (if available)
    
    Returns:
        (total_score, score_breakdown, notes)
    """
    breakdown = {}
    notes = []
    
    # Component 1: Spread Score (MAO vs Asking Price)
    # Max points: Higher spread = better deal
    if asking_price and asking_price > 0:
        spread = mao - asking_price
        spread_percent = (spread / arv * 100) if arv > 0 else 0
        
        # Score based on spread percentage
        if spread_percent >= 20:
            spread_score = 100.0
            notes.append(f"Excellent spread: {spread_percent:.1f}% (${spread:,.0f})")
        elif spread_percent >= 15:
            spread_score = 85.0
            notes.append(f"Strong spread: {spread_percent:.1f}%")
        elif spread_percent >= 10:
            spread_score = 70.0
            notes.append(f"Good spread: {spread_percent:.1f}%")
        elif spread_percent >= 5:
            spread_score = 50.0
            notes.append(f"Fair spread: {spread_percent:.1f}%")
        elif spread_percent >= 0:
            spread_score = 25.0
            notes.append(f"Tight spread: {spread_percent:.1f}%")
        else:
            spread_score = 0.0
            notes.append(f"Negative spread: {spread_percent:.1f}% - overpriced")
    else:
        # No asking price - assume average score
        spread_score = 50.0
        notes.append("No asking price available for comparison")
    
    breakdown["spread"] = spread_score
    
    # Component 2: ARV Score (Property Value)
    # This would ideally compare to neighborhood comps
    # For now, score based on absolute value and price/sqft
    if lead.sqft and lead.sqft > 0:
        price_per_sqft = arv / lead.sqft
        
        if price_per_sqft >= 200:
            arv_score = 100.0
            notes.append(f"Premium property: ${price_per_sqft:.0f}/sqft")
        elif price_per_sqft >= 150:
            arv_score = 85.0
            notes.append(f"Above average value: ${price_per_sqft:.0f}/sqft")
        elif price_per_sqft >= 100:
            arv_score = 70.0
            notes.append(f"Good value: ${price_per_sqft:.0f}/sqft")
        elif price_per_sqft >= 75:
            arv_score = 55.0
            notes.append(f"Average value: ${price_per_sqft:.0f}/sqft")
        else:
            arv_score = 40.0
            notes.append(f"Lower value: ${price_per_sqft:.0f}/sqft")
    else:
        arv_score = 60.0
        notes.append("No sqft data for value analysis")
    
    breakdown["arv"] = arv_score
    
    # Component 3: Equity Score
    if lead.equity_percent is not None:
        if lead.equity_percent >= 50:
            equity_score = 100.0
            notes.append(f"High equity: {lead.equity_percent:.0f}%")
        elif lead.equity_percent >= 30:
            equity_score = 75.0
            notes.append(f"Good equity: {lead.equity_percent:.0f}%")
        elif lead.equity_percent >= 20:
            equity_score = 50.0
            notes.append(f"Moderate equity: {lead.equity_percent:.0f}%")
        else:
            equity_score = 25.0
            notes.append(f"Low equity: {lead.equity_percent:.0f}%")
    else:
        equity_score = 50.0
        notes.append("No equity data available")
    
    breakdown["equity"] = equity_score
    
    # Calculate weighted total score
    total_score = (
        spread_score * settings.DEAL_SCORE_SPREAD_WEIGHT +
        arv_score * settings.DEAL_SCORE_ARV_WEIGHT +
        equity_score * settings.DEAL_SCORE_EQUITY_WEIGHT
    )
    
    # Add bonus points for motivated seller indicators
    if lead.absentee_owner:
        total_score += 5.0
        notes.append("Bonus: Absentee owner")
    
    # Cap at 100
    total_score = min(total_score, 100.0)
    
    logger.info(f"Deal score for {lead.address}: {total_score:.1f}/100")
    
    return total_score, breakdown, notes


def get_recommendation(score: float) -> str:
    """
    Get human-readable recommendation based on deal score.
    """
    if score >= 80:
        return "Strong Deal"
    elif score >= 65:
        return "Good Deal"
    elif score >= 50:
        return "Fair Deal"
    elif score >= 35:
        return "Marginal Deal"
    else:
        return "Poor Deal"


def analyze_deal(
    lead: ProviderLead,
    asking_price: Optional[float] = None,
    condition_override: Optional[str] = None,
) -> DealAnalysis:
    """
    Perform complete deal analysis on a property lead.
    
    This is the main entry point for deal scoring. It calculates all metrics
    and returns a comprehensive analysis.
    
    Args:
        lead: Property lead data from provider
        asking_price: Current asking/list price (if known)
        condition_override: Override auto-detected condition
    
    Returns:
        DealAnalysis with all calculated metrics
    
    Raises:
        ValueError: If insufficient data to perform analysis
    """
    # Calculate ARV
    arv, arv_method = calculate_arv(lead)
    if arv <= 0:
        raise ValueError(f"Cannot calculate ARV for property: {lead.address}")
    
    # Calculate repair estimate
    repair_estimate, condition = calculate_repair_estimate(lead, condition_override)
    
    # Calculate MAO
    mao = calculate_mao(arv, repair_estimate)
    
    # Calculate deal score
    deal_score, score_breakdown, notes = calculate_deal_score(
        lead, arv, mao, repair_estimate, asking_price
    )
    
    # Calculate spread
    spread = mao - asking_price if asking_price else 0.0
    spread_percent = (spread / arv * 100) if arv > 0 else 0.0
    
    # Get recommendation
    recommendation = get_recommendation(deal_score)
    
    # Add analysis method notes
    notes.insert(0, f"ARV calculated using: {arv_method}")
    notes.insert(1, f"Property condition: {condition}")
    
    return DealAnalysis(
        arv=arv,
        repair_estimate=repair_estimate,
        mao=mao,
        deal_score=deal_score,
        estimated_value=lead.estimated_value or 0.0,
        spread=spread,
        spread_percent=spread_percent,
        score_breakdown=score_breakdown,
        recommendation=recommendation,
        notes=notes,
    )
