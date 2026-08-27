# App auth — assignment model

**Status:** Current  
**Related:** [Actors & roles](./actors_and_roles.md), [Broadcaster role](./BROADCASTER_ROLE.md), [Multi-vendor marketplace plan](./MULTI_VENDOR_MARKETPLACE_PLAN.md), [Quick Match](./QUICK_MATCH.md)

App authorization is **per resource**, not a `/me` capability bag and not app-guard roles.

| Action | Source of truth |
|--------|-----------------|
| Manage a tournament | `organizer_id` / `created_by` / `tournament_broadcaster` on **that** tournament |
| Own / manage a team | `teams.user_id` **or** tournament staff for a tournament that includes the team (`User::canManageTeam`) |
| Sell in shop | `shop_vendors` row + status |
| Use the app | Any `users.type = user` |

**Deleted:** `AppRoleEnum`, `RoleGuardEnum::APP`, `/me` `capabilities`.  
**Kept:** admin-guard roles (`super_admin`, `broadcaster`) for backoffice only.

---

## 1. API helpers

| Method | Meaning |
|--------|---------|
| `User::isTournamentStaff($tournament)` | Assignment on that tournament |
| `User::canOperateTournamentInApp` / `canScoreMatchInApp` | Staff (or admin break-glass for scoring). **`canOperateTournamentInApp(Tournament $tournament)` stays non-nullable forever** — do not `?Tournament`. Quick Match: `canScoreMatchInApp` **kind-branches first**; quick path uses `canOperateQuickMatch` only. |
| `User::canManageTeam($team)` | Owner **or** `canManageTeamSquadAsTournamentStaff` |
| `User::isUser()` / `User::isActive()` | **Type** vs **status**. `isUser()` does not imply active. |
| `User::scopeAppUsers` | Exact `type = user`. Quick Match walk-ups are `type=user` too. Flag: `added_via_quick_match`. |
| `User::scopeEligibleForTournamentSquad` | `appUsers()->notBlocked()` |

`/me` (and self `UserResource`) has **no** `capabilities` and **no** `roles`. If the user has a `shop_vendors` row, include:

```json
{
  "vendor": {
    "id": 1,
    "store_name": "Street Kit",
    "status": "pending"
  }
}
```

Omit `vendor` when they have no store.

| `vendor.status` | UI |
|-----------------|----|
| *(no vendor)* | Become a Seller |
| `pending` | Seller Hub (read-only until approved) |
| `approved` | Seller Hub |
| `suspended` | Seller Hub (read-only) |
| `rejected` | Neither hub nor apply |

---

## 2. Unified user search (pickers)

Player / organizer / sponsor are the **same** app users. Typeaheads must not filter by legacy role.

### App API

| Endpoint | Purpose | Client |
|----------|---------|--------|
| `GET /users/lookup?search=` | Team owner, squad, icon pickers (name / nickname / phone). **Requires** a non-empty `search` (empty → `[]`). Limit 50. | `userApi.lookupUsers` → `useLookupUsersQuery` |
| `GET /users/search?q=` | @mentions / follow only (nickname + social rank) | `userApi.searchUsers` → `useSearchUsersQuery` |

**Controller:** `UserLookupController`  
**Removed:** `GET /sponsors`, `GET /players` (picker), `SponsorController`, app `PlayerController` (picker), `sponsorApi.js`.  
**Kept in `playerApi`:** cricket stats / ranking / teams only (`/users/{id}/stats`, etc.).

### Admin / backoffice API

| Endpoint | Purpose | Client |
|----------|---------|--------|
| `GET /admin/users/search?search=` | One typeahead for organizer, team owner, squad, broadcast staff, etc. | `UsersService.adminUserSearch(term)` |

**Controller:** `Admin\UserSearchController`  
**Resource:** `Admin\UserSearchResource` — `{ id, name, nickname, email, phone }`  
**Scope:** `type = user`, not blocked. Limit 25.

---

## 3. Team rules (locked)

| Action | Who |
|--------|-----|
| Create team for self | Any app user |
| Create team for another user | Admin backoffice only |
| Edit team / squad | Owner **or** tournament staff for a tournament that includes the team |
| Change ownership | Admin only |

---

## 4. Non-resource creates

| Action | Rule |
|--------|------|
| Tournament request | Any authenticated app user |
| Direct tournament create in app | Via request / admin / league provisioner |
| Quick Match | Any authenticated app user. Owner scores their own match. |
| Become vendor | `POST /shop/vendor/apply` → `pending`; admin approve/reject |

---

## 5. App UI

| Surface | Behavior |
|---------|----------|
| Profile tabs | Always Player / Organizer / Sponsor (empty states until they have data) |
| Profile header | Name + official badge only — **no** role pill |
| My Tournaments / Request Tournament | Any logged-in user |
| Seller Hub / Become a Seller | From `/me` `vendor` (see §1) |
| Team owner / squad pickers | `useLookupUsersQuery` (`/users/lookup`; empty search → `[]`) |

---

## 6. Marketplace

Do **not** introduce a vendor app-guard role. Gate on `shop_vendors`. Admin shop money routes still need exact `admin.permission:…` slugs (marketplace plan §5.3).

---

## 7. Verification

- `TeamCapabilityAuthTest` — assignment gates; `/me` has no `capabilities` / `roles`
- `VendorApplyAndPublishTest` — `/me` includes `vendor` after apply
- `UserLookupTest` — empty search → `[]`; name match among app users
- Grep: no `AppRoleEnum` / `sponsorApi` / app `GET /players` picker in product code
