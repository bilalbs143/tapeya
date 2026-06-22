<?php

namespace App\Services\Broadcast;

use App\Enums\Broadcast\GraphicCommandKeyEnum;
use App\Enums\User\PlayingRoleEnum;
use App\Models\TournamentMatch;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Enriches player graphic command payloads with profile fields from the users table.
 */
final class GraphicPlayerProfileEnricher
{
    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function enrichForCommandKey(array $payload, GraphicCommandKeyEnum $key, ?TournamentMatch $match = null): array
    {
        if (! $this->isPlayerCommand($key)) {
            return $payload;
        }

        $playerId = (int) ($payload['user_id'] ?? 0);
        if ($playerId <= 0) {
            return $payload;
        }

        $user = User::query()->find($playerId);
        if ($user === null) {
            return $payload;
        }

        $teamMeta = $match !== null ? $this->teamMetaForPlayer($match, $playerId) : ['team_name' => '', 'team_abbrev' => '', 'team_id' => null];
        [$firstName, $lastName] = $this->splitName((string) ($user->name ?: $user->nickname ?: ''));

        $disk = Storage::disk(config('filesystems.media_disk', 'public'));
        $avatarPath = $user->avatar ?? null;
        $avatarUrl = $avatarPath
            ? $disk->url((string) $avatarPath)
            : ($payload['player']['avatar_url'] ?? $payload['player']['image_url'] ?? null);

        $player = array_merge(is_array($payload['player'] ?? null) ? $payload['player'] : [], [
            'name' => $user->name ?: $user->nickname ?: 'Player',
            'first_name' => $firstName,
            'last_name' => $lastName,
            'batting_style' => $user->batting_style?->label(),
            'bowling_style' => $user->bowling_style?->label(),
            'role' => $this->playingRoleLabel($user->playing_role),
            'team' => $teamMeta['team_abbrev'] ?: $teamMeta['team_name'],
            'team_name' => $teamMeta['team_name'],
            'team_abbrev_display' => $teamMeta['team_abbrev'],
            'avatar_url' => $avatarUrl,
        ]);

        return array_merge($payload, [
            'player' => $player,
            'team_id' => $payload['team_id'] ?? $teamMeta['team_id'],
            'batting_style' => $player['batting_style'],
            'bowling_style' => $player['bowling_style'],
            'playing_role' => $player['role'],
        ]);
    }

    private function isPlayerCommand(GraphicCommandKeyEnum $key): bool
    {
        return in_array($key, [
            GraphicCommandKeyEnum::BATSMAN_NAME_LT,
            GraphicCommandKeyEnum::BATSMAN_NAME_FS,
            GraphicCommandKeyEnum::BATSMAN_MATCH_LT,
            GraphicCommandKeyEnum::BATSMAN_MATCH_FS,
            GraphicCommandKeyEnum::BATSMAN_TOURNAMENT_LT,
            GraphicCommandKeyEnum::BATSMAN_TOURNAMENT_FS,
            GraphicCommandKeyEnum::BOWLER_NAME_LT,
            GraphicCommandKeyEnum::BOWLER_NAME_FS,
            GraphicCommandKeyEnum::BOWLER_MATCH_LT,
            GraphicCommandKeyEnum::BOWLER_MATCH_FS,
            GraphicCommandKeyEnum::BOWLER_TOURNAMENT_LT,
            GraphicCommandKeyEnum::BOWLER_TOURNAMENT_FS,
            GraphicCommandKeyEnum::MOM,
        ], true);
    }

    /**
     * @return array{team_id: int|null, team_name: string, team_abbrev: string}
     */
    private function teamMetaForPlayer(TournamentMatch $match, int $playerId): array
    {
        $row = DB::table('match_players as mp')
            ->join('teams as t', 't.id', '=', 'mp.team_id')
            ->where('mp.match_id', $match->id)
            ->where('mp.user_id', $playerId)
            ->select(['mp.team_id', 't.name', 't.code'])
            ->first();

        if ($row === null) {
            return ['team_id' => null, 'team_name' => '', 'team_abbrev' => ''];
        }

        return [
            'team_id' => (int) $row->team_id,
            'team_name' => (string) $row->name,
            'team_abbrev' => (string) ($row->code ?: $row->name),
        ];
    }

    /** @return array{0: string, 1: string} */
    private function splitName(string $fullName): array
    {
        $fullName = trim($fullName);
        if ($fullName === '') {
            return ['', ''];
        }
        $parts = preg_split('/\s+/', $fullName) ?: [];
        if (count($parts) === 1) {
            return ['', $parts[0]];
        }

        return [array_shift($parts), implode(' ', $parts)];
    }

    private function playingRoleLabel(PlayingRoleEnum|string|null $role): ?string
    {
        if ($role === null || $role === '') {
            return null;
        }

        if ($role instanceof PlayingRoleEnum) {
            return $role->label();
        }

        return PlayingRoleEnum::tryFrom($role)?->label()
            ?? Str::headline(str_replace('_', ' ', $role));
    }
}
