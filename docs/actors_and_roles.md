# Actors, Roles & Permissions

> **App auth (2026-08):** Assignment-based. See **[APP_CAPABILITIES.md](./APP_CAPABILITIES.md)**.  
> App-guard roles (`player` / `organizer` / `sponsor`) are **removed**. Roles remain for **admin backoffice** only.  
> **Quick Match (design):** [QUICK_MATCH.md](./QUICK_MATCH.md) — walk-up players are normal `type=user` (`added_via_quick_match` + `created_by`); match owner scoring; no new app-guard role.

## 1. Overview

| Actor | Login | Where | Storage |
|-------|--------|--------|---------|
| **Admin** | Yes | Backoffice | `users.type = administrator` **or** `type = user` + admin-guard role (e.g. broadcaster) |
| **App user** | Yes | App | `users.type = user` — auth from tournament/team/vendor **assignments**, not `/me` flags |

- **Roles** are scoped by **guard**. Only **`admin`** guard roles are seeded (`super_admin`, `broadcaster`).
- **Permissions** attach to admin roles; used by `EnsureAdminPermission` (exact slug).

## 2. Database

| Table | Purpose |
|-------|---------|
| `users` | All accounts. `type`: administrator, system, user. Quick Match walk-ups are also `type=user` with `added_via_quick_match` + `created_by` (see [QUICK_MATCH.md](./QUICK_MATCH.md) §5.4). |
| `roles` | name, slug, **guard** (`admin`). App-guard rows deleted by `api/database/scripts/drop_legacy_app_guard_roles.sql`. |
| `role_user` | user_id ↔ role_id (admin roles only after cleanup). |
| `permissions` | name, slug, **guard** (admin). |
| `role_permission` | role_id ↔ permission_id. |

**Cleanup SQL:** `api/database/scripts/drop_legacy_app_guard_roles.sql` (run once on existing DBs).

## 3. Guards

| Guard | Used for | Role examples |
|-------|----------|----------------|
| `admin` | Backoffice | `super_admin`, `broadcaster` |

- Enum: **`RoleGuardEnum::ADMIN`** only. **`AppRoleEnum` deleted.** Legacy `guard = 'app'` role rows are removed by the SQL cleanup script (string match, not enum).

## 4–6. Role / Permission / User APIs

Unchanged for **admin** roles: `Role::findBySlug`, `$user->hasRole(AdminRoleEnum::…)`, `$user->hasPermissionTo('…', 'admin')`, `$user->getAdminRoles()`.

**App feature gates** (not roles):

| Helper | Meaning |
|--------|---------|
| `$user->canManageTeam($team)` | Owner or tournament staff for that team |
| `$user->isTournamentStaff($tournament)` | organizer_id / created_by / broadcaster pivot |

`/me` has no capability bag. Seller UI uses optional `vendor` (`id`, `store_name`, `status`) when `shop_vendors` exists.

## 7. Actor usage

**Admin / backoffice**

- `$user->isAdmin()`, `$user->canAccessBackofficeApi()`, `$user->hasBroadcastBackofficeRole()`.
- `$user->hasPermissionTo('streams.delete', RoleGuardEnum::ADMIN->value)`.

**App user**

- `$user->isUser()`, assignment helpers above.
- Admin Players registry = all `type = user` (no role filter).

## 8. Unified user search

See [APP_CAPABILITIES.md §2](./APP_CAPABILITIES.md#2-unified-user-search-pickers).

| Surface | Endpoint |
|---------|----------|
| App pickers (owner / squad / icons) | `GET /users/lookup?search=` |
| App @mentions | `GET /users/search?q=` |
| Backoffice all pickers | `GET /admin/users/search?search=` |

## 9. Cleanup

After deploy, run `api/database/scripts/drop_legacy_app_guard_roles.sql` on existing DBs so app-guard `roles` / `role_user` / orphan `permissions` rows are dropped. Fresh installs never seed them (`RoleSeeder` is admin-only).
