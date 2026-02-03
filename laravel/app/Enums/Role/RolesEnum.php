<?php

namespace App\Enums\Role;

use App\Enums\BaseEnumTrait;

enum RolesEnum: string
{
    use BaseEnumTrait;

    case SUPER_ADMIN = 'super admin';
    case ADMIN = 'admin';
    case AGENT = 'agent';
    case USER = 'user';

    public function label(): string
    {
        return match ($this) {
            self::SUPER_ADMIN => __('terms.super_admin'),
            self::ADMIN => __('terms.admin'),
            self::AGENT => __('terms.agent'),
            self::USER => __('terms.user'),
        };
    }

    public function getPermissions()
    {
        return match ($this) {
            self::SUPER_ADMIN => [],
            self::ADMIN => [],
            self::AGENT => [
                PermissionsEnum::VIEW_LOGIN_HISTORY,
                PermissionsEnum::VIEW_CURRENT_SESSIONS,
                PermissionsEnum::VIEW_AGENTS,
                PermissionsEnum::VIEW_AGENT_HIERARCHY,
                PermissionsEnum::VIEW_AGENT,
                PermissionsEnum::VIEW_MEMBERS,
                PermissionsEnum::VIEW_MEMBER,
                PermissionsEnum::VIEW_EXCHANGE_REQUESTS,
                PermissionsEnum::VIEW_EXCHANGE_REQUEST,
                PermissionsEnum::VIEW_TRANSACTIONS,
                PermissionsEnum::STATS_GET_REQUESTS_COUNTER,
                PermissionsEnum::STATS_GET_REQUESTS,
                PermissionsEnum::STATS_GET_ACTIVITIES,
                PermissionsEnum::STATS_GET_CALCULATIONS,
                PermissionsEnum::VIEW_PROVIDERS,
                PermissionsEnum::VIEW_PROVIDER,
                PermissionsEnum::VIEW_USER_DAILY_SETTLEMENTS,
                PermissionsEnum::VIEW_USER_MONTHLY_SETTLEMENTS,
                PermissionsEnum::PAY,
                PermissionsEnum::VIEW_BETS_HISTORY,
                PermissionsEnum::WITHDRAW_ROLLING_MONEY,
                PermissionsEnum::WITHDRAW_LOSING_MONEY,
                PermissionsEnum::VIEW_NOTES,

                'viewPropertyPermissions' => PermissionsEnum::getViewPropertyPermissions(),
            ],
            self::USER => [],
        };
    }

    public function getDefaultPermissions()
    {
        $permissions = $this->getPermissions();

        return collect($permissions)->filter(fn ($permission, $key) => $key !== 'viewPropertyPermissions')->toArray();
    }
}
