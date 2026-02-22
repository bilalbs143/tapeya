<?php

namespace App\Http\Controllers\User;

use App\Enums\Event\CricketFormatEnum;
use App\Enums\Event\EventTypeEnum;
use App\Enums\Event\MatchTimingEnum;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class EnumController extends Controller
{
    /**
     * Return event-request enum options (value + label) for app forms.
     * Public so the form can load options before auth.
     */
    public function index(): JsonResponse
    {
        $enums = [
            'event_type' => $this->toOptions(EventTypeEnum::cases()),
            'cricket_format' => $this->toOptions(CricketFormatEnum::cases()),
            'match_timings' => $this->toOptions(MatchTimingEnum::cases()),
        ];

        return response()->json(['data' => $enums]);
    }

    /**
     * @param  array<int, \BackedEnum>  $cases
     * @return array<int, array{value: string, label: string}>
     */
    private function toOptions(array $cases): array
    {
        $options = [];

        foreach ($cases as $case) {
            $options[] = [
                'value' => $case->value,
                'label' => method_exists($case, 'label') ? $case->label() : $case->value,
            ];
        }

        return $options;
    }
}
