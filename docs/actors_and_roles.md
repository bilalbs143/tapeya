# Actors, Roles & Permissions (final)

## 1. Overview

| Actor | Login | Where | Storage |
|-------|--------|--------|---------|
| **Admin** | Yes, separate | Backoffice only | `users.type = administrator` + optional `roles` (guard=admin) |
| **User** (player / organizer / sponsor) | Yes | App only | `users.type = user` + `roles` (guard=app) via `role_user` |

- **Roles** are scoped by **guard** (`app` | `admin`). Same `roles` table and `role_user` pivot; slug is unique per guard.
- **Permissions** are attached to **roles**; users get permissions through their roles. Permissions also have a guard.

---

## 2. Database

| Table | Purpose |
|-------|---------|
| `users` | All accounts. `type`: administrator, system, user. |
| `roles` | name, slug, **guard** (app/admin). Slug unique per guard. |
| `role_user` | user_id ↔ role_id (user has many roles). |
| `permissions` | name, slug, **guard**. Slug unique per guard. |
| `role_permission` | role_id ↔ permission_id (role has many permissions). |

**Flow**: User → **roles** (via `role_user`) → **permissions** (via `role_permission`).

---

## 3. Guards

| Guard | Used for | Role examples |
|-------|----------|----------------|
| `app` | App users (`type = user`) | player, organizer, sponsor |
| `admin` | Backoffice admins (`type = administrator`) | super_admin, … |

- Enums: **`AppRoleEnum`** (player, organizer, sponsor), **`AdminRoleEnum`** (super_admin; add more as needed).
- **`RoleGuardEnum`**: `APP`, `ADMIN`. **`RoleEnumInterface`**: `guard(): string` (implemented by app/admin role enums).

---

## 4. Role API

| Method | Description |
|--------|-------------|
| `Role::findBySlug(string $slug, ?string $guard = null)` | Get role by slug (and optional guard). |
| `Role::forGuard(string $guard)` | Scope: roles for that guard. |
| `$role->users` | Users that have this role. |
| `$role->permissions` | Permissions attached to this role. |
| `$role->givePermissionTo(Permission\|string $permission)` | Attach permission (by object or slug; uses role’s guard). |
| `$role->revokePermissionTo(Permission\|string $permission)` | Detach permission. |
| `$role->hasPermission(string $slug)` | Whether this role has that permission. |
| `$role->isRole(RoleEnumInterface $role)` | Whether this role matches the enum (slug + guard). |

---

## 5. Permission API

| Method | Description |
|--------|-------------|
| `Permission::firstOrCreate(['slug' => '…', 'guard' => '…'], ['name' => '…'])` | Create permission if missing. |
| `$permission->roles` | Roles that have this permission. |

---

## 6. User API (roles & permissions)

| Method | Description |
|--------|-------------|
| `$user->roles` | User’s roles. |
| `$user->hasRole(RoleEnumInterface\|string $role, ?string $guard = null)` | Has this role (enum or slug; guard default app). |
| `$user->hasAnyRole(array $roles, ?string $guard = null)` | Has any of the given roles. |
| `$user->hasPermissionTo(string $permission, ?string $guard = null)` | Has this permission via any of their roles (guard default app). |
| `User::appUsers()` | Scope: `type = user`. |
| `User::withRole(RoleEnumInterface\|string $role, ?string $guard = null)` | Scope: users that have this role. |

---

## 7. Actor usage

**Admin**

- `$user->isAdmin()`.
- Roles (optional): `$user->hasRole(AdminRoleEnum::SUPER_ADMIN)`, `$user->hasPermissionTo('streams.delete', RoleGuardEnum::ADMIN->value)`.

**App user (player / organizer / sponsor)**

- `$user->isUser()`, `$user->roles`, `$user->hasRole(AppRoleEnum::SPONSOR)`, `$user->hasAnyRole([AppRoleEnum::PLAYER, AppRoleEnum::ORGANIZER])`, `$user->hasPermissionTo('tournaments.create')`.
- Queries: `User::appUsers()->withRole(AppRoleEnum::ORGANIZER)->get()`.

---

## 8. Example: attach permission to role and check on user

```php
// Create permission (e.g. in seeder or when adding a feature)
Permission::firstOrCreate(
    ['slug' => 'tournaments.create', 'guard' => 'app'],
    ['name' => 'Create tournaments']
);

// Attach to role
$role = Role::findBySlug(AppRoleEnum::ORGANIZER->value, RoleGuardEnum::APP->value);
$role->givePermissionTo('tournaments.create');

// Check on user
$user->hasPermissionTo('tournaments.create');  // true if any of user's roles have this permission
```

---

**Status**: Final. Roles and permissions are guard-based; actors (admin, user) and APIs above are the single source of truth.
