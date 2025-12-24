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
    ACCESS_TOKEN_EXPIRE_MINUTES = 86400


    # DB
    DATABASE_URL: str = "sqlite:///./passive_pilot.db"

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Provider keys (placeholders; wired later)
    ATTOM_API_KEY: str | None = None
    REPLIERS_API_KEY: str | None = None
    DEALMACHINE_API_KEY: str | None = None

    # Payments (placeholder; wired later)
    STRIPE_SECRET_KEY: str | None = None
    STRIPE_WEBHOOK_SECRET: str | None = None

    # AI (placeholder; wired later)
    OPENAI_API_KEY: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
