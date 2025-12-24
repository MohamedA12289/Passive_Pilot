# Backend 8 (NEW series) — Billing + Premium Access

## Added/Changed
- app/core/config.py (adds STRIPE_PORTAL_RETURN_URL)
- app/schemas/billing.py (adds PortalSessionOut)
- app/routers/billing.py (adds POST /billing/portal-session)

## New Endpoint
- POST /billing/portal-session

## Notes
- If Stripe isn't configured, endpoints return 501 with clear messages.
- Set STRIPE_PORTAL_RETURN_URL if you want a custom return URL from Stripe portal.
