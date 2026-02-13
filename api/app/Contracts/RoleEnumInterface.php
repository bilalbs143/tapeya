<?php

namespace App\Contracts;

/**
 * Role enums (AppRoleEnum, AdminRoleEnum) implement this so User::hasRole() works with guard.
 */
interface RoleEnumInterface
{
    public function guard(): string;
}
