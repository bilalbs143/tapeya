<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Common\StatusEnum;
use App\Enums\Event\CricketFormatEnum;
use App\Enums\Event\MatchStatusEnum;
use App\Enums\Event\MatchTimingEnum;
use App\Enums\Event\ShotPositionEnum;
use App\Enums\Notification\AdminNotificationTypeEnum;
use App\Enums\Shop\OrderStatusEnum;
use App\Enums\Shop\ProductDiscountTypeEnum;
use App\Enums\Tournament\GroupModeEnum;
use App\Enums\Tournament\TournamentInterestCampaignStatusEnum;
use App\Enums\Tournament\TournamentInterestSubmissionStatusEnum;
use App\Enums\Tournament\TournamentRequestStatusEnum;
use App\Enums\Tournament\TournamentScheduleWindowEnum;
use App\Enums\Tournament\TournamentTypeEnum;
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

class EnumController extends Controller
{
    use BaseControllerTrait;

    /**
     * Return all enum options for admin (value + label), categorized by type.
     * Use for dynamic dropdowns in backoffice.
     */
    public function index(): JsonResponse
    {
        $enums = [
            'user_type' => $this->toOptions(UserTypeEnum::cases(), [UserTypeEnum::SYSTEM]),
            'user_status' => $this->toOptions(UserStatusEnum::cases()),
            'status' => $this->toOptions(StatusEnum::cases()),
            'playing_role' => $this->toOptions(PlayingRoleEnum::cases()),
            'bowling_style' => $this->toOptions(BowlingStyleEnum::cases()),
            'batting_style' => $this->toOptions(BattingStyleEnum::cases()),
            'order_status' => $this->toOptions(OrderStatusEnum::cases()),
            'product_discount_type' => $this->toOptions(ProductDiscountTypeEnum::cases()),
            'tournament_type' => $this->toOptions(TournamentTypeEnum::cases()),
            'tournament_schedule_window' => $this->toOptions(TournamentScheduleWindowEnum::cases()),
            'group_mode' => $this->toOptions(GroupModeEnum::cases()),
            'cricket_format' => $this->toOptions(CricketFormatEnum::cases()),
            'match_timings' => $this->toOptions(MatchTimingEnum::cases()),
            'match_status' => $this->toOptions(MatchStatusEnum::cases()),
            'tournament_request_status' => $this->toOptions(TournamentRequestStatusEnum::cases()),
            'tournament_interest_campaign_status' => $this->toOptions(TournamentInterestCampaignStatusEnum::cases()),
            'tournament_interest_submission_status' => $this->toOptions(TournamentInterestSubmissionStatusEnum::cases()),
            'shot_position' => $this->toOptions(ShotPositionEnum::cases()),
            'notification_type' => $this->toOptions(AdminNotificationTypeEnum::cases()),
            'app_roles' => Role::forGuard(RoleGuardEnum::APP->value)->orderBy('name')->get()->map(fn (Role $r) => [
                'value' => (string) $r->id,
                'label' => $r->name,
                'slug' => $r->slug,
            ])->values()->all(),
            'admin_roles' => Role::forGuard(RoleGuardEnum::ADMIN->value)->orderBy('name')->get()->map(fn (Role $r) => [
                'value' => (string) $r->id,
                'label' => $r->name,
                'slug' => $r->slug,
            ])->values()->all(),
        ];

        return $this->success($enums);
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
