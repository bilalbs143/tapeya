# Facebook-Style Login / Logout Scenario

## Overview

When a user logs out, their profile and access token are saved locally. On the next visit, the login screen shows these saved profiles. **Tapping a profile logs in instantly without OTP** (no SMS cost). If the token is expired or missing, the app falls back to OTP. "Login with other account" lets the user enter a different phone number.

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LOGIN SCREEN                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────┐     │
│   │  Has saved profiles?                                               │     │
│   └──────────────────────────────────────────────────────────────────┘     │
│              │                                    │                           │
│              ▼ Yes                                ▼ No                        │
│   ┌─────────────────────┐              ┌─────────────────────┐              │
│   │  Show profile cards │              │  Show phone form    │              │
│   │  (avatar + name)    │              │  directly           │              │
│   └─────────────────────┘              └─────────────────────┘              │
│              │                                    │                           │
│              │  User taps profile                 │  User enters phone        │
│              ▼                                    ▼                           │
│   Has token? ──Yes──> Verify /me ──> Home (no OTP)   Request OTP ──> OTP    │
│      │  No/401                                              screen           │
│      └──────────> Request OTP                                              │
│              │                                    │                           │
│              └────────────────┬───────────────────┘                           │
│                               ▼                                               │
│   ┌──────────────────────────────────────────────────────────────────┐      │
│   │  "Login with other account"  →  Reveal / focus phone form         │      │
│   └──────────────────────────────────────────────────────────────────┘      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           OTP SCREEN                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│   User enters 6-digit OTP  →  Verify  →  Success: set credentials, go Home   │
│   (Bump this profile to top of saved list on success)                        │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                           LOGOUT FLOW                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   User clicks Logout  →  Call API /auth/logout                               │
│                       →  Save current user to saved profiles (localStorage)  │
│                       →  Clear credentials (Redux)                           │
│                       →  Navigate to Login screen                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Stored (LocalStorage)

**Key:** `tapeya_saved_profiles`

```json
{
  "profiles": [
    { "id": 1, "name": "Sohaib Amjad", "nickname": "sohaib", "phone": "+923157118511", "email": "sohaib@gmail.com", "accessToken": "..." }
  ],
  "maxCount": 5
}
```

- **accessToken** is stored so tap-to-login works without OTP (saves SMS cost).
- **On tap:** If token exists, verify with `/me` → success: go Home; 401: clear token, request OTP.
- **On tap (no token):** Request OTP, verify, then save profile + token for next time.
- **Deduplication:** Same `phone` updates existing entry and moves it to the top.
- **Order:** Most recently used first.

## User Stories

| # | User Action                    | Result                                                      |
|---|--------------------------------|-------------------------------------------------------------|
| 1 | User logs out                  | Profile saved; next login shows their avatar + name        |
| 2 | User opens app, taps profile   | OTP requested, OTP screen shown, verify → Home              |
| 3 | User taps "Login with other"   | Phone input shown; user enters different number            |
| 4 | User has 3 saved profiles      | All 3 shown; tap any → OTP for that phone                   |
| 5 | User logs in with new phone    | After logout, that profile is added/updated in saved list   |

## Security Notes

- Tokens are stored in localStorage (same trust model as persisted auth).
- Tap-to-login verifies token with `/me`; if expired (401), falls back to OTP and clears stored token.
- On logout, we do **not** revoke the token on the server so it can be reused for instant re-login.
