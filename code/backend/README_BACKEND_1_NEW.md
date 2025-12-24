# Backend 1 (NEW): Auth + Roles Hardening

## What you get
- Ability to disable registration via env (`ALLOW_REGISTER=false`)
- Login response includes `user_id`, `email`, `role` (optional fields; safe for older clients)
- Endpoint to change password: `POST /auth/change-password`

## Install
1) In your backend root folder, merge the contents of this zip's `backend/` folder into your existing backend.
2) Update your `.env` (you can copy the lines from `.env.example`):
   - `ALLOW_REGISTER=true` (set false if you want to lock signups)
3) Restart backend:
   ```bash
   uvicorn app.main:app --reload
   ```

## API
- `POST /auth/register` (blocked if `ALLOW_REGISTER=false`)
- `POST /auth/login` returns:
  ```json
  {
    "access_token": "...",
    "token_type": "bearer",
    "user_id": 1,
    "email": "user@example.com",
    "role": "client"
  }
  ```
- `POST /auth/change-password` body:
  ```json
  {
    "current_password": "old",
    "new_password": "new_password_here"
  }
  ```
