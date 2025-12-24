from pydantic import BaseModel
class PopulateResultOut(BaseModel):
    created_leads: int
    provider: str
    note: str
