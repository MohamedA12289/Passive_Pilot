from __future__ import annotations
from app.core.config import settings
try:
    import stripe  # type: ignore
except Exception:  # pragma: no cover
    stripe = None  # type: ignore

def stripe_is_configured() -> bool:
    return bool(settings.STRIPE_SECRET_KEY and settings.STRIPE_PRICE_ID) and stripe is not None

def get_stripe():
    if stripe is None:
        raise RuntimeError("stripe library not installed")
    stripe.api_key = settings.STRIPE_SECRET_KEY
    return stripe
