<?php

namespace App\Utils\Services;

use App\Enums\Currency\CurrencyEnum;
use App\Enums\SystemSetting\SystemSettingKeyEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\SystemSetting;
use App\Models\User;

class SystemSettingsService
{
    public static function getSystemUser()
    {
        return User::where('type', UserTypeEnum::SYSTEM)->first();
    }

    public static function isUserAutoActive()
    {
        // TODO: We can check may be from database on later stages
        return true;
    }

    public static function isPointsRequestAutoApproved(?User $user)
    {
        // TODO: We can check may be from database on later stages
        return true;
    }

    public static function isCouponPointsRequestAutoApproved(?User $user)
    {
        // TODO: We can check may be from database on later stages
        return true;
    }

    public static function isMemberAutoApprovalEnabled(): bool
    {
        $systemSetting = SystemSetting::where('key', SystemSettingKeyEnum::AUTO_APPROVAL_ENABLED)->first();

        return $systemSetting?->plain_value ?? false;
    }

    public static function getDefaultCurrency(): CurrencyEnum
    {
        $systemSetting = SystemSetting::where('key', SystemSettingKeyEnum::DEFAULT_CURRENCY)->first();

        return $systemSetting?->plain_value ?? CurrencyEnum::KRW;
    }

    public static function getWeeklyLossBonusPercentage(): float
    {
        $systemSetting = SystemSetting::where('key', SystemSettingKeyEnum::WEEKLY_LOSS_BONUS_PERCENTAGE)->first();

        return $systemSetting?->plain_value ?? 0;
    }
}
