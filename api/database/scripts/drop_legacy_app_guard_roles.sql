-- Remove legacy app-guard roles (player / organizer / sponsor) and orphan app permissions.
-- Safe to run on Postgres. Does not touch admin-guard roles (super_admin, broadcaster).
-- App auth is assignment-based (docs/APP_CAPABILITIES.md). Irreversible.
--
--   psql "$DATABASE_URL" -f api/database/scripts/drop_legacy_app_guard_roles.sql
--
-- Fresh installs never seed app-guard roles (RoleSeeder is admin-only).
-- Run this once on existing DBs that still have guard = 'app' role rows.

BEGIN;

DELETE FROM role_user
WHERE role_id IN (SELECT id FROM roles WHERE guard = 'app');

DELETE FROM role_permission
WHERE role_id IN (SELECT id FROM roles WHERE guard = 'app');

DELETE FROM roles
WHERE guard = 'app';

-- Orphan app-guard permissions if any were ever seeded (none today — safe no-op).
DELETE FROM permissions
WHERE guard = 'app';

COMMIT;
