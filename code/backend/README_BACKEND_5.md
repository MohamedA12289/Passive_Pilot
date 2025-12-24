# Passive Pilot — Backend 5 (Stripe Billing Skeleton)

## What this adds
- Stripe dependency + config placeholders:
  - `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`
- `subscriptions` table (1 per user)
- Billing routes:
  - `GET /billing/me` (view your subscription status)
  - `POST /billing/checkout-session` (creates Stripe checkout URL if configured)
  - `POST /billing/webhook` (validated webhook stub)

## Notes
- If Stripe keys are not set, checkout/webhook returns **501** with a clear message.
- Full webhook event handling will be completed later (Backend 6/7) when we wire plan enforcement + status updates.

## Run / Migrate (PowerShell)
```powershell
cd backend
.env\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
alembic -c alembic.ini upgrade head
uvicorn app.main:app --reload
```
Docs: http://127.0.0.1:8000/docs
