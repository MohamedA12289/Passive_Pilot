from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol

from app.schemas.filters import FilterSpec


@dataclass
class ProviderLead:
    address: str | None = None
    city: str | None = None
    state: str | None = None
    zip_code: str | None = None
    owner_name: str | None = None
    phone: str | None = None


class LeadProvider(Protocol):
    name: str

    def configured(self) -> tuple[bool, list[str]]: ...

    async def fetch_leads(
        self,
        zipcode: str | None,
        limit: int,
        filters: FilterSpec | None = None,
    ) -> list[ProviderLead]: ...
