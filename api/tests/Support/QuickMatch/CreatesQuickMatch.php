<?php

namespace Tests\Support\QuickMatch;

use App\Enums\Event\CricketFormatEnum;
use App\Enums\Event\MatchKindEnum;
use App\Enums\Event\MatchStatusEnum;
use App\Models\CricketMatch;
use App\Models\Team;
use App\Models\User;

trait CreatesQuickMatch
{
    /**
     * @param  array<string, mixed>  $overrides
     */
    protected function createQuickMatch(User $owner, array $overrides = []): CricketMatch
    {
        $home = Team::create([
            'name' => 'Home XI',
            'code' => 'QMH'.uniqid(),
            'user_id' => $owner->id,
            'created_by' => $owner->id,
        ]);
        $away = Team::create([
            'name' => 'Away XI',
            'code' => 'QMA'.uniqid(),
            'user_id' => $owner->id,
            'created_by' => $owner->id,
        ]);

        return CricketMatch::create(array_merge([
            'kind' => MatchKindEnum::QUICK,
            'tournament_id' => null,
            'created_by' => $owner->id,
            'cricket_format' => CricketFormatEnum::TAPE_BALL,
            'home_team_id' => $home->id,
            'away_team_id' => $away->id,
            'match_date' => now()->toDateString(),
            'match_time' => '16:00:00',
            'venue_name' => null,
            'players_per_side' => 8,
            'overs' => 10,
            'status' => MatchStatusEnum::SCHEDULED->value,
        ], $overrides));
    }
}
