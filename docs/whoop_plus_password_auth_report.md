# Whoop + Password Auth Linkage Report

## Files Changed

### Backend (`code/backend/`)
- `app/models/user.py` - Added `username` and `password_hash` columns
- `app/schemas/auth.py` - Added `SetCredentialsIn`, `LoginPasswordIn`, `UserMeExtended` schemas; updated `Token`
- `app/routers/auth.py` - Added `/set-credentials`, `/login-password` endpoints; updated `/me`
- `app/scripts/__init__.py` - New scripts package
- `app/scripts/seed_dev_user.py` - Dev user seeding script
- `alembic/versions/0012_add_username_password_hash.py` - Migration for new columns
- `alembic/versions/e9b4ea997b68_merge_heads.py` - Alembic head merge
- `.env.example` - Added `DEV_SEED_*` placeholders

### Frontend (`code/frontend/`)
- `app/login/page.tsx` - Added dual login: "Continue with Whoop" + username/password form
- `app/onboarding/credentials/page.tsx` - New credentials setup page

## How Linkage Works

1. **Existing Whoop/Supabase Flow**: Users can log in via the existing Supabase auth (labeled "Continue with Whoop")
2. **New Local Credentials**: Users can also set a username/password to log in directly via `/auth/login-password`
3. **Credential Setup**: After Whoop OAuth login, if `needs_credentials=true`, users can optionally set local credentials at `/onboarding/credentials`
4. **Case-Insensitive Usernames**: Usernames are stored as-entered but matched case-insensitively

### Endpoints
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/auth/set-credentials` | POST | Required | Set username/password for authenticated user |
| `/auth/login-password` | POST | None | Login with username/password |
| `/auth/me` | GET | Required | Returns user info with `needs_credentials` boolean |

## How to Seed Dev User

```bash
cd code/backend
export DEV_SEED_USERNAME=devuser
export DEV_SEED_PASSWORD=devpassword123
PYTHONPATH=. python -m app.scripts.seed_dev_user
```

## How to Test Locally

### Backend
```bash
cd code/backend
PYTHONPATH=. pytest -x
PYTHONPATH=. alembic upgrade head
```

### Frontend
```bash
cd code/frontend
npm ci
CI=1 npm run build --no-lint
```

### Manual Testing
1. Start backend: `cd code/backend && uvicorn app.main:app --reload`
2. Start frontend: `cd code/frontend && npm run dev`
3. Create a user via `/register`
4. Login via Whoop flow
5. Visit `/onboarding/credentials` to set local credentials
6. Logout and login via username/password form

## What Was NOT Changed

- **Supabase integration**: Existing Whoop/Supabase auth flow remains unchanged
- **Role system**: No changes to roles (admin, dev, client, buyer, wholesaler)
- **Existing `/auth/login`**: OAuth2 password form login (email-based) still works
- **Subscription logic**: No changes to billing/subscription checks
- **Other auth endpoints**: `/auth/register`, `/auth/change-password` unchanged
- **Frontend routing guards**: `RequireAuth` component unchanged

## Security Notes

- Passwords hashed with bcrypt via passlib
- Username validation: 3-30 chars, alphanumeric + underscore only
- Password validation: minimum 8 characters
- No real secrets in repository - all use environment variables
