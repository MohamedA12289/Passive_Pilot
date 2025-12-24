# Passive Pilot — Frontend 3

## What changed from Frontend 2
- Added **Billing** section:
  - `/billing` shows subscription status and opens Stripe checkout (`POST /billing/checkout-session`)
  - `/billing/success` and `/billing/cancel` pages
- Sidebar now includes **Billing**

## Setup
```powershell
cd frontend
npm install
copy .env.local.example .env.local
npm run dev
```

## Notes
If backend Stripe isn’t configured yet, Billing will show an error like:
- "Stripe not configured yet. Set STRIPE_SECRET_KEY and STRIPE_PRICE_ID."
