import json
from typing import List, Union

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Passive Pilot"
    DEBUG: bool = True

    # Auth
    SECRET_KEY: str = "PUT_SECRET_HERE_CHANGE_ME"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 86400

    # DB
    DATABASE_URL: str = "sqlite:///./passive_pilot.db"

    # CORS (accept list OR comma-separated/JSON string from env)
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    """Allowed CORS origins.

    Accepts:
    1. JSON list string: '["http://localhost:3000","http://127.0.0.1:3000"]'
    2. Comma-separated string: 'http://localhost:3000,http://127.0.0.1:3000'
    3. Single origin string.
    """

    # Admin bootstrap (optional)
    BOOTSTRAP_ADMIN_EMAIL: str | None = None

    # Exports
    EXPORT_DIR: str = "./exports"

    # Stripe (optional)
    STRIPE_SECRET_KEY: str | None = None
    STRIPE_WEBHOOK_SECRET: str | None = None

    # Provider API keys (optional)
    DEALMACHINE_API_KEY: str | None = None
    ATTOM_API_KEY: str | None = None
    REPLIERS_API_KEY: str | None = None

    # Provider base URLs (optional overrides)
    DEALMACHINE_BASE_URL: str | None = None
    ATTOM_BASE_URL: str | None = None
    REPLIERS_BASE_URL: str | None = None

    # AI (optional)
    OPENAI_API_KEY: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def _parse_cors_origins(cls, value):
        if value is None:
            return []

        if isinstance(value, str):
            stripped = value.strip()
            if not stripped:
                return []

            try:
                parsed = json.loads(stripped)
                if isinstance(parsed, list):
                    return [str(item).strip() for item in parsed if str(item).strip()]
            except json.JSONDecodeError:
                pass

            return [s.strip() for s in stripped.split(",") if s.strip()]

        if isinstance(value, list):
            return value

        return [str(value)]


settings = Settings()
