from pydantic import BaseModel


class AppStatusOut(BaseModel):
    maintenance_mode: bool
    message: str | None = None


class MaintenanceIn(BaseModel):
    message: str | None = None
