# Passive Pilot — Frontend 6

## What changed from Frontend 5
- Campaign page upgrades:
  - **CSV import** (client-side parse → creates leads through existing `/leads/` endpoint)
  - **Search** across leads
  - **Leads table** layout (easier scanning)
  - **Bulk delete** for the current filtered results
  - Small progress bar + import status message

## Setup
```powershell
cd frontend
npm install
copy .env.local.example .env.local
npm run dev
```

## CSV headers supported
- address / street / street_address
- city
- state / st
- zip / zipcode / zip_code
- owner / owner_name / name
- phone / phone_number / mobile / cell
