<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Common\StatusEnum;
use App\Enums\Event\CricketFormatEnum;
use App\Enums\Event\EventRequestStatusEnum;
use App\Enums\Event\EventTypeEnum;
use App\Enums\Event\MatchTimingEnum;
use App\Enums\Shop\OrderStatusEnum;
use App\Enums\Shop\ProductDiscountTypeEnum;
use App\Enums\User\BattingStyleEnum;
use App\Enums\User\BowlingStyleEnum;
use App\Enums\User\PlayingRoleEnum;
use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\JsonResponse;

class EnumController extends Controller
{
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
            'event_type' => $this->toOptions(EventTypeEnum::cases()),
            'cricket_format' => $this->toOptions(CricketFormatEnum::cases()),
            'match_timings' => $this->toOptions(MatchTimingEnum::cases()),
            'event_request_status' => $this->toOptions(EventRequestStatusEnum::cases()),
            'app_roles' => Role::forGuard('app')->orderBy('name')->get()->map(fn (Role $r) => [
                'value' => (string) $r->id,
                'label' => $r->name,
                'slug' => $r->slug,
            ])->values()->all(),
        ];

        return response()->json(['data' => $enums]);
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
