from typing import Final

ROLE_CLIENT: Final[str] = "client"
ROLE_ADMIN: Final[str] = "admin"
ROLE_DEV: Final[str] = "dev"

ALL_ROLES: Final[set[str]] = {ROLE_CLIENT, ROLE_ADMIN, ROLE_DEV}
ELEVATED_ROLES: Final[set[str]] = {ROLE_ADMIN, ROLE_DEV}
