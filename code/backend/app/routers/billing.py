from __future__ import annotations
from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.db import get_db
from app.core.deps import get_current_user
from app.core.roles import ROLE_CLIENT
from app.core.stripe_client import stripe_is_configured, get_stripe
from app.models.subscription import Subscription
from app.models.user import User
from app.schemas.billing import CheckoutSessionOut, PortalSessionOut, SubscriptionOut
from app.services.stripe_webhooks import handle_stripe_event

router = APIRouter()

def _get_or_create_subscription(db: Session, user: User) -> Subscription:
    sub = db.query(Subscription).filter(Subscription.user_id == user.id).first()
    if not sub:
        sub = Subscription(user_id=user.id, status="inactive")
        db.add(sub); db.commit(); db.refresh(sub)
    return sub

@router.get("/me", response_model=SubscriptionOut)
def my_subscription(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sub = db.query(Subscription).filter(Subscription.user_id == current_user.id).first()
    if not sub:
        return SubscriptionOut(status="inactive", current_period_end=None)
    return SubscriptionOut(status=sub.status, current_period_end=sub.current_period_end)

@router.post("/checkout-session", response_model=CheckoutSessionOut)
def create_checkout_session(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != ROLE_CLIENT:
        raise HTTPException(status_code=400, detail="Only client accounts can subscribe")
    if not stripe_is_configured():
        raise HTTPException(status_code=501, detail="Stripe not configured yet. Set STRIPE_SECRET_KEY and STRIPE_PRICE_ID.")
    stripe = get_stripe()
    sub = _get_or_create_subscription(db, current_user)
    if not sub.stripe_customer_id:
        customer = stripe.Customer.create(email=current_user.email)
        sub.stripe_customer_id = customer["id"]
        db.commit(); db.refresh(sub)
    session = stripe.checkout.Session.create(
        mode="subscription",
        customer=sub.stripe_customer_id,
        line_items=[{"price": settings.STRIPE_PRICE_ID, "quantity": 1}],
        success_url=f"{settings.APP_PUBLIC_URL}/billing/success",
        cancel_url=f"{settings.APP_PUBLIC_URL}/billing/cancel",
    )
    return CheckoutSessionOut(url=session["url"])

@router.post("/portal-session", response_model=PortalSessionOut)
def portal_session(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a Stripe customer portal session so users can manage billing.
    If Stripe is not configured, return 501 with a clear message.
    """
    if not stripe_is_configured():
        raise HTTPException(status_code=501, detail="Stripe not configured yet. Set STRIPE_SECRET_KEY and STRIPE_PRICE_ID.")

    stripe = get_stripe()
    sub = _get_or_create_subscription(db, current_user)
    if not sub.stripe_customer_id:
        # Ensure customer exists (best-effort)
        customer = stripe.Customer.create(email=current_user.email)
        sub.stripe_customer_id = customer["id"]
        db.add(sub)
        db.commit()
        db.refresh(sub)

    return_url = settings.STRIPE_PORTAL_RETURN_URL or "http://localhost:3000/settings/billing"
    session = stripe.billing_portal.Session.create(
        customer=sub.stripe_customer_id,
        return_url=return_url,
    )
    return {"url": session["url"]}

@router.post("/webhook")
async def stripe_webhook(request: Request, stripe_signature: str | None = Header(default=None), db: Session = Depends(get_db)):
    if not settings.STRIPE_WEBHOOK_SECRET:
        raise HTTPException(status_code=501, detail="Stripe webhook not configured yet. Set STRIPE_WEBHOOK_SECRET.")
    if not stripe_is_configured():
        raise HTTPException(status_code=501, detail="Stripe not configured yet.")
    stripe = get_stripe()
    payload = await request.body()
    if not stripe_signature:
        raise HTTPException(status_code=400, detail="Missing Stripe-Signature header")
    try:
        event = stripe.Webhook.construct_event(payload=payload, sig_header=stripe_signature, secret=settings.STRIPE_WEBHOOK_SECRET)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Webhook error: {str(e)}")
    return handle_stripe_event(db, event)
