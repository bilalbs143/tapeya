<?php

namespace App\Http\Controllers\User;

use App\Enums\Event\CricketFormatEnum;
use App\Enums\Event\DismissalTypeEnum;
use App\Enums\Event\ExtraTypeEnum;
use App\Enums\Event\MatchOversEnum;
use App\Enums\Event\MatchTimingEnum;
use App\Enums\Event\PlayersPerSideEnum;
use App\Enums\Event\ShotPositionEnum;
use App\Enums\Event\TossChoiceEnum;
use App\Enums\Tournament\GroupModeEnum;
use App\Enums\Tournament\TournamentTypeEnum;
use App\Enums\User\BattingStyleEnum;
use App\Enums\User\BowlingStyleEnum;
use App\Enums\User\PlayingRoleEnum;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class EnumController extends Controller
{
    /**
     * Return enum options (value + label) for app forms (tournament request, profile, etc.).
     * Public so the form can load options before auth.
     */
    public function index(): JsonResponse
    {
        $enums = [
            'tournament_type' => $this->toOptions(TournamentTypeEnum::cases()),
            'group_mode' => $this->toOptions(GroupModeEnum::cases()),
            'cricket_format' => $this->toOptions(CricketFormatEnum::cases()),
            'match_timings' => $this->toOptions(MatchTimingEnum::cases()),
            'shot_position' => $this->toOptions(ShotPositionEnum::cases()),
            'toss_choice' => $this->toOptions(TossChoiceEnum::cases()),
            'dismissal_type' => $this->toDismissalOptions(DismissalTypeEnum::cases()),
            'extra_type' => $this->toExtraTypeOptions(ExtraTypeEnum::cases()),
            'match_overs' => $this->toOptions(MatchOversEnum::cases()),
            'players_per_side' => $this->toOptions(PlayersPerSideEnum::cases()),
            'batting_style' => $this->toOptions(BattingStyleEnum::cases()),
            'bowling_style' => $this->toOptions(BowlingStyleEnum::cases()),
            'playing_role' => $this->toOptions(PlayingRoleEnum::cases()),
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

    /**
     * @param  array<int, DismissalTypeEnum>  $cases
     * @return array<int, array{value: string, label: string, requires_fielder: bool}>
     */
    private function toDismissalOptions(array $cases): array
    {
        $options = [];

        foreach ($cases as $case) {
            $options[] = [
                'value' => $case->value,
                'label' => $case->label(),
                'requires_fielder' => $case->requiresFielder(),
            ];
        }

        return $options;
    }

    /**
     * @param  array<int, ExtraTypeEnum>  $cases
     * @return array<int, array{value: string, label: string, short_label: string}>
     */
    private function toExtraTypeOptions(array $cases): array
    {
        $options = [];

        foreach ($cases as $case) {
            $options[] = [
                'value' => $case->value,
                'label' => $case->label(),
                'short_label' => $case->shortLabel(),
            ];
        }

        return $options;
    }
}
