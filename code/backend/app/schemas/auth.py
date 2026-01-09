from pydantic import BaseModel, EmailStr, Field, field_validator

# Password rules:
# - min 6
# - max 72
# - no whitespace
PASSWORD_RULES = Field(min_length=6, max_length=72, pattern=r"^\S+$")

# Allowed email domains (top/common providers)
ALLOWED_EMAIL_DOMAINS = {
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "icloud.com",
    "aol.com",
    "live.com",
    "protonmail.com",
    "proton.me",
}


class UserCreate(BaseModel):
    email: EmailStr
    password: str = PASSWORD_RULES
    role: str = Field(default="wholesaler", pattern=r"^(buyer|wholesaler)$")

    @field_validator("email")
    @classmethod
    def email_must_be_common_provider(cls, v: EmailStr) -> EmailStr:
        email_str = str(v).strip().lower()
        parts = email_str.rsplit("@", 1)
        if len(parts) != 2:
            # keep message simple + consistent
            raise ValueError("Please use a valid email")

        domain = parts[1]
        if domain not in ALLOWED_EMAIL_DOMAINS:
            raise ValueError("Please use a valid email")

        return v

    @field_validator("role")
    @classmethod
    def role_must_be_allowed(cls, v: str) -> str:
        allowed = {"buyer", "wholesaler"}
        if v not in allowed:
            raise ValueError("Role must be buyer or wholesaler")
        return v


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int | None = None
    email: str | None = None
    role: str | None = None


class UserMe(BaseModel):
    id: int
    email: EmailStr
    role: str


class ChangePasswordIn(BaseModel):
    current_password: str = Field(min_length=1, max_length=72, pattern=r"^\S+$")
    new_password: str = PASSWORD_RULES


# --- Whoop + Password Linkage Schemas ---

class SetCredentialsIn(BaseModel):
    username: str = Field(min_length=3, max_length=30, pattern=r"^[a-zA-Z0-9_]+$")
    password: str = Field(min_length=8, max_length=72, pattern=r"^\S+$")


class LoginPasswordIn(BaseModel):
    username: str = Field(min_length=1, max_length=30)
    password: str = Field(min_length=1, max_length=72)


class UserMeExtended(BaseModel):
    id: int
    email: EmailStr
    role: str
    username: str | None = None
    needs_credentials: bool = True
