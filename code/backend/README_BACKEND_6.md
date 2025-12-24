# Passive Pilot — Backend 6 (Campaigns + Leads + Subscription Enforcement)

## What this adds
- Campaigns CRUD (requires active subscription for client users):
  - `GET /campaigns`
  - `POST /campaigns`
  - `GET /campaigns/{id}`
  - `PATCH /campaigns/{id}`
  - `DELETE /campaigns/{id}`

- Leads endpoints (requires active subscription for client users):
  - `GET /leads?campaign_id=...`
  - `POST /leads?campaign_id=...`
  - `DELETE /leads/{lead_id}?campaign_id=...`

- Stripe webhook now updates subscription status + current period end:
  - Handles: `customer.subscription.*`, `invoice.paid`, `invoice.payment_failed`

## Important behavior
- **Clients** must be `active` or `trialing` to use campaigns/leads.
- **Admin/Dev** bypass subscription checks.
- Webhook update requires subscription record to exist (created at checkout time).

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
