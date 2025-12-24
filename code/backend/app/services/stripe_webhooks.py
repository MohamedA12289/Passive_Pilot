from __future__ import annotations
from datetime import datetime, timezone
from typing import Any
from sqlalchemy.orm import Session
from app.models.subscription import Subscription

def _ts_to_dt(ts: int | None) -> datetime | None:
    if not ts:
        return None
    return datetime.fromtimestamp(int(ts), tz=timezone.utc)

def upsert_subscription_from_customer(db: Session, customer_id: str) -> Subscription:
    sub = db.query(Subscription).filter(Subscription.stripe_customer_id == customer_id).first()
    if sub:
        return sub
    raise ValueError("Unknown customer_id (no subscription record). Create checkout first.")

def handle_stripe_event(db: Session, event: dict[str, Any]) -> dict[str, Any]:
    etype = event.get("type")
    obj = (event.get("data") or {}).get("object") or {}

    if etype in ("customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted"):
        customer_id = obj.get("customer")
        sub_id = obj.get("id")
        status = obj.get("status")
        current_period_end = _ts_to_dt(obj.get("current_period_end"))
        if not customer_id:
            return {"ok": True, "ignored": True, "reason": "missing customer"}
        sub = upsert_subscription_from_customer(db, customer_id)
        sub.stripe_subscription_id = sub_id
        if status:
            sub.status = status
        sub.current_period_end = current_period_end
        db.commit()
        return {"ok": True, "type": etype}

    if etype in ("invoice.paid", "invoice.payment_succeeded"):
        customer_id = obj.get("customer")
        if not customer_id:
            return {"ok": True, "ignored": True, "reason": "missing customer"}
        sub = upsert_subscription_from_customer(db, customer_id)
        sub.status = "active"
        db.commit()
        return {"ok": True, "type": etype}

    if etype in ("invoice.payment_failed",):
        customer_id = obj.get("customer")
        if not customer_id:
            return {"ok": True, "ignored": True, "reason": "missing customer"}
        sub = upsert_subscription_from_customer(db, customer_id)
        sub.status = "past_due"
        db.commit()
        return {"ok": True, "type": etype}

    return {"ok": True, "ignored": True, "type": etype}
