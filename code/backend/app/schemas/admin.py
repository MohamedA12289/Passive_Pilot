from pydantic import BaseModel, EmailStr
class UserOut(BaseModel):
    id: int
    email: EmailStr
    role: str
    is_active: bool
class SetRoleIn(BaseModel):
    role: str
