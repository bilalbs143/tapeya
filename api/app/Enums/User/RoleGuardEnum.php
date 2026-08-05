<?php

namespace App\Enums\User;

/**
 * Role guard: which context the role belongs to.
 * Product roles use ADMIN only. Table defaults are `admin`. Legacy APP rows on
 * existing DBs are dropped via `api/database/scripts/drop_legacy_app_guard_roles.sql`.
 */
enum RoleGuardEnum: string
{
    case ADMIN = 'admin';
}
