from pydantic import BaseModel


class ProviderStatusOut(BaseModel):
    name: str
    configured: bool
    missing: list[str] = []


class PopulateIn(BaseModel):
    # expected: "attom" or "repliers"
    provider: str
    zipcode: str | None = None
    limit: int = 50
