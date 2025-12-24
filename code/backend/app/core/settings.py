from __future__ import annotations

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "Passive Pilot"
    ENV: str = "dev"  # dev | staging | prod
    DEBUG: bool = True

    # Security
    SECRET_KEY: str = "CHANGE_ME_TO_A_LONG_RANDOM_STRING"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 86400


    # DB
    DATABASE_URL: str = "sqlite:///./passive_pilot.db"

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Provider keys (placeholders; wired later)
    ATTOM_API_KEY: str | None = None
    ATTOM_BASE_URL: str = "https://api.gateway.attomdata.com/propertyapi/v1.0.0"
    REPLIERS_API_KEY: str | None = None
    DEALMACHINE_API_KEY: str | None = None

    # Payments (placeholder; wired later)
    STRIPE_SECRET_KEY: str | None = None
    STRIPE_WEBHOOK_SECRET: str | None = None

    # AI (placeholder; wired later)
    OPENAI_API_KEY: str | None = None

    # Deal Scoring Configuration
    # MAO (Maximum Allowable Offer) formula: MAO = ARV * MAO_MULTIPLIER - repair_cost - closing_cost_buffer
    MAO_MULTIPLIER: float = 0.70  # 70% rule (adjustable)
    DEFAULT_CLOSING_COST_BUFFER: float = 3000.0  # Default closing costs estimate
    DEFAULT_ASSIGNMENT_FEE: float = 5000.0  # Default wholesaling assignment fee
    
    # Repair cost estimation (per sqft tiers based on condition)
    REPAIR_COST_PER_SQFT_EXCELLENT: float = 0.0  # No repairs needed
    REPAIR_COST_PER_SQFT_GOOD: float = 10.0  # Minor updates
    REPAIR_COST_PER_SQFT_AVERAGE: float = 25.0  # Moderate repairs
    REPAIR_COST_PER_SQFT_FAIR: float = 40.0  # Significant repairs
    REPAIR_COST_PER_SQFT_POOR: float = 60.0  # Major renovation
    REPAIR_COST_DEFAULT_MULTIPLIER: float = 30.0  # Default if no condition data
    
    # Deal Score Weighting (0-100 scale)
    DEAL_SCORE_SPREAD_WEIGHT: float = 0.5  # Weight for MAO vs asking price spread
    DEAL_SCORE_ARV_WEIGHT: float = 0.3  # Weight for ARV vs neighborhood comp
    DEAL_SCORE_EQUITY_WEIGHT: float = 0.2  # Weight for equity percentage

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
