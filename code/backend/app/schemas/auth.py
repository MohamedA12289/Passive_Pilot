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


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserMe(BaseModel):
    id: int
    email: EmailStr
    role: str


class ChangePasswordIn(BaseModel):
    current_password: str = Field(min_length=1, max_length=72, pattern=r"^\S+$")
    new_password: str = PASSWORD_RULES
