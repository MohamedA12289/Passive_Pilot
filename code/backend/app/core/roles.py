from typing import Final

ROLE_BUYER: Final[str] = "buyer"
ROLE_WHOLESALER: Final[str] = "wholesaler"
ROLE_CLIENT: Final[str] = "wholesaler"  # Alias for backward compat
ROLE_ADMIN: Final[str] = "admin"
ROLE_DEV: Final[str] = "dev"

ALL_ROLES: Final[set[str]] = {ROLE_BUYER, ROLE_WHOLESALER, ROLE_ADMIN, ROLE_DEV}
SIGNUP_ALLOWED_ROLES: Final[set[str]] = {ROLE_BUYER, ROLE_WHOLESALER}
ELEVATED_ROLES: Final[set[str]] = {ROLE_ADMIN, ROLE_DEV}
