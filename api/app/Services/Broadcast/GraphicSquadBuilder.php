<?php

namespace App\Services\Broadcast;

use App\Enums\User\BattingStyleEnum;
use App\Enums\User\BowlingStyleEnum;
use App\Enums\User\PlayingRoleEnum;
use App\Models\TournamentMatch;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Playing XI / squad lists for graphic overlay context.
 */
final class GraphicSquadBuilder
{
    /**
     * @return array{squad_home: list<array<string, mixed>>, squad_away: list<array<string, mixed>>}
     */
    public function buildForMatch(TournamentMatch $match): array
    {
        return [
            'squad_home' => $this->buildTeamSquad($match, (int) $match->home_team_id),
            'squad_away' => $this->buildTeamSquad($match, (int) $match->away_team_id),
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function buildTeamSquad(TournamentMatch $match, int $teamId): array
    {
        $settings = DB::table('match_team_settings')
            ->where('match_id', $match->id)
            ->where('team_id', $teamId)
            ->first();

        $captainId = $settings?->captain_id !== null ? (int) $settings->captain_id : null;
        $wkId = $settings?->wicket_keeper_id !== null ? (int) $settings->wicket_keeper_id : null;

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
                'u.avatar',
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
                    'u.avatar',
                ]);

        $disk = Storage::disk(config('filesystems.media_disk', 'public'));
        $avatarUrl = static fn (?string $path): ?string => $path ? $disk->url($path) : null;

        return $collection->map(function ($row, int $index) use ($captainId, $wkId, $avatarUrl) {
            $userId = (int) $row->user_id;
            $displayName = $row->name ?: $row->nickname ?: 'Player';

            return [
                'player_id' => $userId,
                'display_name' => $displayName,
                'playing_role' => $this->resolvePlayingRoleDisplay(
                    $row->match_playing_role ?? null,
                    $row->user_playing_role ?? null,
                ),
                'batting_style' => BattingStyleEnum::tryLabelFromValue($row->batting_style ?? null),
                'bowling_style' => BowlingStyleEnum::tryLabelFromValue($row->bowling_style ?? null),
                'is_captain' => $captainId !== null && $userId === $captainId,
                'is_wicket_keeper' => $wkId !== null && $userId === $wkId,
                'avatar_url' => $avatarUrl($row->avatar ?? null),
                'batting_order' => $index + 1,
            ];
        })->values()->all();
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
