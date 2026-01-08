from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from jose import jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.db import init_db, SessionLocal
from app.core.roles import ROLE_ADMIN
from app.models.user import User

from app.models.app_control import AppControl
from app.services.audit import write_audit_event

from app.routers import auth, admin, billing, campaigns, leads, providers, campaign_populate, exports, deals
from app.routers import dev_tools
from app.routers import admin_audit
from app.routers import dev_audit
from app.routers import campaign_filters
from app.routers import buyer_profile
from app.routers import lightning_leads

try:
    from app.routers import admin_stats
except ImportError:
    admin_stats = None  # TODO: add admin_stats router module when available

try:
    from app.routers import developer
except ImportError:
    developer = None  # TODO: add developer router module when available

app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAINT_KEY = "maintenance_mode"
MAINT_MSG_KEY = "maintenance_message"

MAINT_ALLOW_PREFIXES = (
    "/dev/app/status",
    "/dev/app/run",
    "/health",
    "/docs",
    "/openapi.json",
)

AUDIT_IGNORE_PREFIXES = (
    "/openapi.json",
    "/docs",
)

AUDIT_IGNORE_PATHS = (
    "/health",
)


def _bootstrap_admin():
    if not settings.BOOTSTRAP_ADMIN_EMAIL:
        return
    db: Session = SessionLocal()
    try:
        user = db.query(User).filter(User.email == settings.BOOTSTRAP_ADMIN_EMAIL).first()
        if user and user.role != ROLE_ADMIN:
            user.role = ROLE_ADMIN
            db.commit()
    finally:
        db.close()


def _validate_critical_config():
    """
    Validate critical configuration at startup.
    Warns for missing optional configs, raises for critical ones.
    """
    import logging
    logger = logging.getLogger(__name__)

    # Critical configs (app won't work without these)
    if not settings.SECRET_KEY or settings.SECRET_KEY == "CHANGE_ME_TO_A_LONG_RANDOM_STRING":
        logger.error("SECRET_KEY is not set or using default value! This is a security risk.")
        logger.error("Set a strong random SECRET_KEY in your .env file")
        raise ValueError("SECRET_KEY must be configured with a secure random value")

    if not settings.DATABASE_URL:
        logger.error("DATABASE_URL is not set!")
        raise ValueError("DATABASE_URL must be configured")

    # Optional but important configs
    warnings = []
    if not settings.ATTOM_API_KEY:
        warnings.append("ATTOM_API_KEY not set - ATTOM property data provider will not work")

    if not settings.STRIPE_SECRET_KEY:
        warnings.append("STRIPE_SECRET_KEY not set - billing features will not work")

    if not settings.OPENAI_API_KEY:
        warnings.append("OPENAI_API_KEY not set - AI features will not work")

    # Log warnings
    if warnings:
        logger.warning("Configuration warnings:")
        for w in warnings:
            logger.warning(f"  - {w}")

    logger.info("Configuration validation complete")


@app.on_event("startup")
def on_startup():
    _validate_critical_config()
    init_db()
    _bootstrap_admin()


def _get_app_control(db: Session, key: str) -> str | None:
    row = db.query(AppControl).filter(AppControl.key == key).first()
    return row.value if row else None


def _extract_bearer_token(request: Request) -> str | None:
    authz = request.headers.get("Authorization") or ""
    if authz.lower().startswith("bearer "):
        return authz.split(" ", 1)[1].strip()
    return None


def _get_actor_from_token(db: Session, token: str | None):
    """
    Attempts to decode JWT and map to a user.
    Your tokens use 'sub' as the subject; that might be user_id or email.
    """
    if not token:
        return None, None, None

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        sub = str(payload.get("sub") or "").strip()
        if not sub:
            return None, None, None

        # try as int user_id
        user = None
        try:
            uid = int(sub)
            user = db.query(User).filter(User.id == uid).first()
        except Exception:
            user = db.query(User).filter(User.email == sub).first()

        if not user:
            return None, None, None

        return user.id, user.email, getattr(user, "role", None)
    except Exception:
        return None, None, None


@app.middleware("http")
async def maintenance_mode_guard(request: Request, call_next):
    path = request.url.path

    for p in MAINT_ALLOW_PREFIXES:
        if path.startswith(p):
            return await call_next(request)

    db: Session = SessionLocal()
    try:
        mode = (_get_app_control(db, MAINT_KEY) or "0").strip()
        if mode == "1":
            msg = (_get_app_control(db, MAINT_MSG_KEY) or "").strip() or "System temporarily unavailable."
            return JSONResponse(status_code=503, content={"detail": msg})
    finally:
        db.close()

    return await call_next(request)


@app.middleware("http")
async def audit_logger(request: Request, call_next):
    path = request.url.path
    method = request.method.upper()

    # ignore docs + health
    if path in AUDIT_IGNORE_PATHS or any(path.startswith(p) for p in AUDIT_IGNORE_PREFIXES):
        return await call_next(request)

    response = await call_next(request)

    # Only log "important" actions by default:
    # - auth endpoints (login/register)
    # - all mutating requests
    should_log = False
    action = None

    if path.startswith("/auth/login"):
        should_log = True
        action = "auth.login"
    elif path.startswith("/auth/register"):
        should_log = True
        action = "auth.register"
    elif method in ("POST", "PUT", "PATCH", "DELETE"):
        should_log = True
        action = "http.mutation"

    if should_log:
        db: Session = SessionLocal()
        try:
            token = _extract_bearer_token(request)
            actor_user_id, actor_email, actor_role = _get_actor_from_token(db, token)

            write_audit_event(
                db,
                action=action or "event",
                status_code=response.status_code,
                method=method,
                path=path,
                actor_user_id=actor_user_id,
                actor_email=actor_email,
                actor_role=actor_role,
                entity_type=None,
                entity_id=None,
                meta=None,
            )
        finally:
            db.close()

    return response


@app.get("/")
def read_root():
    return {"name": settings.APP_NAME, "status": "ok"}


@app.get("/health")
def health():
    return {"ok": True}


# Core
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(billing.router, prefix="/billing", tags=["billing"])
app.include_router(campaigns.router, prefix="/campaigns", tags=["campaigns"])
app.include_router(campaign_populate.router, prefix="/campaigns", tags=["campaigns-populate"])

# ✅ NEW: saved campaign filter endpoints
app.include_router(campaign_filters.router, prefix="/campaigns", tags=["campaign-filters"])

app.include_router(leads.router, prefix="/leads", tags=["leads"])
app.include_router(providers.router, prefix="/providers", tags=["providers"])
app.include_router(exports.router, prefix="/exports", tags=["exports"])
app.include_router(deals.router, prefix="/deals", tags=["deals"])
app.include_router(buyer_profile.router, prefix="/buyer-profile", tags=["buyer-profile"])
app.include_router(lightning_leads.router, prefix="/lightning-leads", tags=["lightning-leads"])
app.include_router(lightning_leads.router, prefix="/ai", tags=["ai"])

# Admin (dev can access admin endpoints because require_roles expands admin->dev)
app.include_router(admin.router, prefix="/admin", tags=["admin"])
app.include_router(admin_audit.router, prefix="/admin", tags=["admin-audit"])
if admin_stats:
    app.include_router(admin_stats.router, prefix="/admin", tags=["admin-stats"])
# TODO: enable admin_stats router once module is available

# Dev tools (kill switch etc.)
app.include_router(dev_tools.router, prefix="/dev", tags=["dev-tools"])
app.include_router(dev_audit.router, prefix="/dev", tags=["dev-audit"])

# Developer-only dashboard API (dev only)
if developer:
    app.include_router(developer.router, prefix="/developer", tags=["developer"])
# TODO: enable developer router once module is available
