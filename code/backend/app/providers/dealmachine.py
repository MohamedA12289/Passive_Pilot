from __future__ import annotations
from app.core.config import settings
from app.providers.base import LeadProvider, ProviderLead

class DealMachineProvider(LeadProvider):
    name = "dealmachine"
    def __init__(self):
        self.api_key = settings.DEALMACHINE_API_KEY
        self.base_url = settings.DEALMACHINE_BASE_URL or "PUT_URL_HERE"
    def configured(self) -> tuple[bool, list[str]]:
        missing: list[str] = []
        if not self.api_key or self.api_key == "PUT_API_HERE":
            missing.append("DEALMACHINE_API_KEY")
        if self.base_url in (None, "", "PUT_URL_HERE"):
            missing.append("DEALMACHINE_BASE_URL")
        return (len(missing) == 0, missing)
    async def fetch_leads(self, zipcode: str | None, limit: int) -> list[ProviderLead]:
        return []
