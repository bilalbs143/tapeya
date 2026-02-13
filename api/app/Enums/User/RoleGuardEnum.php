<?php

namespace App\Enums\User;

/**
 * Role guard: which context the role belongs to (app vs backoffice).
 * Enables same slug in different contexts (e.g. future admin roles).
 */
enum RoleGuardEnum: string
{
    case APP = 'app';
    case ADMIN = 'admin';
}
