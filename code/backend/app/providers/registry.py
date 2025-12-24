from __future__ import annotations

from app.providers.attom import AttomProvider
from app.providers.repliers import RepliersProvider


def get_provider(name: str):
    key = (name or "").strip().lower()

    if key == "attom":
        return AttomProvider()
    if key == "repliers":
        return RepliersProvider()

    raise ValueError("Unknown provider")
