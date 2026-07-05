-- =============================================================================
-- Migrate Spatie graphics settings: overlay group → graphics group
-- =============================================================================
--
-- Run AFTER deploying PHP that uses GraphicsSettings (group = 'graphics').
-- Deploy order: (1) PHP deploy → (2) this SQL → (3) restart workers → (4) dist-graphics → (5) new signed URLs
-- Safe to run on production; only renames the settings group column.
--
-- Property names (frontendUrl, defaultTtlSeconds, signingSecret) are unchanged.
-- Admin API keys changed in code only (overlay_* → graphics_*); not stored here.
--
-- Usage (PostgreSQL example):
--   psql "$DATABASE_URL" -f api/database/sql/migrate_overlay_settings_to_graphics.sql
--
-- MySQL: same UPDATE; use `group` backticks if needed: `group` = 'graphics'
-- =============================================================================

BEGIN;

-- Preview rows that will be updated (optional — comment out in automation)
-- SELECT id, "group", name, payload, updated_at
-- FROM settings
-- WHERE "group" = 'overlay'
-- ORDER BY name;

UPDATE settings
SET "group" = 'graphics',
    updated_at = NOW()
WHERE "group" = 'overlay';

-- Expect 3 rows on a seeded system (frontendUrl, defaultTtlSeconds, signingSecret)
-- SELECT id, "group", name FROM settings WHERE "group" = 'graphics' ORDER BY name;

COMMIT;

-- =============================================================================
-- Rollback (only if you need to revert code AND data together)
-- =============================================================================
-- BEGIN;
-- UPDATE settings SET "group" = 'overlay', updated_at = NOW() WHERE "group" = 'graphics';
-- COMMIT;

-- =============================================================================
-- GitHub Actions: rename repository secrets (manual, not SQL)
-- =============================================================================
-- OVERLAY_DEPLOY_HOST        → GRAPHICS_DEPLOY_HOST
-- OVERLAY_DEPLOY_USER        → GRAPHICS_DEPLOY_USER
-- OVERLAY_DEPLOY_PATH        → GRAPHICS_DEPLOY_PATH
-- OVERLAY_DEPLOY_KEY         → GRAPHICS_DEPLOY_KEY
-- OVERLAY_DEPLOY_KNOWN_HOSTS → GRAPHICS_DEPLOY_KNOWN_HOSTS
