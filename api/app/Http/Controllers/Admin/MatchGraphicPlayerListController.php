<?php

namespace App\Http\Controllers\Admin;

use App\Enums\User\BattingStyleEnum;
use App\Enums\User\BowlingStyleEnum;
use App\Enums\User\PlayingRoleEnum;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Models\TournamentMatch;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MatchGraphicPlayerListController extends Controller
{
    use BaseControllerTrait;

    /**
     * Playing eleven for each side, or match squad if playing eleven is not set.
     *
     * @return array{id: int, name: string|null, players: list<array{user_id: int, name: string, playing_role: string|null, batting_style: string|null, bowling_style: string|null}>}
     */
    public function __invoke(TournamentMatch $match): JsonResponse
    {
        $match->load([
            'homeTeam',
            'awayTeam',
            'innings' => fn ($q) => $q->orderBy('innings_number'),
        ]);

        return $this->success([
            'home_team' => $this->teamPayload($match, (int) $match->home_team_id),
            'away_team' => $this->teamPayload($match, (int) $match->away_team_id),
            'innings_sides' => $match->innings->map(static fn ($i) => [
                'innings_number' => (int) $i->innings_number,
                'batting_team_id' => (int) $i->batting_team_id,
                'bowling_team_id' => (int) $i->bowling_team_id,
            ])->values()->all(),
        ]);
    }

    /**
     * @return array{id: int, name: string|null, players: list<array{user_id: int, name: string, playing_role: string|null, batting_style: string|null, bowling_style: string|null}>}
     */
    private function teamPayload(TournamentMatch $match, int $teamId): array
    {
        $team = (int) $match->home_team_id === $teamId ? $match->homeTeam : $match->awayTeam;

        $fromPlaying = DB::table('match_players as mp')
            ->join('users as u', 'u.id', '=', 'mp.user_id')
            ->where('mp.match_id', $match->id)
            ->where('mp.team_id', $teamId)
            ->orderBy('mp.id')
            ->get([
                'mp.user_id',
                'mp.playing_role as match_playing_role',
                'u.name',
                'u.nickname',
                'u.playing_role as user_playing_role',
                'u.batting_style',
                'u.bowling_style',
            ]);

        $collection = $fromPlaying->isNotEmpty()
            ? $fromPlaying
            : DB::table('match_squads as ms')
                ->join('users as u', 'u.id', '=', 'ms.user_id')
                ->where('ms.match_id', $match->id)
                ->where('ms.team_id', $teamId)
                ->orderBy('u.name')
                ->get([
                    'ms.user_id',
                    DB::raw('null as match_playing_role'),
                    'u.name',
                    'u.nickname',
                    'u.playing_role as user_playing_role',
                    'u.batting_style',
                    'u.bowling_style',
                ]);

        $players = $collection->map(function ($r) {
            $playingRoleDisplay = $this->resolvePlayingRoleDisplay(
                $r->match_playing_role ?? null,
                $r->user_playing_role ?? null,
            );

            return [
                'user_id' => (int) $r->user_id,
                'name' => $r->name ?: $r->nickname ?: 'Player',
                'playing_role' => $playingRoleDisplay,
                'batting_style' => BattingStyleEnum::tryLabelFromValue($r->batting_style ?? null),
                'bowling_style' => BowlingStyleEnum::tryLabelFromValue($r->bowling_style ?? null),
            ];
        })->values()->all();

        return [
            'id' => $teamId,
            'name' => $team?->name,
            'players' => $players,
        ];
    }

    private function resolvePlayingRoleDisplay(?string $matchRole, ?string $userRole): ?string
    {
        if ($matchRole !== null && $matchRole !== '') {
            return Str::headline(str_replace('_', ' ', (string) $matchRole));
        }

        if ($userRole === null || $userRole === '') {
            return null;
        }

        return PlayingRoleEnum::tryFrom((string) $userRole)?->label()
            ?? Str::headline(str_replace('_', ' ', (string) $userRole));
    }
}
