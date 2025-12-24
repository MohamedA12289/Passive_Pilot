# Backend 2 (NEW): Campaign Flow Persistence

This drop-in patch adds a persisted, resumable campaign-builder flow state.

## What you get

- Table: `campaign_flows`
- Endpoints (all require active subscription):
  - `GET  /campaigns/{campaign_id}/flow`
  - `PUT  /campaigns/{campaign_id}/flow`
  - `POST /campaigns/{campaign_id}/flow/step`
  - `POST /campaigns/{campaign_id}/flow/reset`

## Notes

- `PUT /flow` supports shallow-merge by default. Set `replace_state=true` to replace.
- If a flow record does not exist yet, the GET/PUT will auto-create it.

## Quick test

1) Create a campaign (existing endpoint)
2) GET flow:

```bash
curl -H "Authorization: Bearer <TOKEN>" http://127.0.0.1:8000/campaigns/1/flow
```

3) Update flow:

```bash
curl -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer <TOKEN>" \
  -d '{"current_step":2,"state":{"zipcode":"23220","provider":"dealmachine"}}' \
  http://127.0.0.1:8000/campaigns/1/flow
```
