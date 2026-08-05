<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Common\StatusEnum;
use App\Enums\Event\CricketFormatEnum;
use App\Enums\Event\MatchStatusEnum;
use App\Enums\Event\MatchTimingEnum;
use App\Enums\Event\ShotPositionEnum;
use App\Enums\Notification\AdminNotificationTypeEnum;
use App\Enums\Push\PushNotificationStatusEnum;
use App\Enums\Push\PushTriggeredByEnum;
use App\Enums\Shop\OrderStatusEnum;
use App\Enums\Shop\ProductDiscountTypeEnum;
use App\Enums\SystemSetting\SystemSettingGroupEnum;
use App\Enums\Tournament\GroupModeEnum;
use App\Enums\Tournament\TournamentInterestCampaignStatusEnum;
use App\Enums\Tournament\TournamentInterestFormFieldEnum;
use App\Enums\Tournament\TournamentInterestSubmissionStatusEnum;
use App\Enums\Tournament\TournamentRequestStatusEnum;
use App\Enums\Tournament\TournamentScheduleWindowEnum;
use App\Enums\Tournament\TournamentTypeEnum;
use App\Enums\User\ActivePlatformEnum;
use App\Enums\User\BattingStyleEnum;
use App\Enums\User\BowlingStyleEnum;
use App\Enums\User\PlayingRoleEnum;
use App\Enums\User\RoleGuardEnum;
use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class EnumController extends Controller
{
    use BaseControllerTrait;

    /**
     * Return all enum options for admin (value + label), categorized by type.
     * Use for dynamic dropdowns in backoffice.
     */
    public function index(): JsonResponse
    {
        $enums = Cache::remember('admin:enums:v6', 600, fn () => $this->buildEnums());

        return $this->success($enums);
    }

    /**
     * @return array<string, mixed>
     */
    private function buildEnums(): array
    {
        return [
            'user_type' => $this->toOptions(UserTypeEnum::cases(), [UserTypeEnum::SYSTEM]),
            'user_status' => $this->toOptions(UserStatusEnum::cases()),
            'active_platform' => $this->toOptions(ActivePlatformEnum::cases()),
            'status' => $this->toOptions(StatusEnum::cases()),
            'playing_role' => $this->toOptions(PlayingRoleEnum::cases()),
            'bowling_style' => $this->toOptions(BowlingStyleEnum::cases()),
            'batting_style' => $this->toOptions(BattingStyleEnum::cases()),
            'order_status' => $this->toOptions(OrderStatusEnum::cases()),
            'product_discount_type' => $this->toOptions(ProductDiscountTypeEnum::cases()),
            'system_setting_group' => $this->toOptions(SystemSettingGroupEnum::cases()),
            'tournament_type' => $this->toOptions(TournamentTypeEnum::cases()),
            'tournament_schedule_window' => $this->toOptions(TournamentScheduleWindowEnum::cases()),
            'group_mode' => $this->toOptions(GroupModeEnum::cases()),
            'cricket_format' => $this->toOptions(CricketFormatEnum::cases()),
            'match_timings' => $this->toOptions(MatchTimingEnum::cases()),
            'match_status' => $this->toOptions(MatchStatusEnum::cases()),
            'tournament_request_status' => $this->toOptions(TournamentRequestStatusEnum::cases()),
            'tournament_interest_campaign_status' => $this->toOptions(TournamentInterestCampaignStatusEnum::cases()),
            'tournament_interest_submission_status' => $this->toOptions(TournamentInterestSubmissionStatusEnum::cases()),
            'tournament_interest_form_field' => $this->toOptions(TournamentInterestFormFieldEnum::cases()),
            'shot_position' => $this->toOptions(ShotPositionEnum::cases()),
            'notification_type' => $this->toOptions(AdminNotificationTypeEnum::cases()),
            'push_notification_status' => $this->toOptions(PushNotificationStatusEnum::cases()),
            'push_triggered_by' => $this->toOptions(PushTriggeredByEnum::cases()),
            'admin_roles' => Role::forGuard(RoleGuardEnum::ADMIN->value)->orderBy('name')->get()->map(fn (Role $r) => [
                'value' => (string) $r->id,
                'label' => $r->name,
                'slug' => $r->slug,
            ])->values()->all(),
        ];
    }

    /**
     * @param  array<int, \BackedEnum>  $cases
     * @param  array<int, \BackedEnum>  $exclude
     * @return array<int, array{value: string, label: string}>
     */
    private function toOptions(array $cases, array $exclude = []): array
    {
        $options = [];

        foreach ($cases as $case) {
            if (in_array($case, $exclude, true)) {
                continue;
            }

            $options[] = [
                'value' => $case->value,
                'label' => method_exists($case, 'label') ? $case->label() : $case->value,
            ];
        }

        return $options;
    }
}
