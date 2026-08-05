# App capabilities — assignment model

**Status:** Current (legacy app roles removed 2026-08-05)  
**Related:** [Actors & roles](./actors_and_roles.md), [Broadcaster role](./BROADCASTER_ROLE.md), [Multi-vendor marketplace plan](./MULTI_VENDOR_MARKETPLACE_PLAN.md)

---

## 1. Model

App authorization is **resource assignment**, not app-guard roles.

| Capability | Source of truth |
|------------|-----------------|
| Manage a tournament | `organizer_id` / `created_by` / `tournament_broadcaster` on **that** tournament |
| Own / manage a team | `teams.user_id` **or** tournament staff for a tournament that includes the team (`User::canManageTeam`) |
| Sell in shop | `shop_vendors` row + status (when marketplace ships) |
| Use the app | Any active `users.type = user` |

**Deleted:** `AppRoleEnum`, `RoleGuardEnum::APP`, app-guard role seeding, register/CSV role attach, separate `/sponsors` and `/players` typeaheads.  
**Kept:** admin-guard roles (`super_admin`, `broadcaster`) for backoffice only.

Profile **tabs** (“As a Player / Organizer / Sponsor”) remain as UI views from capabilities. The header role **badge pill** was removed.

---

## 2. API helpers

| Method | Meaning |
|--------|---------|
| `User::isTournamentStaff($tournament)` | Assignment on that tournament |
| `User::canOperateTournamentInApp` / `canScoreMatchInApp` | Staff (or admin break-glass for scoring) |
| `User::canManageTeam($team)` | Owner **or** `canManageTeamSquadAsTournamentStaff` |
| `User::appCapabilities()` | Payload for `/me` |
| `User::scopeEligibleForTournamentSquad` | App users (`type = user`, not blocked) |

`/me` (and app `UserResource`):

```json
{
  "capabilities": {
    "tournament_manager": true,
    "team_owner": true,
    "vendor_status": null
  }
}
```

| `vendor_status` | UI |
|-----------------|----|
| `null` / `rejected` | No Seller hub |
| `pending` | Read-only “awaiting approval” |
| `approved` | Full vendor mutations |
| `suspended` | Read-only hub |

No `roles` array on the app user resource.

---

## 3. Unified user search (pickers)

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

**Removed query modes:** `for_squad`, `context=broadcaster` + `tournament_id`. No separate organizer/sponsor search endpoints.

---

## 4. Team rules (locked)

| Action | Who |
|--------|-----|
| Create team for self | Any app user |
| Create team for another user | Admin backoffice only |
| Edit team / squad | Owner **or** tournament staff for a tournament that includes the team |
| Change ownership | Admin only |

---

## 5. Non-resource creates

| Action | Rule |
|--------|------|
| Tournament request | Any authenticated app user |
| Direct tournament create in app | Via request / admin / league provisioner — not a global role |
| Become vendor | Admin creates `shop_vendors` (self-serve later) |

---

## 6. DB cleanup

| Artifact | Path |
|----------|------|
| SQL script | `api/database/scripts/drop_legacy_app_guard_roles.sql` |

Run once on existing DBs (not via `artisan migrate`). Deletes:

1. `role_user` / `role_permission` rows for `roles.guard = 'app'`
2. those `roles` rows
3. orphan `permissions` with `guard = 'app'` (none seeded today — safe no-op)

Admin-guard roles/permissions untouched. **Irreversible.** Fresh installs never seed app roles (`RoleSeeder` is admin-only); `roles` / `permissions` table defaults are `admin`.

```bash
psql "$DATABASE_URL" -f api/database/scripts/drop_legacy_app_guard_roles.sql
```

---

## 7. App UI

| Surface | Gate / behavior |
|---------|-----------------|
| Profile tabs | Always **player**; **organizer** if `tournament_manager`; **sponsor** if `team_owner` (UI views, not roles) |
| Profile header | Name + official badge only — **no** role/capability label pill |
| `RequireOrganizerRole` | `capabilities.tournament_manager` |
| Team owner / squad pickers | `useLookupUsersQuery` (`/users/lookup`; empty search → `[]`) |
| Backoffice broadcast picker | Client filters out the currently assigned broadcaster from candidates |

---

## 8. Marketplace

Do **not** introduce a vendor app-guard role or seed `shop.vendor.*` app permissions. Gate on `shop_vendors` + `capabilities.vendor_status`. Admin shop money routes still need exact `admin.permission:…` slugs (marketplace plan §5.3) — separate from this app-role cleanup.

---

## 9. Verification

- `TeamCapabilityAuthTest` — assignment gates, no `data.roles` on `/me`
- `UserLookupTest` — empty search → `[]`; name match among app users
- `AdminUserSearchTest` — single admin search; no context modes
- `PlayerActivePlatformFilterTest` — players = `type = user`
- Grep: no `AppRoleEnum` / `sponsorApi` / app `GET /players` picker in product code

---

## 10. Changelog (this cut)

| Change | Detail |
|--------|--------|
| Legacy app roles removed | No `AppRoleEnum`; `RoleSeeder` admin-only; SQL script drops `guard = app` rows |
| `/me` capabilities | `tournament_manager`, `team_owner`, `vendor_status`; no `roles` |
| Profile header | Role badge/label removed |
| App user pickers | One `GET /users/lookup`; deleted `/sponsors` + `/players` picker |
| Mentions stay separate | `GET /users/search?q=` unchanged |
| Admin user pickers | One `GET /admin/users/search?search=`; dropped `for_squad` / broadcaster context |
| Demo seeder | Organizers/sponsors are plain users; power via `organizer_id` / `teams.user_id` |
| Review follow-ups | `/users/lookup` requires search; broadcast picker filters attached user client-side |
