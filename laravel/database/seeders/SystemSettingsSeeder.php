<?php

namespace Database\Seeders;

use App\Enums\Currency\CurrencyEnum;
use App\Enums\SystemSetting\SystemSettingGroupEnum;
use App\Enums\SystemSetting\SystemSettingKeyEnum;
use App\Enums\SystemSetting\SystemSettingTypeEnum;
use App\Models\SystemSetting;
use Illuminate\Database\Seeder;

class SystemSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->createBankInfoForQuickAccountInquiry();
        $this->createDefaultCurrency();
        $this->createReferralBonusPoints();
        $this->createWeeklyLossBonusPercentage();
        $this->createMemberAutoApprovalEnabled();
        $this->createLiveChatHtmlCode();
        $this->createTrackingHtmlCode();
    }

    private function createBankInfoForQuickAccountInquiry(): void
    {
        $systemSetting = [
            'key' => SystemSettingKeyEnum::BANK_INFO_FOR_QUICK_INQUIRY,
            'value' => null,
            'type' => SystemSettingTypeEnum::TEXT,
            'group' => SystemSettingGroupEnum::GENERAL,
            'description' => 'messages.bank_info_for_quick_inquiry',
        ];

        $this->createSystemSetting($systemSetting);
    }

    private function createDefaultCurrency(): void
    {
        $systemSetting = [
            'key' => SystemSettingKeyEnum::DEFAULT_CURRENCY,
            'value' => CurrencyEnum::IDR->value,
            'type' => SystemSettingTypeEnum::ENUM,
            'group' => SystemSettingGroupEnum::USER,
            'description' => 'messages.default_currency',
        ];

        $this->createSystemSetting($systemSetting);
    }

    private function createReferralBonusPoints(): void
    {
        $systemSetting = [
            'key' => SystemSettingKeyEnum::REFFERAL_BONUS_PERCENTAGE,
            'value' => 0,
            'type' => SystemSettingTypeEnum::FLOAT,
            'group' => SystemSettingGroupEnum::USER,
            'description' => 'messages.referral_bonus_percentage',
        ];

        $this->createSystemSetting($systemSetting);
    }

    private function createWeeklyLossBonusPercentage(): void
    {
        $systemSetting = [
            'key' => SystemSettingKeyEnum::WEEKLY_LOSS_BONUS_PERCENTAGE,
            'value' => 1, // 1% default
            'type' => SystemSettingTypeEnum::FLOAT,
            'group' => SystemSettingGroupEnum::USER,
            'description' => 'messages.weekly_loss_bonus_percentage',
        ];

        $this->createSystemSetting($systemSetting);
    }

    private function createMemberAutoApprovalEnabled(): void
    {
        $systemSetting = [
            'key' => SystemSettingKeyEnum::AUTO_APPROVAL_ENABLED,
            'value' => false, // Default to disabled, admin can enable it
            'type' => SystemSettingTypeEnum::BOOLEAN,
            'group' => SystemSettingGroupEnum::USER,
            'description' => 'messages.auto_approval_enabled',
        ];

        $this->createSystemSetting($systemSetting);
    }

    private function createLiveChatHtmlCode(): void
    {
        $systemSetting = [
            'key' => SystemSettingKeyEnum::LIVE_CHAT_HTML_CODE,
            'value' => null,
            'type' => SystemSettingTypeEnum::TEXT,
            'group' => SystemSettingGroupEnum::APP,
            'description' => 'messages.live_chat_html_code',
        ];

        $this->createSystemSetting($systemSetting);
    }

    private function createTrackingHtmlCode(): void
    {
        $systemSetting = [
            'key' => SystemSettingKeyEnum::TRACKING_HTML_CODE,
            'value' => null,
            'type' => SystemSettingTypeEnum::TEXT,
            'group' => SystemSettingGroupEnum::APP,
            'description' => 'messages.tracking_html_code',
        ];

        $this->createSystemSetting($systemSetting);
    }

    private function createSystemSetting(array $systemSetting): void
    {
        SystemSetting::firstOrCreate(
            ['key' => $systemSetting['key']],
            $systemSetting
        );
    }
}
